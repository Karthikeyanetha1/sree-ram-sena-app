import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, runTransaction, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhZf-EHoRsBSi7gAf5Rc8sfCkRFwW9OFE",
  authDomain: "donation-book-91111.firebaseapp.com",
  databaseURL: "https://donation-book-91111-default-rtdb.firebaseio.com",
  projectId: "donation-book-91111",
  storageBucket: "donation-book-91111.firebasestorage.app",
  messagingSenderId: "709634868850",
  appId: "1:709634868850:web:3d8d457afe1bf187fca4eb",
  measurementId: "G-RYL7P8W5G6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runConcurrentTest() {
  console.log("=== STEP 6: ATOMIC RECEIPT COUNTER CONCURRENCY TEST ===");
  console.log("1. Authenticating as Super Admin...");
  try {
    await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
    console.log("Auth Success!");
  } catch (err) {
    console.error("Auth Failed:", err.message);
    return;
  }

  const year = "2026";
  const numConcurrentRequests = 5;
  console.log(`2. Simulating ${numConcurrentRequests} SIMULTANEOUS concurrent donation entries...`);

  const createConcurrentDonation = async (index) => {
    let nextCount = 1;
    const counterRef = doc(db, "festivals", year, "settings", "counters");
    
    await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      if (counterSnap.exists()) {
        const currentCounter = counterSnap.data().receiptCounter || 0;
        nextCount = currentCounter + 1;
      } else {
        nextCount = 1;
      }
      transaction.set(counterRef, { receiptCounter: nextCount, lastUpdated: serverTimestamp() }, { merge: true });
    });

    const padCount = String(nextCount).padStart(6, '0');
    const receiptNo = `SRS-${year}-${padCount}`;

    const docObj = {
      receiptNo,
      "Receipt No": receiptNo,
      donorName: `Concurrent Devotee #${index + 1}`,
      amount: 1000 + (index * 100),
      paymentStatus: "Successful",
      collector: "Concurrent Test Runner",
      createdAt: serverTimestamp()
    };

    const colRef = collection(db, "festivals", year, "donations");
    const docRef = await addDoc(colRef, docObj);
    return { receiptNo, docId: docRef.id, index };
  };

  // Trigger all requests simultaneously via Promise.all
  const startTime = Date.now();
  const results = await Promise.all(
    Array.from({ length: numConcurrentRequests }, (_, i) => createConcurrentDonation(i))
  );
  const endTime = Date.now();

  console.log(`\nConcurrency execution completed in ${endTime - startTime}ms.`);
  console.log("Generated Receipt Numbers:");
  const generatedReceiptNos = results.map(r => r.receiptNo);
  generatedReceiptNos.forEach(r => console.log(" - " + r));

  // Check for duplicates
  const uniqueReceiptNos = new Set(generatedReceiptNos);
  const isZeroDuplicates = uniqueReceiptNos.size === generatedReceiptNos.length;

  console.log("\n==========================================");
  console.log("📊 ATOMIC COUNTER CONCURRENCY TEST REPORT");
  console.log("==========================================");
  console.log(`Total Concurrent Requests   : ${numConcurrentRequests}`);
  console.log(`Unique Receipts Generated   : ${uniqueReceiptNos.size}`);
  console.log(`Duplicate Receipt Count     : ${generatedReceiptNos.length - uniqueReceiptNos.size}`);
  console.log(`Concurrency Safety Verdict  : ${isZeroDuplicates ? '🏆 VERIFIED 100% ZERO DUPLICATES SAFE' : '❌ CONCURRENCY FAILURE'}`);
  console.log("==========================================\n");
}

runConcurrentTest();
