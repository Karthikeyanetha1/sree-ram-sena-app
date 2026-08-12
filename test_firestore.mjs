import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

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

async function runTest() {
  console.log("1. Signing in with Super Admin email...");
  try {
    const cred = await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
    console.log("Auth Success! Logged in UID:", cred.user.uid);
  } catch (err) {
    console.error("Auth Failed:", err.message);
    return;
  }

  console.log("2. Writing test donation to Cloud Firestore 'donations' collection...");
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
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, "donations"), testDoc);
    console.log("SUCCESS! Created Firestore document ID:", docRef.id);

    console.log("3. Querying created document back from Cloud Firestore DB...");
    const q = query(collection(db, "donations"), where("receiptNo", "==", "SRS-2026-000003"));
    const snap = await getDocs(q);
    console.log("Query Results Count:", snap.docs.length);
    snap.docs.forEach(d => {
      console.log("Fetched Doc ID:", d.id, "Data:", d.data());
    });
  } catch (err) {
    console.error("Firestore Write Failed:", err);
  }
}

runTest();
