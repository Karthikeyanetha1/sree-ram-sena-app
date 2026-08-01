import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, X, Bot, User, BrainCircuit } from 'lucide-react';

export const AiChatModal = ({ isOpen, onClose }) => {
  const { donations, expenses, inventory, committeeInfo } = useApp();

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Jai Sri Ram! I am the SREE RAM SENA Divine AI Assistant. Ask me anything about collections, top donors, expenses, or festival preparations.`
    }
  ]);

  if (!isOpen) return null;

  const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const netBalance = totalDonations - totalExpenses;

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    const lower = userText.toLowerCase();

    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);
    setQuery('');

    // AI Heuristic Response
    setTimeout(() => {
      let reply = "";
      if (lower.includes('balance') || lower.includes('మొత్తం') || lower.includes('fund')) {
        reply = `Current Net Festival Surplus is ₹${netBalance.toLocaleString('en-IN')}. Total Donations: ₹${totalDonations.toLocaleString('en-IN')}, Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}.`;
      } else if (lower.includes('top donor') || lower.includes('దాత')) {
        reply = `Top Benefactor Spotlight: Venkateshwara Rao contributed ₹10,001 for Annadhanam.`;
      } else if (lower.includes('pending') || lower.includes('ఖర్చు')) {
        const pending = expenses.filter(e => e.status === 'Pending');
        reply = `There are ${pending.length} pending expense vouchers. VCH-0103 for Sri Rama Cooking Services (₹24,500) awaits Super Admin approval.`;
      } else {
        reply = `For Sri Rama Navami 2026, SREE RAM SENA has recorded ${donations.length} receipts across Govindhupalli and nearby villages. Current financial health is excellent!`;
      }

      setMessages([...newMsgs, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">AI Committee Helper</h3>
              <p className="text-[10px] text-emerald-100">Ask natural questions in English or Telugu</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex items-start space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0 font-bold">
                  🚩
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-[80%] text-xs ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white font-semibold rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 font-medium shadow-xs rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI e.g. What is current net balance?"
            className="flex-1 px-3 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-medium outline-none"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
