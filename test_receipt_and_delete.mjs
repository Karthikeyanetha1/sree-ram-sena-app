import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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

async function testReceipts() {
  console.log("=== CHECKING ALL DONATIONS IN FIRESTORE FOR RECEIPT NUMBERS ===");
  
  // 1. Root /donations
  const rootSnap = await getDocs(collection(db, "donations"));
  console.log(`\nRoot /donations count: ${rootSnap.docs.length}`);
  rootSnap.docs.forEach(d => {
    console.log(`  - Root Doc ${d.id}: ReceiptNo=${d.data().receiptNo || d.data()['Receipt No']}, Amount=₹${d.data().amount || d.data().Amount}, Donor=${d.data().donorName || d.data()['Donor Name']}`);
  });

  // 2. Subcollection festivals/2026/donations
  const subSnap = await getDocs(collection(db, "festivals", "2026", "donations"));
  console.log(`\nSubcollection festivals/2026/donations count: ${subSnap.docs.length}`);
  subSnap.docs.forEach(d => {
    console.log(`  - Sub Doc ${d.id}: ReceiptNo=${d.data().receiptNo || d.data()['Receipt No']}, Amount=₹${d.data().amount || d.data().Amount}, Donor=${d.data().donorName || d.data()['Donor Name']}`);
  });
}

testReceipts();
