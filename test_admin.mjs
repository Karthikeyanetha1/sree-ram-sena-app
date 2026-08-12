import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    projectId: 'donation-book-91111'
  });
}

const db = getFirestore();

async function runAdminTest() {
  console.log("Writing to Cloud Firestore DB via Firebase Admin SDK...");
  const testDoc = {
    receiptNo: "SRS-2026-000003",
    "Receipt No": "SRS-2026-000003",
    donorName: "kjhgfd",
    "Donor Name": "kjhgfd",
    amount: 7894,
    "Amount": 7894,
    mobile: "7894561230",
    village: "Govindhupalli",
    paymentMethod: "UPI",
    notes: "Vinayaka Chavithi Donation",
    collector: "Gurram Karthikeya",
    date: "2026-08-11",
    time: "02:20 PM",
    verified: true,
    createdAt: FieldValue.serverTimestamp()
  };

  try {
    const docRef = await db.collection('donations').add(testDoc);
    console.log("SUCCESS! Admin SDK created document ID:", docRef.id);
  } catch (err) {
    console.error("Admin SDK Write Note:", err.message);
  }
}

runAdminTest();
