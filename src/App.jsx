import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { db } from './firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { AiChatModal } from './components/AiChatModal';
import { AiOcrModal } from './components/AiOcrModal';
import { LoginModal } from './components/LoginModal';
import { WhatsAppAutomationModal } from './components/WhatsAppAutomationModal';
import { BroadcastModal } from './components/BroadcastModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';
import { FirstLoginWizardModal } from './components/FirstLoginWizardModal';

import { LoginPage } from './views/LoginPage';
import { DashboardView } from './views/DashboardView';
import { DonationsView } from './views/DonationsView';
import { ExpensesView } from './views/ExpensesView';
import { ReceiptsView } from './views/ReceiptsView';
import { ReportsView } from './views/ReportsView';
import { CommunityView } from './views/CommunityView';
import { AiInsightsView } from './views/AiInsightsView';
import { SettingsView } from './views/SettingsView';
import { CommitteeView } from './views/CommitteeView';
import { SponsorsView } from './views/SponsorsView';
import { LadduAuctionHistoryView } from './views/LadduAuctionHistoryView';

import { PublicReceiptPage } from './views/PublicReceiptPage';

const MainAppContent = () => {
  const { 
    authStatus,
    isApproved,
    isActive,
    profileError,
    signOut,
    currentUser,
    role,
    donations, 
    addDonation, 
    addExpense 
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Modals
  const [loginOpen, setLoginOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrMode, setOcrMode] = useState('donation');
  const [adminUsersOpen, setAdminUsersOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [receiptModalDonation, setReceiptModalDonation] = useState(null);
  const [newDonationModalOpen, setNewDonationModalOpen] = useState(false);
  const [newExpenseModalOpen, setNewExpenseModalOpen] = useState(false);

  // Extract public receipt number from clean URL path (/receipt/SRS-2026-000001 or /verify/SRS-2026-000001 or ?receiptNo=...)
  const getReceiptNumberFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/(?:receipt|verify)\/([A-Za-z0-9-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('receiptNo') || params.get('receipt');
  };

  const publicReceiptNo = getReceiptNumberFromUrl();

  // 1. PUBLIC RECEIPT ROUTE BYPASS (NO LOGIN REQUIRED)
  if (publicReceiptNo) {
    return <PublicReceiptPage initialReceiptNo={publicReceiptNo} />;
  }

  // 2. AUTH_LOADING STATE
  if (authStatus === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-black tracking-tight uppercase">SREE RAM SENA</h2>
        <p className="text-xs text-amber-400 font-bold mt-1">Authenticating Divine Manager...</p>
        <span className="text-[11px] text-slate-500 mt-2">Verifying Firebase Auth session & Firestore profile claims</span>
      </div>
    );
  }

  // 3. UNAUTHENTICATED STATE ➔ RENDER LOGIN PAGE AT ROOT URL /
  if (authStatus === 'UNAUTHENTICATED') {
    return <LoginPage />;
  }

  // 4. AUTHENTICATED BUT PROFILE MISSING
  if (profileError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-2xl border border-red-500/30 mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">Account Profile Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md mt-2">
          Your Firebase account ({currentUser?.email}) was authenticated, but no corresponding profile document was found in the database. Please contact a Super Admin to provision your user profile.
        </p>
        <button
          onClick={signOut}
          className="mt-6 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
        >
          Sign Out & Return to Login
        </button>
      </div>
    );
  }

  // 5. AUTHENTICATED BUT PENDING APPROVAL
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30 mb-4">
          ⏳
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">Account Pending Approval</h2>
        <p className="text-xs text-slate-400 max-w-md mt-2">
          Welcome, {currentUser?.name || currentUser?.email}! Your access request is currently pending Super Admin review. You will be granted access once your account is approved.
        </p>
        <button
          onClick={signOut}
          className="mt-6 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
        >
          Sign Out & Return to Login
        </button>
      </div>
    );
  }

  // 6. AUTHENTICATED BUT ACCOUNT DISABLED
  if (!isActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-2xl border border-red-500/30 mb-4">
          🚫
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">Account Disabled</h2>
        <p className="text-xs text-slate-400 max-w-md mt-2">
          Your account ({currentUser?.email}) has been deactivated by a Super Admin. If you believe this is an error, please contact the festival committee.
        </p>
        <button
          onClick={signOut}
          className="mt-6 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
        >
          Sign Out & Return to Login
        </button>
      </div>
    );
  }

  const handleOpenReceipt = (donation) => {
    setReceiptModalDonation(donation);
  };

  const handleVoiceAddDonation = (donationData) => {
    const created = addDonation(donationData);
    setReceiptModalDonation(created);
  };

  const handleVoiceAddExpense = (expenseData) => {
    addExpense(expenseData);
    setActiveTab('expenses');
  };

  const handleOcrAddDonation = (extracted) => {
    const created = addDonation({
      donorName: extracted.donorName,
      mobile: extracted.mobile,
      village: extracted.village,
      address: extracted.address,
      amount: extracted.amount,
      paymentMethod: extracted.paymentMethod || 'UPI',
      notes: extracted.notes || 'AI OCR Slip Entry'
    });
    setReceiptModalDonation(created);
  };

  const handleOcrAddExpense = (extracted) => {
    addExpense({
      vendor: extracted.vendor,
      amount: extracted.amount,
      category: extracted.category || 'Decorations',
      paymentMethod: extracted.paymentMethod || 'UPI',
      notes: extracted.remarks || 'AI OCR Bill Entry'
    });
    setActiveTab('expenses');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenVoice={() => setVoiceOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        onOpenAdminUsers={() => setAdminUsersOpen(true)}
        onOpenAiChat={() => setAiChatOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenWhatsApp={() => setBroadcastOpen(true)}
        onOpenAuditLog={() => setAuditLogOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 gap-6">
        
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Content View Area */}
        <main className="flex-1 md:ml-64 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onOpenNewDonation={() => setNewDonationModalOpen(true)}
              onOpenNewExpense={() => setNewExpenseModalOpen(true)}
              onOpenVoice={() => setVoiceOpen(true)}
              onViewReceipt={handleOpenReceipt}
              onOpenOcr={() => { setOcrMode('donation'); setOcrOpen(true); }}
              onOpenLogin={() => setLoginOpen(true)}
              onOpenWizard={() => setWizardOpen(true)}
            />
          )}

          {activeTab === 'donations' && (
            <DonationsView 
              onViewReceipt={handleOpenReceipt}
              openAddModal={newDonationModalOpen}
              setOpenAddModal={setNewDonationModalOpen}
              onOpenOcr={() => { setOcrMode('donation'); setOcrOpen(true); }}
            />
          )}

          {activeTab === 'laddu-auction' && <LadduAuctionHistoryView />}

          {activeTab === 'leaderboard' && (
            <LeaderboardView />
          )}

          {activeTab === 'committee' && <CommitteeView />}

          {activeTab === 'sponsors' && <SponsorsView />}

          {activeTab === 'expenses' && (
            <ExpensesView 
              openExpenseModal={newExpenseModalOpen}
              setOpenExpenseModal={setNewExpenseModalOpen}
              onOpenOcr={() => { setOcrMode('expense'); setOcrOpen(true); }}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView 
              onViewReceipt={handleOpenReceipt}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'community' && <CommunityView />}

          {activeTab === 'ai-insights' && <AiInsightsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>

      </div>

      {/* Global Modals */}
      <SessionTimeoutModal />

      <FirstLoginWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />

      <VoiceAssistantModal 
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onAddDonationFromVoice={handleVoiceAddDonation}
        onAddExpenseFromVoice={handleVoiceAddExpense}
      />

      <AiOcrModal
        isOpen={ocrOpen}
        onClose={() => setOcrOpen(false)}
        mode={ocrMode}
        onSaveExtractedDonation={handleOcrAddDonation}
        onSaveExtractedExpense={handleOcrAddExpense}
      />

      <ReceiptModal 
        donation={receiptModalDonation}
        isOpen={!!receiptModalDonation}
        onClose={() => setReceiptModalDonation(null)}
        onNavigateHome={() => setActiveTab('dashboard')}
      />

      <AdminUsersModal
        isOpen={adminUsersOpen}
        onClose={() => setAdminUsersOpen(false)}
      />

      <AiChatModal
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />

      <WhatsAppAutomationModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
      />

      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
      />

      <AuditLogModal
        isOpen={auditLogOpen}
        onClose={() => setAuditLogOpen(false)}
      />

    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("Recovered from render note:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl mb-4">
            🚩
          </div>
          <h2 className="text-xl font-bold text-amber-300 font-serif mb-2">SREE RAM SENA Divine Manager</h2>
          <p className="text-sm text-slate-300 max-w-md mb-6">
            Application rendering refreshed. Tap below to reload the dashboard cleanly.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black rounded-xl shadow-lg transition"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <MainAppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
