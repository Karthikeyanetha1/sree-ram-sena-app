import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
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
  orderBy 
} from 'firebase/firestore';

const AppContext = createContext();

export const MAX_COLLECTORS_LIMIT = 5;

export const initialCommitteeInfo = {
  name: "SREE RAM SENA",
  village: "Govindhupalli",
  mandal: "Jagtial",
  district: "Jagtial",
  state: "Telangana",
  pincode: "505455",
  address: "Near Church, Govindhupalli, Jagtial, Telangana - 505455",
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
  
  // Persisted Auth State
  const [isAuthenticated, setIsAuthenticatedState] = useState(() => {
    const savedAuth = localStorage.getItem('srs_authenticated');
    return savedAuth !== 'false'; // Defaults to authenticated initial view or saved session
  });

  const [role, setRoleState] = useState(() => {
    return localStorage.getItem('srs_role') || 'Super Admin';
  });

  const [currentUser, setCurrentUserState] = useState(() => {
    const saved = localStorage.getItem('srs_current_user');
    return saved ? JSON.parse(saved) : { name: 'Gurram Karthikeya (Super Admin)', email: 'karthikeyanetha7@gmail.com', role: 'Super Admin' };
  });

  const setRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem('srs_role', newRole);
  };

  const setCurrentUser = (userObj) => {
    setCurrentUserState(userObj);
    localStorage.setItem('srs_current_user', JSON.stringify(userObj));
    setIsAuthenticatedState(true);
    localStorage.setItem('srs_authenticated', 'true');
    logAction(userObj.name, userObj.role, 'User Signed In', { email: userObj.email });
  };

  const signOut = () => {
    logAction(currentUser?.name || 'User', role, 'User Signed Out', {});
    setIsAuthenticatedState(false);
    localStorage.setItem('srs_authenticated', 'false');
    setRole('Viewer');
    setCurrentUserState({ name: 'Public Visitor', email: '', role: 'Viewer' });
    localStorage.removeItem('srs_current_user');
  };

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('srs_registered_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Gurram Karthikeya', email: 'karthikeyanetha7@gmail.com', role: 'Super Admin', status: 'Approved' },
      { id: '2', name: 'Ramesh Kumar', email: 'ramesh@sreeramsena.org', role: 'Collector', status: 'Approved' }
    ];
  });

  const registerUser = (name, email, requestedRole) => {
    const newUser = {
      id: String(Date.now()),
      name,
      email,
      role: requestedRole,
      status: 'Pending Approval',
      createdAt: new Date().toLocaleDateString('en-IN')
    };
    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(name, requestedRole, 'User Registration Requested', { email });
    return newUser;
  };

  const approveUser = (userId) => {
    const updated = registeredUsers.map(u => u.id === userId ? { ...u, status: 'Approved' } : u);
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(currentUser?.name || 'Super Admin', role, 'Approved User Account', { userId });
  };

  const rejectUser = (userId) => {
    const updated = registeredUsers.filter(u => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem('srs_registered_users', JSON.stringify(updated));
    logAction(currentUser?.name || 'Super Admin', role, 'Rejected User Account', { userId });
  };

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [committeeInfo, setCommitteeInfo] = useState(initialCommitteeInfo);
  
  // LEDGER DATA & LADDU BIDS
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [ladduBids, setLadduBids] = useState([
    { id: 1, bidderName: 'Roi Govindhupalli', mobile: '9887665541', amount: 50000, time: '10:30 AM', status: 'Leading Bidder 🏆' },
    { id: 2, bidderName: 'Ramesh Sharma', mobile: '9876543210', amount: 45000, time: '10:15 AM', status: 'Outbid' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to SREE RAM SENA Divine Manager 2026! System reset to 0 for fresh festival setup.", time: "Just now", type: "system" }
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
        setNotifications(prev => [{
          id: Date.now(),
          text: `📶 Network Restored: ${savedQueue.length} offline receipts automatically synced to Cloud Firestore!`,
          time: "Just now",
          type: "system"
        }, ...prev]);
        logAction('System', 'Offline Engine', 'Offline Queue Synced', { count: savedQueue.length });
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

  // Firebase Realtime Listener for Donations
  useEffect(() => {
    try {
      const q = query(collection(db, "donations"), orderBy("receiptNo", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveDonations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDonations(liveDonations);
      }, (error) => {
        console.warn("Firestore subscription note:", error.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase connection error:", err.message);
    }
  }, []);

  // AUTO RECEIPT NUMBER GENERATOR (SRS-2026-000001)
  const getNextReceiptNo = () => {
    const yearPrefix = "SRS-2026";
    if (donations.length === 0) {
      return `${yearPrefix}-000001`;
    }
    const maxNum = donations.reduce((max, d) => {
      const parts = d.receiptNo ? d.receiptNo.split('-') : [];
      const num = parts.length === 3 ? parseInt(parts[2], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `${yearPrefix}-${String(maxNum + 1).padStart(6, '0')}`;
  };

  // ADD DONATION
  const addDonation = (donationData) => {
    const receiptNo = getNextReceiptNo();
    const today = new Date().toISOString().split('T')[0];

    const newDonation = {
      receiptNo,
      donorName: donationData.donorName || 'Devotee',
      mobile: donationData.mobile || '9999999999',
      village: donationData.village || 'Govindhupalli',
      address: donationData.address || 'Govindhupalli, Jagtial',
      amount: parseFloat(donationData.amount) || 0,
      paymentMethod: donationData.paymentMethod || 'UPI',
      collectorName: currentUser?.name || 'Gurram Karthikeya (Super Admin)',
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verified: true,
      notes: donationData.notes || 'Vinayaka Chavithi Seva Donation'
    };

    setDonations(prev => [newDonation, ...prev]);

    // Async push to Cloud Firestore
    if (navigator.onLine) {
      try {
        addDoc(collection(db, "donations"), {
          ...newDonation,
          createdAt: serverTimestamp()
        }).then(res => {
          newDonation.id = res.id;
        }).catch(err => {
          console.warn("Firestore add warning:", err.message);
        });
      } catch (err) {
        console.warn("Firestore collection error:", err.message);
      }
    } else {
      const savedQueue = JSON.parse(localStorage.getItem('sreeramsena_offline_queue') || '[]');
      savedQueue.push(newDonation);
      localStorage.setItem('sreeramsena_offline_queue', JSON.stringify(savedQueue));
    }

    logAction(currentUser?.name || 'Collector', role, 'Created Donation Receipt', { receiptNo, amount: newDonation.amount, donor: newDonation.donorName });

    setNotifications(prev => [{
      id: Date.now(),
      text: `New donation receipt ${receiptNo} created for ₹${newDonation.amount} (${newDonation.donorName})`,
      time: "Just now",
      type: "donation"
    }, ...prev]);

    return newDonation;
  };

  // ADD LADDU BID
  const addLadduBid = (bidData) => {
    const newBid = {
      id: Date.now(),
      bidderName: bidData.bidderName,
      mobile: bidData.mobile,
      amount: parseFloat(bidData.amount),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Leading Bidder 🏆'
    };

    setLadduBids(prev => [newBid, ...prev.map(b => ({ ...b, status: 'Outbid' }))]);
    logAction(currentUser?.name || 'User', role, 'Recorded Laddu Bid', { bidder: bidData.bidderName, amount: bidData.amount });
    return newBid;
  };

  // DELETE DONATION
  const deleteDonation = async (receiptNo) => {
    const target = donations.find(d => d.receiptNo === receiptNo);
    setDonations(prev => prev.filter(d => d.receiptNo !== receiptNo));
    
    if (target && target.id) {
      try {
        await deleteDoc(doc(db, "donations", target.id));
      } catch (err) {
        console.warn("Firestore delete note:", err.message);
      }
    }

    logAction(currentUser?.name || 'Super Admin', role, 'Deleted Donation Receipt', { receiptNo });

    setNotifications(prev => [{
      id: Date.now(),
      text: `Receipt ${receiptNo} deleted by ${role}`,
      time: "Just now",
      type: "admin"
    }, ...prev]);
  };

  // UPDATE DONATION
  const updateDonation = async (receiptNo, updatedFields) => {
    setDonations(prev => prev.map(d => d.receiptNo === receiptNo ? { ...d, ...updatedFields } : d));
    
    const target = donations.find(d => d.receiptNo === receiptNo);
    if (target && target.id) {
      try {
        await updateDoc(doc(db, "donations", target.id), updatedFields);
      } catch (err) {
        console.warn("Firestore update note:", err.message);
      }
    }

    logAction(currentUser?.name || 'Admin', role, 'Updated Donation Receipt', { receiptNo });
  };

  // ADD EXPENSE
  const addExpense = async (expenseData) => {
    const today = new Date().toISOString().split('T')[0];

    const newExpense = {
      id: `EXP-26-${String(expenses.length + 1).padStart(4, '0')}`,
      voucherNo: `VOU-26-${String(expenses.length + 1).padStart(3, '0')}`,
      vendor: expenseData.vendor || 'Vendor',
      amount: parseFloat(expenseData.amount) || 0,
      category: expenseData.category || 'Decorations',
      paymentMethod: expenseData.paymentMethod || 'UPI',
      approvedBy: currentUser?.name || 'Gurram Karthikeya (Super Admin)',
      date: today,
      status: 'Approved',
      notes: expenseData.notes || 'Festival expense voucher'
    };

    setExpenses(prev => [newExpense, ...prev]);

    logAction(currentUser?.name || 'Admin', role, 'Recorded Expense Voucher', { voucherNo: newExpense.voucherNo, amount: newExpense.amount });

    setNotifications(prev => [{
      id: Date.now(),
      text: `Expense voucher ₹${newExpense.amount} approved for ${newExpense.vendor}`,
      time: "Just now",
      type: "expense"
    }, ...prev]);

    return newExpense;
  };

  // FRESH RESET ALL SYSTEM DATA & FIRESTORE CLOUD DATABASE
  const freshSystemReset = async () => {
    setDonations([]);
    setExpenses([]);
    setLadduBids([]);

    try {
      const snapshot = await getDocs(collection(db, "donations"));
      snapshot.forEach(async (d) => {
        await deleteDoc(doc(db, "donations", d.id));
      });
    } catch (err) {
      console.warn("Cloud reset note:", err.message);
    }

    logAction(currentUser?.name || 'Super Admin', role, 'Fresh System & Cloud Reset', {});

    setNotifications([
      { id: Date.now(), text: "Database fresh reset completed. Ready for 44-day Vinayaka Chaturthi Seva!", time: "Just now", type: "system" }
    ]);
    alert("System & Cloud Firestore successfully reset to 0! Ready for fresh Vinayaka Chaturthi 2026 Seva.");
  };

  // Translations object
  const translations = {
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
      searchPlaceholder: "దాత పేరు, రసీదు #, మొబైల్ లేదా ఊరు వెతకండి...",
      todaysCollection: "ఈరోజు సేకరణ",
      totalExpenses: "మొత్తం ఖర్చులు",
      netBalance: "నికర నిల్వ",
      daysLeft: "రోజులు మిగిలి ఉన్నాయి",
      quickActions: "త్వరిత చర్యలు",
      newDonation: "కొత్త విరాళం నమోదు",
      addExpense: "ఖర్చు నమోదు",
      donationsLedger: "విరాళాల చిట్టా",
      receiptNo: "రసీదు సంఖ్య",
      donorName: "దాత పేరు",
      amount: "మొత్తం",
      paymentMethod: "చెల్లింపు పద్ధతి",
      collector: "సేకరించినవారు"
    }
  };

  const t = translations[lang];

  return (
    <AppContext.Provider value={{
      lang,
      setLang,
      role,
      setRole,
      isAuthenticated,
      setIsAuthenticatedState,
      currentUser,
      setCurrentUser,
      signOut,
      registeredUsers,
      registerUser,
      approveUser,
      rejectUser,
      isOnline,
      committeeInfo,
      setCommitteeInfo,
      donations,
      expenses,
      ladduBids,
      addLadduBid,
      notifications,
      addDonation,
      deleteDonation,
      updateDonation,
      addExpense,
      freshSystemReset,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
