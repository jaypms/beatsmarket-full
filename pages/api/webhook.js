import { buffer } from 'micro';
import * as admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import Stripe from 'stripe';
import { sendLicensePDF } from '../../lib/pdfSender'; // à créer si pas encore
import { deleteBeatFromFirestore } from '../../lib/deleteBeat'; // à créer aussi

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!getApps().length) {
  initializeApp();
}

const webhookHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Erreur signature webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const metadata = session.metadata;

    const beatId = metadata.beatId;
    const typeLicence = metadata.typeLicence;
    const acheteurEmail = metadata.acheteurEmail;
    const buyerName = metadata.buyerName;
    const beatTitle = metadata.beatTitle;
    const prix
