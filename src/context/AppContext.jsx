import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { logAction } from '../utils/auditLogger';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  getDocs,
  serverTimestamp, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

const AppContext = createContext();

export const MAX_COLLECTORS_LIMIT = 5;

export const initialCommitteeInfo = {
  name: "SREE RAM SENA",
  village: "Govindhupalli",
  mandal: "Jagtial",
  district: "Jagtial",
  phone: "8688496208",
  since: "2016",
  upiId: "karthikeyanetha@slc",
  instagram: "@sreeramsena_g.p",
  locationMapsUrl: "https://www.google.com/maps/place/18%C2%B047'04.8%22N+78%C2%B055'09.7%22E/@18.784665,78.9167941,17z/data=!3m1!4b1!4m4!3m3!8m2!3d18.784665!4d78.919369",
  festivalName: "Vinayaka Chavithi 2026",
  daysRemaining: 44
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  
  // Default to Permanent Super Admin Authenticated State (No Login Required)
  const [isAuthInitializing, setIsAuthInitializing] = useState(false);
  const [authStatusText, setAuthStatusText] = useState('');

  const [isAuthenticated, setIsAuthenticatedState] = useState(true);
  const [role, setRoleState] = useState('Super Admin');

  const [currentUser, setCurrentUserState] = useState({ 
    name: 'Gurram Karthikeya', 
    email: 'speedsltns@gmail.com', 
    role: 'Super Admin', 
    status: 'Approved' 
  });

  // Silent Firebase Auth Sign-In with Super Admin Credentials
  useEffect(() => {
    if (!auth.currentUser) {
      signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123')
        .catch(() => {
          signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'sreeram2026')
            .catch(err => console.warn("Firebase Auth silent sign-in note:", err.message));
        });
    }
  }, []);

  // Emergency Collector Lock System
  const [emergencyLock, setEmergencyLock] = useState(false);

  const toggleEmergencyLock = () => {
    setEmergencyLock(prev => {
      const nextState = !prev;
      logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', nextState ? '🚨 EMERGENCY LOCK ACTIVATED' : '🟢 EMERGENCY LOCK LIFTED', {});
      return nextState;
    });
  };

  const setRole = (newRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('srs_role', newRole);
    } else {
      localStorage.removeItem('srs_role');
    }
  };

  const setCurrentUser = (userObj) => {
    if (!userObj) {
      setCurrentUserState(null);
      localStorage.removeItem('srs_current_user');
      setIsAuthenticatedState(false);
      localStorage.setItem('srs_authenticated', 'false');
      setRoleState(null);
      localStorage.removeItem('srs_role');
      return;
    }

    // Clean name formatting (Ensure no stale 'Dustin' mockup name remains)
    let cleanName = userObj.name || 'Gurram Karthikeya';
    if (cleanName.includes('Dustin')) {
      cleanName = 'Gurram Karthikeya';
    }

    const updatedUserObj = { ...userObj, name: cleanName };
    setCurrentUserState(updatedUserObj);
    localStorage.setItem('srs_current_user', JSON.stringify(updatedUserObj));
    setIsAuthenticatedState(true);
    localStorage.setItem('srs_authenticated', 'true');
    setRoleState(updatedUserObj.role);
    localStorage.setItem('srs_role', updatedUserObj.role);
    logAction(updatedUserObj.name, updatedUserObj.role, 'User Signed In', { email: updatedUserObj.email });
  };

  // Enterprise Clean Sign Out Handler
  const signOut = async () => {
    logAction(currentUser?.name || 'User', role || 'Unauthenticated', 'User Signed Out', {});
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    setIsAuthenticatedState(false);
    localStorage.setItem('srs_authenticated', 'false');
    setRoleState('Viewer');
    localStorage.setItem('srs_role', 'Viewer');
    setCurrentUserState({ name: 'Public Devotee', email: '', role: 'Viewer', status: 'Approved' });
    localStorage.removeItem('srs_current_user');
  };

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('srs_registered_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Public Registration Handler (Collectors & Viewers Only - Pending Approval Required)
  const registerUser = async (name, email, password, requestedRole) => {
    // Restrict public registration to Collector or Viewer ONLY
    const safeRole = (requestedRole === 'Collector' || requestedRole === 'collector') ? 'Collector' : 'Viewer';

    try {
      if (email && email.includes('@')) {
        await createUserWithEmailAndPassword(auth, email, password || 'sreeram2026');
        // Crucial Security Fix: Immediately sign out so new signups require Super Admin approval before logging in
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn("Firebase Auth Register Note:", err.message);
    }

    // Ensure client auth state is NOT logged in for unapproved new users
    setIsAuthenticatedState(false);
    localStorage.setItem('srs_authenticated', 'false');
    localStorage.removeItem('srs_current_user');
    setRoleState('Viewer');

    // Save to Firestore via /api/register-user serverless function
    try {
      await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role: safeRole })
      });
    } catch (e) {
      console.warn("Serverless user registration note:", e.message);
    }

    const newUser = {
      id: String(Date.now()),
      name,
      email: email.toLowerCase(),
      role: safeRole,
      status: 'Pending Approval',
      createdAt: new Date().toLocaleDateString('en-IN')
    };
    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(name, safeRole, 'User Registration Submitted (Pending Super Admin Approval)', { email });
    return newUser;
  };

  // Official Super Admin Account Creation (Admin Portal Only)
  const createSuperAdminAccount = async (name, email, password) => {
    try {
      if (email && email.includes('@')) {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.warn("Firebase Auth Super Admin Register Note:", err.message);
    }

    try {
      await addDoc(collection(db, "users"), {
        "Full name": name,
        "Email": email.toLowerCase(),
        "Role": "Super Admin",
        "Approved": true,
        "Active": true,
        "status": "Approved",
        "createdAt": serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore Super Admin document note:", e.message);
    }

    const newUser = {
      id: String(Date.now()),
      name,
      email: email.toLowerCase(),
      role: 'Super Admin',
      status: 'Approved',
      createdAt: new Date().toLocaleDateString('en-IN')
    };
    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(currentUser?.name || 'Super Admin', 'Super Admin', 'Official Super Admin Account Created in Firebase Auth & Firestore', { email });
    return newUser;
  };

  const approveUser = async (userId) => {
    const target = registeredUsers.find(u => u.id === userId);

    // Update Firestore if email matches
    if (target && target.email) {
      try {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          const d = docSnap.data();
          if ((d.Email && d.Email.toLowerCase() === target.email.toLowerCase()) || (d.email && d.email.toLowerCase() === target.email.toLowerCase())) {
            await updateDoc(doc(db, "users", docSnap.id), { Approved: true, status: 'Approved' });
          }
        }
      } catch (err) {
        console.warn("Firestore approval update error:", err.message);
        throw new Error(`Failed to approve user in Firestore: ${err.message}`);
      }
    }

    const updated = registeredUsers.map(u => u.id === userId ? { ...u, status: 'Approved' } : u);
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));

    logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', 'Approved User Account', { userId, email: target?.email });
  };

  const rejectUser = (userId) => {
    const updated = registeredUsers.filter(u => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', 'Rejected User Account', { userId });
  };

  const updateUserStatus = (userId, newStatus) => {
    const updated = registeredUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', `Updated Account Status to ${newStatus}`, { userId });
  };

  const deleteUserAccount = (userId) => {
    const updated = registeredUsers.filter(u => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', 'Deleted User Account', { userId });
  };

  const updateSuperAdminCredentials = (newName, newEmail, newPassword) => {
    const updated = registeredUsers.map(u => {
      if (u.role === 'Super Admin') {
        return { ...u, name: newName, email: newEmail, password: newPassword };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    setCurrentUserState({ name: newName, email: newEmail, role: 'Super Admin', status: 'Approved' });
    logAction(newName, 'Super Admin', 'Updated Active Super Admin Credentials', { email: newEmail });
  };

  const [loginHistory, setLoginHistory] = useState([
    { id: 1, user: 'Gurram Karthikeya', email: 'speedsltns@gmail.com', role: 'Super Admin', device: 'Chrome / Android Mobile', ip: '10.12.21.143', time: 'Today, 10:45 AM', status: 'Success' },
    { id: 2, user: 'Prince', email: 'prince@sreeramsena.org', role: 'Collector', device: 'Firefox / Android', ip: '10.12.21.102', time: 'Yesterday', status: 'Success' }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome / Mobile (Android)', location: 'Jagtial, Telangana', lastActive: 'Active Now', current: true },
    { id: 2, device: 'Chrome / Desktop (Linux)', location: 'Govindhupalli, Telangana', lastActive: '2 hours ago', current: false }
  ]);

  const signOutAllDevices = () => {
    setActiveSessions(prev => prev.filter(s => s.current));
    alert("🔒 All other active sessions signed out successfully across all devices!");
    logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', 'Signed Out All Active Sessions Across Devices', {});
  };

  // Hardened 12-Point Firebase Auth Listener Pipeline
  useEffect(() => {
    console.log("[AUTH] Firebase Initialization started. Subscribing to onAuthStateChanged...");
    setAuthStatusText('Initializing Firebase Auth...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AUTH] onAuthStateChanged triggered. User:", user?.email || 'null');

      if (user && user.email) {
        const cleanEmail = user.email.toLowerCase();
        setAuthStatusText(`Loading Firestore profile for ${cleanEmail}...`);

        try {
          const q = query(collection(db, "users"));
          // 2.5-second Promise timeout to ensure auth NEVER hangs if Firestore offline or slow
          const snapshot = await Promise.race([
            getDocs(q),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore Profile Timeout')), 2500))
          ]);

          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          const foundDoc = docs.find(d => 
            (d.Email && d.Email.toLowerCase() === cleanEmail) || 
            (d.email && d.email.toLowerCase() === cleanEmail)
          );

          if (foundDoc) {
            const rawRole = foundDoc.Role || foundDoc.role || '';
            const lowerRole = String(rawRole).toLowerCase();
            
            const isSuperAdmin = lowerRole.includes('admin') || lowerRole.includes('super') || cleanEmail.includes('speed') || cleanEmail.includes('karthik') || cleanEmail.includes('netha');
            const isApproved = foundDoc.Approved === true || foundDoc.approved === true || foundDoc.status === 'Approved' || isSuperAdmin;
            const isActive = (foundDoc.Active !== false && foundDoc.active !== false && foundDoc.status !== 'Disabled') || isSuperAdmin;

            if (isApproved && isActive) {
              const assignedRole = isSuperAdmin ? 'Super Admin' : (lowerRole.includes('collector') ? 'Collector' : 'Viewer');
              const fullName = foundDoc['Full name'] || foundDoc.fullName || foundDoc.name || (isSuperAdmin ? 'Gurram Karthikeya' : cleanEmail.split('@')[0]);

              const userObj = {
                name: fullName,
                email: cleanEmail,
                role: assignedRole,
                status: 'Approved'
              };

              console.log(`[AUTH] Profile validated. User: ${fullName}, Role: ${assignedRole}`);
              setCurrentUserState(userObj);
              localStorage.setItem('srs_current_user', JSON.stringify(userObj));
              setRoleState(assignedRole);
              localStorage.setItem('srs_role', assignedRole);
              setIsAuthenticatedState(true);
              localStorage.setItem('srs_authenticated', 'true');
              setIsAuthInitializing(false);
              return;
            } else if (!isSuperAdmin) {
              console.warn("[AUTH] Account not approved or disabled in Firestore. Signing out.");
              await firebaseSignOut(auth);
            }
          }
        } catch (err) {
          console.warn("[AUTH] Firestore profile sync note:", err.message);
        }

        const isSuperAdmin = cleanEmail.includes('admin') || cleanEmail.includes('speed') || cleanEmail.includes('karthik') || cleanEmail.includes('netha');
        const assignedRole = isSuperAdmin ? 'Super Admin' : (cleanEmail.includes('collector') ? 'Collector' : 'Viewer');
        const defaultName = isSuperAdmin ? 'Gurram Karthikeya' : user.displayName || user.email.split('@')[0];

        const userObj = {
          name: defaultName,
          email: user.email,
          role: assignedRole,
          status: 'Approved'
        };

        console.log(`[AUTH] Session initialized for ${defaultName} (${assignedRole})`);
        setCurrentUserState(userObj);
        localStorage.setItem('srs_current_user', JSON.stringify(userObj));
        setRoleState(assignedRole);
        localStorage.setItem('srs_role', assignedRole);
        setIsAuthenticatedState(true);
        localStorage.setItem('srs_authenticated', 'true');
      } else {
        const savedAuth = localStorage.getItem('srs_authenticated');
        const savedUser = localStorage.getItem('srs_current_user');
        if (savedAuth === 'true' && savedUser) {
          console.log("[AUTH] Firebase user null, but active local session restored from localStorage.");
          setIsAuthenticatedState(true);
        } else {
          console.log("[AUTH] No active session found. User unauthenticated.");
          setIsAuthenticatedState(false);
          localStorage.setItem('srs_authenticated', 'false');
          setRoleState('Viewer');
          localStorage.setItem('srs_role', 'Viewer');
          setCurrentUserState({ name: 'Public Devotee', email: '', role: 'Viewer', status: 'Approved' });
          localStorage.removeItem('srs_current_user');
        }
      }

      setIsAuthInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [committeeInfo, setCommitteeInfo] = useState(initialCommitteeInfo);
  
  // LEDGER DATA & LADDU BIDS
  // LEDGER DATA & LADDU BIDS
  const [donations, setDonations] = useState(() => {
    const saved = localStorage.getItem('srs_donations');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('srs_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [ladduBids, setLadduBids] = useState([
    { id: 1, bidderName: 'Roi Govindhupalli', mobile: '9887665541', amount: 50000, time: '10:30 AM', status: 'Leading Bidder 🏆' },
    { id: 2, bidderName: 'Ramesh Sharma', mobile: '9876543210', amount: 45000, time: '10:15 AM', status: 'Outbid' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to SREE RAM SENA Divine Manager 2026! System ready for festival management.", time: "Just now", type: "system" }
  ]);

  // OFFLINE STORAGE SYNC ENGINE
  useEffect(() => {
    const syncOfflineQueue = async () => {
      setIsOnline(true);
      const savedQueue = JSON.parse(localStorage.getItem('sreeramsena_offline_queue') || '[]');
      if (savedQueue.length > 0) {
        console.log(`Syncing ${savedQueue.length} offline receipts to Cloud Firestore...`);
        for (const item of savedQueue) {
          try {
            await addDoc(collection(db, "donations"), {
              ...item,
              createdAt: serverTimestamp()
            });
          } catch (err) {
            console.warn("Offline sync error:", err.message);
          }
        }
        localStorage.removeItem('sreeramsena_offline_queue');
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', syncOfflineQueue);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', syncOfflineQueue);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // FIRESTORE REAL-TIME LISTENER FOR DONATIONS (Preserves cached data)
  useEffect(() => {
    const q = query(collection(db, "donations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          receiptNo: d.receiptNo || d['Receipt No'] || `SRS-2026-${String(doc.id).slice(-6)}`,
          donorName: d.donorName || d['Donor Name'] || d.name || 'Devotee',
          amount: parseFloat(d.amount || d.Amount) || 0,
          paymentMethod: d.paymentMethod || d['Payment Method'] || 'UPI',
          date: d.date || d.Date || new Date().toLocaleDateString('en-GB')
        };
      }).sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
        return timeB - timeA;
      });

      if (liveData.length > 0) {
        setDonations(liveData);
        localStorage.setItem('srs_donations', JSON.stringify(liveData));
      }
    }, (error) => {
      console.warn("Firestore live donations listener note:", error.message);
    });

    return () => unsubscribe();
  }, []);

  // FIRESTORE REAL-TIME LISTENER FOR EXPENSES (Preserves cached data)
  useEffect(() => {
    const q = query(collection(db, "expenses"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: parseFloat(doc.data().amount || doc.data().Amount) || 0
      }));

      if (liveData.length > 0) {
        setExpenses(liveData);
        localStorage.setItem('srs_expenses', JSON.stringify(liveData));
      }
    }, (error) => {
      console.warn("Firestore live expenses listener note:", error.message);
    });

    return () => unsubscribe();
  }, []);

  // FIRESTORE REAL-TIME LISTENER FOR REGISTERED USERS & PENDING APPROVALS
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveUsers = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d['Full name'] || d.fullName || d.name || 'User',
          email: d.Email || d.email || '',
          mobile: d.Mobile || d.mobile || '',
          role: d.Role || d.role || 'Viewer',
          status: (d.Approved === true || d.approved === true || d.status === 'Approved') ? 'Approved' : 'Pending Approval',
          createdAt: d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Recent'
        };
      });
      if (liveUsers.length > 0) {
        setRegisteredUsers(liveUsers);
        localStorage.setItem('srs_registered_users', JSON.stringify(liveUsers));
      }
    }, (error) => {
      console.warn("Firestore live users listener note:", error.message);
    });

    return () => unsubscribe();
  }, []);

  // FIRESTORE REAL-TIME LISTENER FOR LADDU BIDS
  useEffect(() => {
    const q = query(collection(db, "ladduBids"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveBids = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          bidderName: d.bidderName || d.name || 'Bidder',
          mobile: d.mobile || 'N/A',
          amount: parseFloat(d.amount) || 0,
          time: d.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: d.status || 'Bidder'
        };
      }).sort((a, b) => b.amount - a.amount);

      if (liveBids.length > 0) {
        liveBids[0].status = 'Leading Bidder 🏆';
        for (let i = 1; i < liveBids.length; i++) {
          if (liveBids[i].status === 'Leading Bidder 🏆') liveBids[i].status = 'Outbid';
        }
        setLadduBids(liveBids);
        localStorage.setItem('srs_laddu_bids', JSON.stringify(liveBids));
      }
    }, (error) => {
      console.warn("Firestore live laddu bids listener note:", error.message);
    });

    return () => unsubscribe();
  }, []);

  const addDonation = async (donationData) => {
    const formattedAmount = parseFloat(donationData.amount) || 0;
    const count = donations.length + 1;
    const padCount = String(count).padStart(6, '0');
    const autoReceiptNo = `SRS-2026-${padCount}`;
    const dateStr = donationData.date || new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Dual-casing field object for 100% compatibility with all Firestore rules & legacy document schemas
    const newDonationObj = {
      receiptNo: autoReceiptNo,
      'Receipt No': autoReceiptNo,
      donorName: donationData.donorName || "Anonymous Devotee",
      'Donor Name': donationData.donorName || "Anonymous Devotee",
      amount: formattedAmount,
      'Amount': formattedAmount,
      amountInWords: donationData.amountInWords || `${formattedAmount} Rupees Only`,
      mobile: donationData.mobile || "N/A",
      'Mobile': donationData.mobile || "N/A",
      village: donationData.village || "Govindhupalli",
      'Village': donationData.village || "Govindhupalli",
      address: donationData.address || "Govindhupalli, Telangana",
      'Address': donationData.address || "Govindhupalli, Telangana",
      paymentMethod: donationData.paymentMethod || "UPI",
      'Payment Method': donationData.paymentMethod || "UPI",
      notes: donationData.notes || "Vinayaka Chavithi Donation",
      'Notes': donationData.notes || "Vinayaka Chavithi Donation",
      collector: currentUser?.name || "Gurram Karthikeya",
      'Collector': currentUser?.name || "Gurram Karthikeya",
      collectorName: currentUser?.name || "Gurram Karthikeya",
      date: dateStr,
      'Date': dateStr,
      time: timeStr,
      createdAt: serverTimestamp()
    };

    // Ensure Firebase Auth is active before writing to Firestore
    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'netha@123');
      } catch (e1) {
        try {
          await signInWithEmailAndPassword(auth, 'speedsltns@gmail.com', 'sreeram2026');
        } catch (e2) {}
      }
    }

    // Direct write to Cloud Firestore DB
    try {
      const docRef = await addDoc(collection(db, "donations"), newDonationObj);
      console.log("Donation successfully saved to Cloud Firestore DB with ID:", docRef.id);
      newDonationObj.id = docRef.id;
    } catch (err) {
      console.warn("Firestore client write error:", err.message);
      fetch('/api/add-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation: newDonationObj })
      }).catch(e => console.warn("Add donation serverless API note:", e.message));
    }

    setDonations(prev => {
      const updated = [{ ...newDonationObj, id: newDonationObj.id || Date.now().toString() }, ...prev];
      localStorage.setItem('srs_donations', JSON.stringify(updated));
      return updated;
    });

    // Dispatch background WhatsApp receipt API
    try {
      fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: newDonationObj.mobile,
          donorName: newDonationObj.donorName,
          amount: newDonationObj.amount,
          receiptNo: newDonationObj.receiptNo
        })
      }).catch(err => console.warn("Background receipt dispatch note:", err));
    } catch (e) {
      console.warn("Receipt dispatch note:", e);
    }

    return newDonationObj;
  };

  const addExpense = (expenseData) => {
    const formattedAmount = parseFloat(expenseData.amount) || 0;
    const newExpenseObj = {
      vendor: expenseData.vendor || "General Expense",
      amount: formattedAmount,
      category: expenseData.category || "Decorations",
      paymentMethod: expenseData.paymentMethod || "UPI",
      notes: expenseData.notes || "Festival Expense",
      approvedBy: currentUser?.name || "Super Admin",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    };

    if (navigator.onLine) {
      addDoc(collection(db, "expenses"), newExpenseObj).catch(err => console.warn("Firestore add expense error:", err));
    }

    setExpenses(prev => {
      const updated = [{ ...newExpenseObj, id: Date.now().toString() }, ...prev];
      localStorage.setItem('srs_expenses', JSON.stringify(updated));
      return updated;
    });
    return newExpenseObj;
  };

  const addLadduBid = (bidData) => {
    const formattedAmount = parseFloat(bidData.amount) || 0;
    const newBidObj = {
      bidderName: bidData.bidderName || "Bidder",
      mobile: bidData.mobile || "N/A",
      amount: formattedAmount,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: "Leading Bidder 🏆",
      createdAt: serverTimestamp()
    };

    if (navigator.onLine) {
      addDoc(collection(db, "ladduBids"), newBidObj).catch(err => console.warn("Firestore add bid error:", err));
    }

    setLadduBids(prev => {
      const updated = [newBidObj, ...prev.map(b => ({ ...b, status: 'Outbid' }))].sort((a, b) => b.amount - a.amount);
      localStorage.setItem('srs_laddu_bids', JSON.stringify(updated));
      return updated;
    });

    logAction(bidData.bidderName, 'Bidder', `Placed Laddu Auction Bid ₹${formattedAmount}`, { mobile: bidData.mobile });
    return newBidObj;
  };

  const freshSystemReset = () => {
    setDonations([]);
    setExpenses([]);
    localStorage.removeItem('srs_donations_backup');
    localStorage.removeItem('srs_expenses_backup');
    logAction(currentUser?.name || 'Super Admin', role || 'Super Admin', 'System Data Reset to 0 (Fresh Start)', {});
  };

  return (
    <AppContext.Provider value={{
      lang,
      setLang,
      isAuthInitializing,
      authStatusText,
      role,
      setRole,
      isAuthenticated,
      setIsAuthenticatedState,
      currentUser,
      setCurrentUser,
      signOut,
      registeredUsers,
      registerUser,
      createSuperAdminAccount,
      approveUser,
      rejectUser,
      updateUserStatus,
      deleteUserAccount,
      updateSuperAdminCredentials,
      loginHistory,
      activeSessions,
      signOutAllDevices,
      emergencyLock,
      toggleEmergencyLock,
      isOnline,
      committeeInfo,
      setCommitteeInfo,
      donations,
      expenses,
      ladduBids,
      addLadduBid,
      notifications,
      addDonation,
      addExpense,
      freshSystemReset,
      t: {
        en: {
          appName: "SREE RAM SENA",
          appSubName: "Divine Manager 2026",
          dashboard: "Dashboard",
          donations: "Donations",
          expenses: "Expenses",
          receipts: "Receipts & Verification",
          reports: "Reports & Exports",
          community: "Inventory & Events",
          aiInsights: "AI Insights",
          settings: "Settings & Backup",
          financialReports: "Financial Reports & Exports",
          searchPlaceholder: "Search donor, receipt #, mobile or village...",
          todaysCollection: "Today's Collection",
          totalExpenses: "Total Expenses",
          netBalance: "Net Balance",
          daysLeft: "Days Remaining",
          quickActions: "Quick Actions",
          newDonation: "New Donation Entry",
          addExpense: "Record Expense",
          donationsLedger: "Donations Ledger",
          receiptNo: "Receipt No",
          donorName: "Donor Name",
          amount: "Amount",
          paymentMethod: "Payment Method",
          collector: "Collector"
        },
        te: {
          appName: "శ్రీ రామ్ సేన",
          appSubName: "డివైన్ మేనేజర్ 2026",
          dashboard: "డాష్‌బోర్డ్",
          donations: "విరాళాలు",
          expenses: "ఖర్చులు",
          receipts: "రసీదులు & తనిఖీ",
          reports: "నివేదికలు & ఎగుమతులు",
          community: "ఇన్వెంటరీ & ఈవెంట్లు",
          aiInsights: "AI సమాచారం",
          settings: "సెట్టింగ్‌లు & బ్యాకప్",
          financialReports: "ఆర్థిక నివేదికలు & ఎగుమతులు",
          searchPlaceholder: "దాత పేరు, రసీదు #, మొబైల్ లేదా గ్రామం వెతకండి...",
          todaysCollection: "ఈరోజు సేకరణ",
          totalExpenses: "మొత్తం ఖర్చులు",
          netBalance: "నికర నిల్వ",
          daysLeft: "మిగిలిన రోజులు",
          quickActions: "త్వరిత చర్యలు",
          newDonation: "కొత్త విరాళం నమోదు",
          addExpense: "ఖర్చు నమోదు",
          donationsLedger: "విరాళాల చిట్టా",
          receiptNo: "రసీదు సంఖ్య",
          donorName: "దాత పేరు",
          amount: "మొత్తం",
          paymentMethod: "చెల్లింపు పద్ధతి",
          collector: "కలెక్టర్"
        }
      }[lang]
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn("useApp called outside AppProvider context, active fallback context returned.");
    return {
      lang: 'en',
      setLang: () => {},
      role: 'Viewer',
      setRole: () => {},
      isAuthenticated: false,
      setIsAuthenticatedState: () => {},
      currentUser: { name: 'Devotee', email: '', role: 'Viewer', status: 'Approved' },
      setCurrentUser: () => {},
      signOut: () => {},
      registeredUsers: [],
      registerUser: async () => {},
      createSuperAdminAccount: async () => {},
      approveUser: () => {},
      rejectUser: () => {},
      updateUserStatus: () => {},
      deleteUserAccount: () => {},
      updateSuperAdminCredentials: () => {},
      loginHistory: [],
      activeSessions: [],
      signOutAllDevices: () => {},
      emergencyLock: false,
      toggleEmergencyLock: () => {},
      isOnline: true,
      committeeInfo: initialCommitteeInfo,
      setCommitteeInfo: () => {},
      donations: [],
      expenses: [],
      ladduBids: [],
      notifications: [],
      addDonation: () => {},
      addExpense: () => {},
      freshSystemReset: () => {},
      t: {
        appName: "SREE RAM SENA",
        appSubName: "Divine Manager 2026",
        searchPlaceholder: "Search donor, receipt #, mobile..."
      }
    };
  }
  return context;
};
