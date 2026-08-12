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

async function runRestTest() {
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

  console.log("2. Writing test document via Firestore REST API...");
  const restUrl = `https://firestore.googleapis.com/v1/projects/donation-book-91111/databases/(default)/documents/donations`;
  
  const payload = {
    fields: {
      receiptNo: { stringValue: "SRS-2026-000003" },
      "Receipt No": { stringValue: "SRS-2026-000003" },
      donorName: { stringValue: "kjhgfd" },
      "Donor Name": { stringValue: "kjhgfd" },
      amount: { doubleValue: 7894 },
      "Amount": { doubleValue: 7894 },
      mobile: { stringValue: "7894561230" },
      village: { stringValue: "Govindhupalli" },
      paymentMethod: { stringValue: "UPI" },
      notes: { stringValue: "Vinayaka Chavithi Donation" },
      collector: { stringValue: "Gurram Karthikeya" },
      date: { stringValue: "2026-08-11" },
      time: { stringValue: "02:20 PM" },
      verified: { booleanValue: true }
    }
  };

  try {
    const res = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("REST Response Status:", res.status);
    console.log("REST Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("REST Request Error:", err);
  }
}

runRestTest();
