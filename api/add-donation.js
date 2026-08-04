// Vercel Serverless Function: Save Donation directly to Cloud Firestore DB via Firebase Admin SDK
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK safely
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'donation-book-91111',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'donation-book-91111'
      });
    }
  } catch (e) {
    console.warn('Firebase Admin Init Note:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { donation } = req.body || {};

  if (!donation || !donation.donorName || !donation.amount) {
    return res.status(400).json({ success: false, error: 'Missing donation details (donorName, amount required).' });
  }

  try {
    const db = admin.firestore();

    const formattedAmount = parseFloat(donation.amount) || 0;
    const nowISO = new Date().toISOString();
    const dateStr = donation.date || new Date().toISOString().split('T')[0];

    // Dual-casing document fields to ensure 100% compatibility with all Firestore rules & legacy formats
    const firestoreDoc = {
      receiptNo: donation.receiptNo,
      'Receipt No': donation.receiptNo,
      donorName: donation.donorName,
      'Donor Name': donation.donorName,
      amount: formattedAmount,
      'Amount': formattedAmount,
      amountInWords: donation.amountInWords || `${formattedAmount} Rupees Only`,
      mobile: donation.mobile || 'N/A',
      'Mobile': donation.mobile || 'N/A',
      village: donation.village || 'Govindhupalli',
      'Village': donation.village || 'Govindhupalli',
      paymentMethod: donation.paymentMethod || 'UPI',
      'Payment Method': donation.paymentMethod || 'UPI',
      notes: donation.notes || 'Vinayaka Chavithi Donation',
      'Notes': donation.notes || 'Vinayaka Chavithi Donation',
      collector: donation.collector || 'karthiknetha',
      'Collector': donation.collector || 'karthiknetha',
      date: dateStr,
      'Date': dateStr,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdIso: nowISO
    };

    const docRef = await db.collection('donations').add(firestoreDoc);

    return res.status(200).json({
      success: true,
      id: docRef.id,
      receiptNo: donation.receiptNo,
      message: 'Donation saved successfully to Cloud Firestore DB!'
    });
  } catch (err) {
    console.error('add-donation API Error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save donation to Firestore DB.' });
  }
}
