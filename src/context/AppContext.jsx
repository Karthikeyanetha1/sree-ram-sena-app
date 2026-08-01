import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
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
  const [role, setRole] = useState('Super Admin'); // Super Admin, Collector, Viewer
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

  // AUTO RECEIPT NUMBER GENERATOR (SRS-26-000001)
  const getNextReceiptNo = () => {
    const yearPrefix = "SRS-26";
    
    if (donations.length === 0) {
      return `${yearPrefix}-000001`;
    }

    const maxNum = donations.reduce((max, d) => {
      if (d.receiptNo && d.receiptNo.startsWith(yearPrefix)) {
        const parts = d.receiptNo.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);

    const nextNum = maxNum + 1;
    return `${yearPrefix}-${String(nextNum).padStart(6, '0')}`;
  };

  // Convert Number to Words (INR)
  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
      if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };

    const val = parseInt(num);
    if (isNaN(val) || val === 0) return 'Zero Rupees Only';
    return inWords(val).trim() + ' Rupees Only';
  };

  // ADD DONATION (WITH OFFLINE STORAGE QUEUE FALLBACK)
  const addDonation = async (donationData) => {
    const receiptNo = getNextReceiptNo();
    const today = new Date().toISOString().split('T')[0];

    const newDonation = {
      receiptNo,
      donorName: donationData.donorName || 'Generous Donor',
      mobile: donationData.mobile || '9876543210',
      village: donationData.village || 'Govindhupalli',
      address: donationData.address || 'Govindhupalli',
      amount: parseFloat(donationData.amount) || 0,
      amountInWords: numberToWords(parseFloat(donationData.amount) || 0),
      paymentMethod: donationData.paymentMethod || 'UPI',
      category: donationData.category || 'General Donation',
      collector: role === 'Viewer' ? 'Ravi Kumar' : 'Karthik Sharma',
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Verified',
      notes: donationData.notes || 'Vinayaka Chavithi Seva'
    };

    // Update Local State Immediately
    setDonations(prev => [newDonation, ...prev]);

    // Save to Firestore or Offline Queue
    if (navigator.onLine) {
      try {
        await addDoc(collection(db, "donations"), {
          ...newDonation,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore save note:", err.message);
      }
    } else {
      // Store in Offline Queue
      const offlineQueue = JSON.parse(localStorage.getItem('sreeramsena_offline_queue') || '[]');
      offlineQueue.push(newDonation);
      localStorage.setItem('sreeramsena_offline_queue', JSON.stringify(offlineQueue));
      setNotifications(prev => [{
        id: Date.now(),
        text: `📶 Saved Receipt ${receiptNo} in Offline Mode. Will auto-sync when online.`,
        time: "Just now",
        type: "system"
      }, ...prev]);
    }

    // Add Notification
    setNotifications(prev => [{
      id: Date.now(),
      text: `New donation ₹${newDonation.amount} recorded for ${newDonation.donorName} (${receiptNo})`,
      time: "Just now",
      type: "donation"
    }, ...prev]);

    return newDonation;
  };

  // ADD LADDU BID
  const addLadduBid = (bidData) => {
    const newBid = {
      id: Date.now(),
      bidderName: bidData.bidderName || 'Generous Devotee',
      mobile: bidData.mobile || '9876543210',
      amount: parseFloat(bidData.amount) || 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Leading Bidder 🏆'
    };

    setLadduBids(prev => [
      newBid,
      ...prev.map(b => ({ ...b, status: 'Outbid' }))
    ]);

    setNotifications(prev => [{
      id: Date.now(),
      text: `🟡 New Highest Laddu Bid: ₹${newBid.amount.toLocaleString('en-IN')} by ${newBid.bidderName}`,
      time: "Just now",
      type: "system"
    }, ...prev]);
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
      approvedBy: 'Karthik Sharma (Super Admin)',
      date: today,
      status: 'Approved',
      notes: expenseData.notes || 'Festival expense voucher'
    };

    setExpenses(prev => [newExpense, ...prev]);

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
