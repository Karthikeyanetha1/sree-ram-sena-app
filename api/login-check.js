// Vercel Serverless Function: Lockout & Failed Attempt Tracker via Firebase Admin SDK
import admin from 'firebase-admin';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, email, mobile } = req.body || req.query || {};

  const cleanInput = (email || mobile || '').toString().trim().toLowerCase();

  if (!cleanInput) {
    return res.status(400).json({ success: false, error: 'Missing email or mobile identifier.' });
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection('users').get();
    const targetDoc = snapshot.docs.find(d => {
      const data = d.data();
      const docEmail = (data.Email || data.email || '').toString().toLowerCase();
      const docMobile = (data.Mobile || data.mobile || '').toString().replace(/\D/g, '');
      return docEmail === cleanInput || docMobile === cleanInput.replace(/\D/g, '');
    });

    if (!targetDoc) {
      return res.status(200).json({ status: 'not_found' });
    }

    const docRef = db.collection('users').doc(targetDoc.id);
    const data = targetDoc.data();

    const now = Date.now();
    const lockedUntil = data.lockedUntil ? (typeof data.lockedUntil === 'number' ? data.lockedUntil : new Date(data.lockedUntil).getTime()) : 0;

    // Check Lockout
    if (action === 'check_lock') {
      if (lockedUntil > now) {
        const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
        return res.status(200).json({ locked: true, remainingSeconds, lockedUntil });
      }
      return res.status(200).json({ locked: false, failedAttempts: data.failedLoginAttempts || 0 });
    }

    // Record Failed Login Attempt
    if (action === 'failed_attempt') {
      const currentFail = (data.failedLoginAttempts || 0) + 1;
      const updates = { failedLoginAttempts: currentFail };

      if (currentFail >= 5) {
        const lockTime = now + (15 * 60 * 1000); // 15 minutes lockout
        updates.lockedUntil = lockTime;
        await docRef.update(updates);
        return res.status(200).json({ locked: true, remainingSeconds: 900, failedAttempts: currentFail });
      }

      await docRef.update(updates);
      return res.status(200).json({ locked: false, failedAttempts: currentFail });
    }

    // Record Successful Login (Reset Lockout)
    if (action === 'success') {
      await docRef.update({
        failedLoginAttempts: 0,
        lockedUntil: null
      });
      return res.status(200).json({ success: true, failedAttempts: 0 });
    }

    return res.status(400).json({ success: false, error: 'Invalid action.' });

  } catch (err) {
    console.error('login-check API Error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error checking login lockout status.' });
  }
}
