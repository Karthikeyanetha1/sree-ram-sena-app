import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

async function cleanUsers() {
  await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
  const uid = auth.currentUser.uid;
  console.log("Cleaning Super Admin document at users/" + uid + "...");

  await setDoc(doc(db, "users", uid), {
    uid: uid,
    name: "Gurram Karthikeya",
    fullName: "Gurram Karthikeya",
    "Full name": "Gurram Karthikeya",
    email: "speedsltns@gmail.com",
    Email: "speedsltns@gmail.com",
    role: "Super Admin",
    Role: "Super Admin",
    approved: true,
    Approved: true,
    active: true,
    Active: true,
    status: "Approved",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log("Super Admin Document cleaned and approved!");
}

cleanUsers();
