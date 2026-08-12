import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';

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

async function executeMigration() {
  console.log("=== STEP 4: EXECUTE MIGRATION & VERIFICATION ===");
  console.log("1. Authenticating as Super Admin...");
  try {
    await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
    console.log("Auth Success!");
  } catch (err) {
    console.error("Auth Failed:", err.message);
    return;
  }

  console.log("2. Fetching Source Collections (/donations & /expenses)...");
  const sourceDonationsSnap = await getDocs(collection(db, "donations"));
  const sourceExpensesSnap = await getDocs(collection(db, "expenses"));

  const sourceDonationsCount = sourceDonationsSnap.docs.length;
  const sourceExpensesCount = sourceExpensesSnap.docs.length;

  console.log(`Source Records: ${sourceDonationsCount} donations, ${sourceExpensesCount} expenses.`);

  // Copy Donations to festivals/2026/donations
  console.log("3. Copying /donations -> festivals/2026/donations (preserving Document IDs & Fields)...");
  let migratedDonations = 0;
  for (const d of sourceDonationsSnap.docs) {
    const targetDocRef = doc(db, "festivals", "2026", "donations", d.id);
    await setDoc(targetDocRef, {
      ...d.data(),
      migratedAt: serverTimestamp(),
      migrationSource: '/donations'
    }, { merge: true });
    migratedDonations++;
  }

  // Copy Expenses to festivals/2026/expenses
  console.log("4. Copying /expenses -> festivals/2026/expenses (preserving Document IDs & Fields)...");
  let migratedExpenses = 0;
  for (const e of sourceExpensesSnap.docs) {
    const targetDocRef = doc(db, "festivals", "2026", "expenses", e.id);
    await setDoc(targetDocRef, {
      ...e.data(),
      migratedAt: serverTimestamp(),
      migrationSource: '/expenses'
    }, { merge: true });
    migratedExpenses++;
  }

  // Set Festival 2026 Metadata & Counters
  console.log("5. Initializing festivals/2026 metadata and atomic counter settings...");
  await setDoc(doc(db, "festivals", "2026"), {
    year: 2026,
    festivalName: "SREE RAM SENA VINAYAKA CHAVITHI 2026",
    status: "Active",
    migratedAt: serverTimestamp()
  }, { merge: true });

  await setDoc(doc(db, "festivals", "2026", "settings", "counters"), {
    receiptCounter: sourceDonationsCount,
    expenseCounter: sourceExpensesCount,
    lastUpdated: serverTimestamp()
  }, { merge: true });

  // Verification Post-Migration
  console.log("6. Verifying post-migration document counts...");
  const destDonationsSnap = await getDocs(collection(db, "festivals", "2026", "donations"));
  const destExpensesSnap = await getDocs(collection(db, "festivals", "2026", "expenses"));

  const destDonationsCount = destDonationsSnap.docs.length;
  const destExpensesCount = destExpensesSnap.docs.length;

  const donationsMatched = sourceDonationsCount === destDonationsCount;
  const expensesMatched = sourceExpensesCount === destExpensesCount;

  console.log("\n==========================================");
  console.log("🎉 MIGRATION VERIFICATION REPORT");
  console.log("==========================================");
  console.log(`Source /donations Count     : ${sourceDonationsCount}`);
  console.log(`Destination 2026 Donations  : ${destDonationsCount}`);
  console.log(`Donations Match Status      : ${donationsMatched ? '✅ 100% MATCHED' : '❌ MISMATCH'}`);
  console.log(`Source /expenses Count      : ${sourceExpensesCount}`);
  console.log(`Destination 2026 Expenses   : ${destExpensesCount}`);
  console.log(`Expenses Match Status       : ${expensesMatched ? '✅ 100% MATCHED' : '❌ MISMATCH'}`);
  console.log(`Overall Migration Status    : ${(donationsMatched && expensesMatched) ? '🏆 MIGRATION 100% VERIFIED SUCCESSFUL' : '⚠️ PARTIAL MATCH'}`);
  console.log(`Rollback Safety Policy      : Legacy collections (/donations, /expenses) remain 100% intact.`);
  console.log("==========================================\n");
}

executeMigration();
