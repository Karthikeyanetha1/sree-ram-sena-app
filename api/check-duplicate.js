// Vercel Serverless Function: Check Duplicate User Email or Mobile via Firebase Admin SDK
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
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  const { email, mobile } = req.query;

  const cleanEmail = email ? String(email).trim().toLowerCase() : '';
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '') : '';

  if (!cleanEmail && !cleanMobile) {
    return res.status(400).json({ success: false, error: 'Missing email or mobile query parameter.' });
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection('users').get();
    const docs = snapshot.docs.map(d => d.data());

    let foundField = null;

    for (const d of docs) {
      const docEmail = (d.Email || d.email || '').toString().trim().toLowerCase();
      const docMobile = (d.Mobile || d.mobile || '').toString().replace(/\D/g, '');

      if (cleanEmail && docEmail && docEmail === cleanEmail) {
        foundField = 'email';
        break;
      }
      if (cleanMobile && docMobile && docMobile === cleanMobile) {
        foundField = 'mobile';
        break;
      }
    }

    if (foundField) {
      return res.status(200).json({ exists: true, field: foundField });
    }

    return res.status(200).json({ exists: false });
  } catch (err) {
    console.error('check-duplicate API Error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error checking account.' });
  }
}
