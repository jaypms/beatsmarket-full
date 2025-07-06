import { buffer } from 'micro';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { sendLicenseEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const storage = admin.storage();

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { beatId, utilisateurId, licence } = session.metadata;

    // Récupération du beat
    const beatRef = db.collection('battements').doc(beatId);
    const beatSnap = await beatRef.get();
    const beat = beatSnap.data();

    // Génération de la licence PDF
    const buyerEmail = session.customer_email;
    await sendLicenseEmail({
      to: buyerEmail,
      beatTitle: beat.titre,
      producerName: beat.nomBeatmaker || 'Beatmaker inconnu',
      licenceType: licence,
    });

    // Suppression du beat si exclusif
    if (licence === 'exclusif') {
      await beatRef.delete();

      const file = storage.bucket().file(`battements/${beat.fichierNom}`);
      await file.delete().catch(() => {});
    }
  }

  res.status(200).json({ received: true });
}
