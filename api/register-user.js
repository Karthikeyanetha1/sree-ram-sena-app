// Vercel Serverless Function: Register User Document via Firebase Admin SDK
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { name, email, role } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Missing required user registration fields.' });
  }

  try {
    const db = admin.firestore();
    const cleanEmail = String(email).trim().toLowerCase();
    const safeRole = (role === 'Collector' || role === 'collector') ? 'Collector' : 'Viewer';

    const docRef = await db.collection('users').add({
      "Full name": name,
      "Email": cleanEmail,
      "Role": safeRole,
      "Approved": false,
      "Active": true,
      "status": "Pending Approval",
      "createdAt": admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      success: true,
      id: docRef.id
    });
  } catch (err) {
    console.error('register-user API Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create user record.' });
  }
}
