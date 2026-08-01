import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendAutomatedWhatsAppReceipt } from '../utils/whatsappAutomation';
import { X, Send, CheckCircle2, MessageSquare, Key, Phone, Settings, Sparkles } from 'lucide-react';

export const WhatsAppAutomationModal = ({ isOpen, onClose }) => {
  const { committeeInfo } = useApp();

  const [provider, setProvider] = useState('web'); // 'web' | 'meta' | 'ultramsg'
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [cloudApiToken, setCloudApiToken] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [testPhone, setTestPhone] = useState('8688496208');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleTestSend = async () => {
    setStatusMsg('Sending test WhatsApp receipt...');

    const sampleDonation = {
      receiptNo: 'SRS-26-000001',
      donorName: 'Test Donor',
      amount: 1001,
      mobile: testPhone,
      paymentMethod: 'UPI',
      village: 'Govindhupalli',
      date: new Date().toLocaleDateString('en-GB')
    };

    const settings = {
      autoLaunchOnReceipt: true,
      provider,
      cloudApiToken,
      phoneNumberId
    };

    const res = await sendAutomatedWhatsAppReceipt(sampleDonation, committeeInfo, settings);

    if (res.success) {
      setStatusMsg(`✅ WhatsApp Dispatch Triggered (${res.method})!`);
    } else {
      setStatusMsg(`❌ Dispatch error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <h3 className="font-extrabold text-base">WhatsApp Automation Control Center</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs font-semibold text-slate-800">
          
          {/* Mode Selector */}
          <div>
            <label className="font-extrabold text-slate-900 block mb-2">Select Dispatch Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('web')}
                className={`p-3 rounded-2xl border text-left transition ${
                  provider === 'web'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-emerald-900 mb-1">
                  <Send className="w-4 h-4" />
                  <span>1-Click Auto Launch</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Auto-opens WhatsApp Web/App pre-filled with Telugu & English receipt text.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvider('meta')}
                className={`p-3 rounded-2xl border text-left transition ${
                  provider === 'meta'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>Meta Cloud API</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Direct background WhatsApp message sending via Facebook Developer API.
                </p>
              </button>
            </div>
          </div>

          {/* Meta API Fields (if Meta mode selected) */}
          {provider === 'meta' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. 109283746591827"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">System User Access Token</label>
                <input
                  type="password"
                  value={cloudApiToken}
                  onChange={(e) => setCloudApiToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* Test Message Dispatch */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Test WhatsApp Dispatch
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                maxLength={10}
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit Mobile"
                className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={handleTestSend}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold shadow-sm flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Dispatch</span>
              </button>
            </div>
            {statusMsg && (
              <p className="text-[11px] font-bold text-emerald-800 bg-white p-2 rounded-xl border border-emerald-200">
                {statusMsg}
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-950 hover:bg-black text-white rounded-xl text-xs font-extrabold shadow-sm transition"
            >
              Done / Save Settings
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
