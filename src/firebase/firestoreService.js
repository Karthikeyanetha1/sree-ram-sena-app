// Firestore Real-Time Sync Service with robust offline fallback support

let db = null;
let firestoreLib = null;

async function initFirestore() {
  if (db) return db;
  try {
    const { db: initializedDb } = await import('./config');
    db = initializedDb;
    firestoreLib = await import('firebase/firestore');
    return db;
  } catch (err) {
    console.warn("Firebase Firestore SDK initialization fallback:", err.message);
    return null;
  }
}

/**
 * Real-time Sync helper for Donations to Firestore
 */
export async function syncDonationToFirestore(donation) {
  try {
    const firestoreDb = await initFirestore();
    if (firestoreDb && firestoreLib) {
      const { doc, setDoc, serverTimestamp } = firestoreLib;
      const ref = doc(firestoreDb, 'donations', donation.id || donation.receiptNo);
      await setDoc(ref, {
        ...donation,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log("Donation synced to Firestore:", donation.receiptNo);
    }
  } catch (err) {
    console.warn("Firestore donation sync offline fallback active:", err.message);
  }
}

/**
 * Real-time Sync helper for Expenses to Firestore
 */
export async function syncExpenseToFirestore(expense) {
  try {
    const firestoreDb = await initFirestore();
    if (firestoreDb && firestoreLib) {
      const { doc, setDoc, serverTimestamp } = firestoreLib;
      const ref = doc(firestoreDb, 'expenses', expense.id || expense.voucherNo);
      await setDoc(ref, {
        ...expense,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log("Expense synced to Firestore:", expense.voucherNo);
    }
  } catch (err) {
    console.warn("Firestore expense sync offline fallback active:", err.message);
  }
}

/**
 * Real-time Sync helper for Registered Users & Approvals to Firestore
 */
export async function syncUserToFirestore(user) {
  try {
    const firestoreDb = await initFirestore();
    if (firestoreDb && firestoreLib) {
      const { doc, setDoc, serverTimestamp } = firestoreLib;
      const ref = doc(firestoreDb, 'users', user.id);
      await setDoc(ref, {
        ...user,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log("User status synced to Firestore:", user.name);
    }
  } catch (err) {
    console.warn("Firestore user sync offline fallback active:", err.message);
  }
}

/**
 * Subscribe to Real-time Donations Stream
 */
export function subscribeToDonationsStream(callback) {
  let unsubscribeFn = () => {};
  initFirestore().then((firestoreDb) => {
    if (firestoreDb && firestoreLib) {
      try {
        const { collection, query, onSnapshot } = firestoreLib;
        const q = query(collection(firestoreDb, 'donations'));
        unsubscribeFn = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (docs.length > 0) callback(docs);
        }, (err) => {
          console.warn("Firestore stream listener fallback to LocalStorage:", err.message);
        });
      } catch (err) {
        console.warn("Firestore listener not available:", err.message);
      }
    }
  });

  return () => unsubscribeFn();
}
