import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

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

async function syncDonations() {
  await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
  console.log("Syncing all subcollection festivals/2026/donations to root /donations...");

  const subSnap = await getDocs(collection(db, "festivals", "2026", "donations"));
  for (const docSnap of subSnap.docs) {
    const dData = docSnap.data();
    await setDoc(doc(db, "donations", docSnap.id), dData, { merge: true });
    console.log(`✓ Synced ${docSnap.id} (${dData.receiptNo || dData['Receipt No']}) to root /donations`);
  }

  console.log("All 13 donations are now synced to root /donations!");
}

syncDonations();
