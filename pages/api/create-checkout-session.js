import Stripe from 'stripe';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Méthode non autorisée');

  const { beatId, buyerEmail } = req.body;

  try {
    const beatRef = doc(db, 'battements', beatId);
    const beatSnap = await getDoc(beatRef);

    if (!beatSnap.exists()) return res.status(404).json({ error: 'Beat introuvable' });

    const beat = beatSnap.data();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: buyerEmail,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: beat.titre,
            description: `Style: ${beat.style}, BPM: ${beat.bpm}`,
          },
          unit_amount: beat.prix * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/beat/${beatId}`,
      metadata: {
        beatId,
        utilisateurId: beat.utilisateurId,
        licence: beat.licence || 'non-exclusive',
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur Stripe' });
  }
}
