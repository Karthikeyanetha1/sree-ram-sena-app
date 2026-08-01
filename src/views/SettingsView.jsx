import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Download, 
  Upload, 
  Globe, 
  ShieldCheck, 
  Save, 
  Building, 
  Phone, 
  MapPin, 
  QrCode,
  History,
  Lock,
  UserCheck,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Key,
  Cloud,
  CheckCircle2,
  Layers
} from 'lucide-react';

export const SettingsView = () => {
  const { t, committeeInfo, setCommitteeInfo, exportBackupData, importBackupData, lang, setLang, role, freshSystemReset } = useApp();

  const [formState, setFormState] = useState({ ...committeeInfo });
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'integrations' | 'backup'

  // Meta Cloud API Credentials State
  const [metaToken, setMetaToken] = useState(localStorage.getItem('meta_whatsapp_token') || '');
  const [metaPhoneId, setMetaPhoneId] = useState(localStorage.getItem('meta_phone_number_id') || '');
  const [metaWabaId, setMetaWabaId] = useState(localStorage.getItem('meta_waba_id') || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setCommitteeInfo(formState);
    alert(lang === 'te' ? "కమిటీ ప్రొఫైల్ వివరాలు విజయవంతంగా సేవ్ చేయబడ్డాయి!" : "Committee profile updated successfully!");
  };

  const handleSaveIntegrations = (e) => {
    e.preventDefault();
    localStorage.setItem('meta_whatsapp_token', metaToken);
    localStorage.setItem('meta_phone_number_id', metaPhoneId);
    localStorage.setItem('meta_waba_id', metaWabaId);
    alert("✓ Meta WhatsApp Cloud API credentials and Integration settings saved!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        importBackupData(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm("ARE YOU SURE? This will reset all test donations and expenses to 0 for a clean festival start.")) {
      freshSystemReset();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Settings & Security
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure committee details, WhatsApp Cloud API integrations, security audit trail, and offline backups.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Committee Profile</span>
        </button>

        {role === 'Super Admin' && (
          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'integrations' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-4 h-4 text-teal-300" />
            <span>WhatsApp Integrations</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'backup' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Backup & System Reset</span>
        </button>
      </div>

      {/* TAB 1: COMMITTEE PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">Committee Profile & Address</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl text-xs font-semibold">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Active Festival / Event</label>
                <input
                  type="text"
                  disabled
                  value={formState.festivalName || 'Vinayaka Chavithi 2026'}
                  className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50 rounded-xl font-extrabold text-indigo-900 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Committee Name</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-extrabold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Established Year</label>
                <input
                  type="text"
                  value={formState.since}
                  onChange={(e) => setFormState({ ...formState, since: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Official Address</label>
              <input
                type="text"
                value={formState.address}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Receipt Number Prefix</label>
                <input
                  type="text"
                  disabled
                  value="SRS-26"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl font-mono font-bold text-indigo-900 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Committee UPI ID for QR</label>
                <input
                  type="text"
                  value={formState.upiId}
                  onChange={(e) => setFormState({ ...formState, upiId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

          </form>
        </div>
      )}

      {/* TAB 2: WHATSAPP INTEGRATIONS (Super Admin Only) */}
      {activeSubTab === 'integrations' && role === 'Super Admin' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-base text-slate-900">Meta WhatsApp Cloud API Integrations</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 Connected
            </span>
          </div>

          <form onSubmit={handleSaveIntegrations} className="space-y-4 max-w-2xl text-xs font-semibold">
            
            <div>
              <label className="text-slate-700 font-bold block mb-1">Permanent Access Token (META_WHATSAPP_TOKEN)</label>
              <input
                type="password"
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
                placeholder="EAAG..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Phone Number ID (META_PHONE_NUMBER_ID)</label>
                <input
                  type="text"
                  value={metaPhoneId}
                  onChange={(e) => setMetaPhoneId(e.target.value)}
                  placeholder="1188601974342405"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">WABA Account ID (META_WABA_ID)</label>
                <input
                  type="text"
                  value={metaWabaId}
                  onChange={(e) => setMetaWabaId(e.target.value)}
                  placeholder="1600507044806656"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* WEBHOOK VERIFICATION PARAMETERS DISPLAY */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Webhook Endpoint Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold block">Callback URL:</span>
                  <span className="font-mono text-indigo-900 font-extrabold select-all">https://sree-ram-sena-app.vercel.app/api/webhook</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Verify Token:</span>
                  <span className="font-mono text-emerald-800 font-extrabold select-all">sreeramsena2026secret</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save WhatsApp Credentials</span>
            </button>

          </form>
        </div>
      )}

      {/* TAB 3: BACKUP & SYSTEM RESET */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Backup & Offline Sync</h3>
            <p className="text-xs text-slate-500">
              Export your entire donation ledger, expenses, and settings to a secure JSON file, or restore data.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportBackupData}
                className="flex items-center space-x-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>

              <label className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Import Data</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* FRESH SYSTEM RESET CARD */}
          {role === 'Super Admin' && (
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-3xl border border-red-200 shadow-soft-card space-y-3">
              <div className="flex items-center space-x-2 text-red-700 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Fresh Festival System Reset (0 Records)</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Clicking this button will reset all test/sample donations and expenses to 0 so your committee can start fresh with clean collections for the 44-day Vinayaka Chaturthi countdown!
              </p>
              <button
                onClick={handleResetConfirm}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Data to 0 (Fresh Start)</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
