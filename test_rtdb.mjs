import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

async function runRtdbTest() {
  console.log("1. Signing in with Super Admin email...");
  let idToken = "";
  try {
    const cred = await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
    idToken = await cred.user.getIdToken();
    console.log("Auth Success! ID Token obtained.");
  } catch (err) {
    console.error("Auth Failed:", err.message);
    return;
  }

  console.log("2. Writing test document via Realtime Database REST API...");
  const rtdbUrl = `https://donation-book-91111-default-rtdb.firebaseio.com/donations.json?auth=${idToken}`;
  
  const payload = {
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
    verified: true
  };

  try {
    const res = await fetch(rtdbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("RTDB Response Status:", res.status);
    console.log("RTDB Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("RTDB Request Error:", err);
  }
}

runRtdbTest();
