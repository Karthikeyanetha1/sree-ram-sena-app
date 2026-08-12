import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, getDocs, serverTimestamp } from 'firebase/firestore';

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

async function runLadduAuctionTest() {
  console.log("=== LADDU AUCTION WINNER HISTORY MODULE VERIFICATION ===");
  console.log("1. Authenticating as Super Admin...");
  try {
    await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
    console.log("Auth Success!");
  } catch (err) {
    console.error("Auth Failed:", err.message);
    return;
  }

  // Test 1: Add Winner for 2025
  console.log("\n2. Adding 2025 Winner (Ravi Kumar — ₹1,10,000)...");
  const win2025Ref = await addDoc(collection(db, "festivals", "2025", "ladduAuction"), {
    winnerName: "Ravi Kumar",
    winningAmount: 110000,
    village: "Govindhupalli",
    auctionDate: "2025-09-27",
    festivalYear: "2025",
    status: "Active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log("2025 Winner Doc Created ID:", win2025Ref.id);

  // Wait 1 sec for server timestamp difference
  await new Promise(r => setTimeout(r, 1000));

  // Test 2: Add 1st Winner for 2026
  console.log("\n3. Adding 1st 2026 Winner (Suresh Kumar — ₹1,75,000)...");
  const win2026_1Ref = await addDoc(collection(db, "festivals", "2026", "ladduAuction"), {
    winnerName: "Suresh Kumar",
    winningAmount: 175000,
    village: "Govindhupalli",
    auctionDate: "2026-09-14",
    festivalYear: "2026",
    status: "Active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log("2026 1st Winner Doc Created ID:", win2026_1Ref.id);

  await new Promise(r => setTimeout(r, 1000));

  // Test 3: Add 2nd Winner for 2026
  console.log("\n4. Adding 2nd 2026 Winner (Ramesh Kumar — ₹2,00,000)...");
  const win2026_2Ref = await addDoc(collection(db, "festivals", "2026", "ladduAuction"), {
    winnerName: "Ramesh Kumar",
    winningAmount: 200000,
    village: "Jagtial",
    auctionDate: "2026-09-14",
    festivalYear: "2026",
    status: "Active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log("2026 2nd Winner Doc Created ID:", win2026_2Ref.id);

  // Query 2026 Laddu Auction
  console.log("\n5. Querying festivals/2026/ladduAuction (Ordered DESC by createdAt)...");
  const snap2026 = await getDocs(collection(db, "festivals", "2026", "ladduAuction"));
  const docs2026 = snap2026.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.status !== 'Archived')
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return timeB - timeA;
    });

  console.log("2026 Winners Count:", docs2026.length);
  console.log("TOP Banner Winner (Newest Entry) :", docs2026[0]?.winnerName, "— ₹" + docs2026[0]?.winningAmount);
  console.log("Historical Entry #2              :", docs2026[1]?.winnerName, "— ₹" + docs2026[1]?.winningAmount);

  // Query 2025 Laddu Auction
  console.log("\n6. Querying festivals/2025/ladduAuction for Lower Banner...");
  const snap2025 = await getDocs(collection(db, "festivals", "2025", "ladduAuction"));
  const docs2025 = snap2025.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.status !== 'Archived')
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return timeB - timeA;
    });

  console.log("LOWER BANNER Winner (2025 Latest) :", docs2025[0]?.winnerName, "— ₹" + docs2025[0]?.winningAmount);

  const topCorrect = docs2026[0]?.winnerName === "Ramesh Kumar";
  const historyPreserved = docs2026.length === 2 && docs2026[1]?.winnerName === "Suresh Kumar";
  const lowerCorrect = docs2025[0]?.winnerName === "Ravi Kumar";

  console.log("\n==========================================");
  console.log("📊 LADDU AUCTION MODULE VERIFICATION REPORT");
  console.log("==========================================");
  console.log(`Top Banner (2026 Latest Winner) : ${topCorrect ? '✅ PASSED (Ramesh Kumar — ₹2,00,000)' : '❌ FAILED'}`);
  console.log(`History Ledger Preservation      : ${historyPreserved ? '✅ PASSED (Suresh Kumar preserved in history)' : '❌ FAILED'}`);
  console.log(`Lower Banner (2025 Previous)     : ${lowerCorrect ? '✅ PASSED (Ravi Kumar — ₹1,10,000)' : '❌ FAILED'}`);
  console.log(`Overall Module Verdict           : ${(topCorrect && historyPreserved && lowerCorrect) ? '🏆 VERIFIED 100% SUCCESSFUL' : '❌ FAILED'}`);
  console.log("==========================================\n");
}

runLadduAuctionTest();
