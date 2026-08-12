import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function runDryRun() {
  console.log("=== STEP 3: MIGRATION DRY RUN PREVIEW ===");
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

  console.log("3. Fetching Destination Collections (festivals/2026/donations & festivals/2026/expenses)...");
  const destDonationsSnap = await getDocs(collection(db, "festivals", "2026", "donations"));
  const destExpensesSnap = await getDocs(collection(db, "festivals", "2026", "expenses"));

  console.log("\n==========================================");
  console.log("📊 DRY RUN MIGRATION PREVIEW REPORT");
  console.log("==========================================");
  console.log(`Source /donations Count     : ${sourceDonationsSnap.docs.length}`);
  console.log(`Source /expenses Count      : ${sourceExpensesSnap.docs.length}`);
  console.log(`Destination 2026 Donations  : ${destDonationsSnap.docs.length}`);
  console.log(`Destination 2026 Expenses   : ${destExpensesSnap.docs.length}`);
  console.log(`Records To Migrate (Donations): ${sourceDonationsSnap.docs.length}`);
  console.log(`Records To Migrate (Expenses) : ${sourceExpensesSnap.docs.length}`);
  console.log("Target Destination Path    : festivals/2026/donations & festivals/2026/expenses");
  console.log("Safety Backup Policy        : Legacy collections (/donations, /expenses) will remain 100% untouched as rollback backups.");
  console.log("==========================================\n");
}

runDryRun();
