import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

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

async function runAuthVerification() {
  console.log("=== 3-STATE AUTHENTICATION & AUTHORIZATION PIPELINE AUDIT ===");

  // 1. Authenticate with Firebase Auth
  console.log("\n1. Testing Firebase Auth Sign In for Super Admin...");
  try {
    const cred = await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
    const user = cred.user;
    console.log("Auth Success! Firebase User UID:", user.uid, "Email:", user.email);

    // 2. Test Firestore /users/{uid} Authorization Doc
    console.log("\n2. Checking Firestore Authorization Claims for UID:", user.uid);
    let userDocSnap = await getDoc(doc(db, "users", user.uid));
    let userData = userDocSnap.exists() ? userDocSnap.data() : null;

    if (!userData) {
      console.log("Document by UID not found, searching by email in /users...");
      const snap = await getDocs(collection(db, "users"));
      const found = snap.docs.find(d => (d.data().email && d.data().email.toLowerCase() === user.email.toLowerCase()) || (d.data().Email && d.data().Email.toLowerCase() === user.email.toLowerCase()));
      if (found) {
        userData = found.data();
        console.log("Migrating profile doc to users/" + user.uid + "...");
        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          uid: user.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Doc successfully linked to UID", user.uid);
      }
    }

    console.log("User Profile Document Claims:");
    console.log("  - Full Name:", userData?.['Full name'] || userData?.name);
    console.log("  - Role     :", userData?.role || userData?.Role);
    console.log("  - Approved :", userData?.approved ?? userData?.Approved);
    console.log("  - Active   :", userData?.active ?? userData?.Active ?? true);

    const isApproved = userData?.approved === true || userData?.Approved === true;
    const isActive = userData?.active === true || userData?.Active === true || userData?.status === 'Approved';

    console.log("\n3. Evaluating Strict Authorization Rules:");
    console.log("  - approved === true :", isApproved ? "✅ PASSED" : "❌ FAILED");
    console.log("  - active === true   :", isActive ? "✅ PASSED" : "❌ FAILED");
    console.log("  - Overall Authorized:", (isApproved && isActive) ? "✅ GRANTED ROLE " + (userData?.role || 'Super Admin') : "❌ BLOCKED");

    // 4. Sign out
    await signOut(auth);
    console.log("\n4. Signed Out! Current Auth User:", auth.currentUser ? auth.currentUser.email : "null (UNAUTHENTICATED)");

  } catch (err) {
    console.error("Auth Pipeline Verification Error:", err.message);
  }

  console.log("\n==========================================");
  console.log("📊 3-STATE AUTHENTICATION AUDIT COMPLETE");
  console.log("==========================================\n");
}

runAuthVerification();
