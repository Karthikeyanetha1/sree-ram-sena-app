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
import { LadduAuctionView } from './views/LadduAuctionView';
import { LeaderboardView } from './views/LeaderboardView';

const MainAppContent = () => {
  const { donations, addDonation, addExpense, role, isAuthenticated, setIsAuthenticatedState } = useApp();

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

  // Public Receipt Link Listener (e.g. ?receiptNo=SRS-2026-000005)
  const [publicReceiptDonation, setPublicReceiptDonation] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetNo = params.get('receiptNo') || params.get('receipt');

    if (targetNo) {
      const found = (donations || []).find(d => d.receiptNo === targetNo);
      if (found) {
        setPublicReceiptDonation(found);
      } else {
        fetch(`/api/get-receipt?receiptNo=${encodeURIComponent(targetNo)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.donation) {
              setPublicReceiptDonation(data.donation);
            }
          })
          .catch(e => console.warn("Public receipt API load note:", e));
      }
    }
  }, [donations]);

  if (publicReceiptDonation) {
    return (
      <ReceiptModal 
        donation={publicReceiptDonation} 
        isOpen={true} 
        onClose={() => setPublicReceiptDonation(null)}
        onNavigateHome={() => setPublicReceiptDonation(null)}
      />
    );
  }

  // If user is unauthenticated or explicitly signed out, render LoginPage Portal landing view!
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={() => setIsAuthenticatedState(true)}
      />
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

          {activeTab === 'laddu-auction' && (
            <LadduAuctionView 
              onViewReceipt={handleOpenReceipt}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView />
          )}

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
        <LoginPage 
          onLoginSuccess={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }} 
        />
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
