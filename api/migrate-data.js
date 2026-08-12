// Vercel Serverless Function: Zero-Data-Loss Migration Engine (festivals/2026/*)
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { dryRun, execute } = req.query;
  const isExecuteMode = execute === 'true';

  try {
    const db = admin.firestore();

    // 1. Fetch Source Collections (/donations and /expenses)
    const sourceDonationsSnap = await db.collection('donations').get();
    const sourceExpensesSnap = await db.collection('expenses').get();

    const sourceDonationsCount = sourceDonationsSnap.docs.length;
    const sourceExpensesCount = sourceExpensesSnap.docs.length;

    // 2. Fetch Destination Collections (festivals/2026/donations and festivals/2026/expenses)
    const destDonationsRef = db.collection('festivals').doc('2026').collection('donations');
    const destExpensesRef = db.collection('festivals').doc('2026').collection('expenses');

    const destDonationsSnapBefore = await destDonationsRef.get();
    const destExpensesSnapBefore = await destExpensesRef.get();

    const destDonationsCountBefore = destDonationsSnapBefore.docs.length;
    const destExpensesCountBefore = destExpensesSnapBefore.docs.length;

    // Dry Run Mode
    if (!isExecuteMode) {
      return res.status(200).json({
        success: true,
        mode: 'DRY_RUN_PREVIEW',
        message: 'Dry run completed successfully. No records were modified or copied.',
        source: {
          donationsCount: sourceDonationsCount,
          expensesCount: sourceExpensesCount,
          sampleDonationDocIds: sourceDonationsSnap.docs.slice(0, 3).map(d => d.id)
        },
        destinationBefore: {
          donationsCount: destDonationsCountBefore,
          expensesCount: destExpensesCountBefore
        },
        plan: {
          recordsToMigrateDonations: sourceDonationsCount,
          recordsToMigrateExpenses: sourceExpensesCount,
          targetPathDonations: 'festivals/2026/donations',
          targetPathExpenses: 'festivals/2026/expenses',
          safetyPolicy: 'Original root collections (/donations, /expenses) will remain untouched as rollback backups.'
        }
      });
    }

    // Execute Migration Mode
    console.log(`[MIGRATION] Executing migration: ${sourceDonationsCount} donations, ${sourceExpensesCount} expenses -> festivals/2026/*`);

    // Migrate Donations in Batches of 400
    let migratedDonations = 0;
    let donationBatch = db.batch();
    let batchCounter = 0;

    for (const doc of sourceDonationsSnap.docs) {
      const docData = doc.data();
      const targetDocRef = destDonationsRef.doc(doc.id);
      donationBatch.set(targetDocRef, {
        ...docData,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        migrationSource: '/donations'
      }, { merge: true });

      batchCounter++;
      migratedDonations++;

      if (batchCounter >= 400) {
        await donationBatch.commit();
        donationBatch = db.batch();
        batchCounter = 0;
      }
    }
    if (batchCounter > 0) {
      await donationBatch.commit();
    }

    // Migrate Expenses
    let migratedExpenses = 0;
    let expenseBatch = db.batch();
    batchCounter = 0;

    for (const doc of sourceExpensesSnap.docs) {
      const docData = doc.data();
      const targetDocRef = destExpensesRef.doc(doc.id);
      expenseBatch.set(targetDocRef, {
        ...docData,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        migrationSource: '/expenses'
      }, { merge: true });

      batchCounter++;
      migratedExpenses++;

      if (batchCounter >= 400) {
        await expenseBatch.commit();
        expenseBatch = db.batch();
        batchCounter = 0;
      }
    }
    if (batchCounter > 0) {
      await expenseBatch.commit();
    }

    // Verify Destination Counts Post-Migration
    const destDonationsSnapAfter = await destDonationsRef.get();
    const destExpensesSnapAfter = await destExpensesRef.get();

    const destDonationsCountAfter = destDonationsSnapAfter.docs.length;
    const destExpensesCountAfter = destExpensesSnapAfter.docs.length;

    const donationsMatched = sourceDonationsCount === destDonationsCountAfter;
    const expensesMatched = sourceExpensesCount === destExpensesCountAfter;

    // Set Festival 2026 Metadata & Counter Initialization
    await db.collection('festivals').doc('2026').set({
      year: 2026,
      festivalName: 'SREE RAM SENA VINAYAKA CHAVITHI 2026',
      status: 'Active',
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await db.collection('festivals').doc('2026').collection('settings').doc('counters').set({
      receiptCounter: destDonationsCountAfter,
      expenseCounter: destExpensesCountAfter,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.status(200).json({
      success: true,
      mode: 'EXECUTION_COMPLETE',
      verification: {
        donationsMatched,
        expensesMatched,
        status: (donationsMatched && expensesMatched) ? 'MIGRATION VERIFIED 100% SUCCESSFUL' : 'MIGRATION PARTIAL MATCH'
      },
      counts: {
        sourceDonations: sourceDonationsCount,
        destinationDonations: destDonationsCountAfter,
        sourceExpenses: sourceExpensesCount,
        destinationExpenses: destExpensesCountAfter
      },
      safety: {
        legacyDonationsPreserved: true,
        legacyExpensesPreserved: true
      }
    });

  } catch (err) {
    console.error('[MIGRATION] Migration error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Migration execution failed.' });
  }
}
