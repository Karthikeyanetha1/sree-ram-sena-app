import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
  const { addDonation, addExpense, role } = useApp();

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
  const [receiptModalDonation, setReceiptModalDonation] = useState(null);
  const [newDonationModalOpen, setNewDonationModalOpen] = useState(false);
  const [newExpenseModalOpen, setNewExpenseModalOpen] = useState(false);

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

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
