// Vercel Serverless Function: Fetch Public Receipt Details via Firebase Admin SDK
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
  // CORS Headers for public receipt viewing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  const { receiptNo } = req.query;

  if (!receiptNo) {
    return res.status(400).json({ success: false, error: 'Missing receiptNo query parameter.' });
  }

  try {
    const db = admin.firestore();
    let snapshot = await db.collection('donations')
      .where('receiptNo', '==', String(receiptNo).trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      snapshot = await db.collection('donations')
        .where('Receipt No', '==', String(receiptNo).trim())
        .limit(1)
        .get();
    }

    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    const docData = snapshot.docs[0].data();

    // Sanitize and expose ONLY public-facing receipt fields
    const publicDonation = {
      id: snapshot.docs[0].id,
      receiptNo: docData.receiptNo || receiptNo,
      donorName: docData.donorName || docData['Donor Name'] || docData.name || 'Devotee',
      amount: docData.amount || docData.Amount || 0,
      date: docData.date || docData.Date || '',
      paymentMethod: docData.paymentMethod || docData['Payment Method'] || 'UPI',
      village: docData.village || docData.Village || 'Govindhupalli',
      address: docData.address || docData.Address || '',
      mobile: docData.mobile || docData.Mobile || '',
      notes: docData.notes || docData.Notes || '',
      status: docData.status || docData.Status || 'Verified',
      collectorName: docData.collectorName || docData.collector || docData['Collector'] || 'SREE RAM SENA'
    };

    return res.status(200).json({
      success: true,
      donation: publicDonation
    });
  } catch (err) {
    console.error('get-receipt API Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve receipt details.' });
  }
}
