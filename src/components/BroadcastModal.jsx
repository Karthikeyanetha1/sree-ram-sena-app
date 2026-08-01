import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Cloud, 
  Zap, 
  Loader2, 
  Settings,
  CheckCircle2,
  Key,
  Phone,
  Building
} from 'lucide-react';

export const BroadcastModal = ({ isOpen, onClose }) => {
  const { donations, committeeInfo } = useApp();
  
  const [dispatchMode, setDispatchMode] = useState('direct'); // 'direct' | 'cloud'
  const [showCloudConfig, setShowCloudConfig] = useState(false);

  // Meta Cloud API Credentials State
  const [metaToken, setMetaToken] = useState(localStorage.getItem('meta_whatsapp_token') || '');
  const [metaPhoneId, setMetaPhoneId] = useState(localStorage.getItem('meta_phone_number_id') || '');
  const [metaWabaId, setMetaWabaId] = useState(localStorage.getItem('meta_waba_id') || '');

  const [selectedTemplate, setSelectedTemplate] = useState('gratitude');
  const [customMessage, setCustomMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [isMassBroadcasting, setIsMassBroadcasting] = useState(false);

  if (!isOpen) return null;

  const templates = {
    gratitude: `🙏 *హృదయపూర్వక ధన్యవాదములు*
*SREE RAM SENA Vinayaka Chavithi 2026*

ప్రియమైన శ్రీ/శ్రీమతి [DONOR_NAME] గారికి,

మా వినాయక చవితి సేవా కార్యక్రమానికి మీరు అందించిన విలువైన విరాళం ₹ [AMOUNT]/- కి శ్రీ రామ్ సేన తరఫున హృదయపూర్వక ధన్యవాదములు. 🌺

మీ సహకారంతో ఉత్సవాలు విజయవంతంగా పూర్తి అయ్యాయి.

గణపతి బప్పా మీ కుటుంబానికి ఆయురారోగ్యాలు, ఐశ్వర్యం అందించాలని మనస్పూర్తిగా కోరుకుంటున్నాము! 🙏`,

    annadhanam: `🙏 *శ్రీ గణేశ ప్రసాద అన్నదాన ఆహ్వానం*
*SREE RAM SENA Vinayaka Chavithi 2026*

ప్రియమైన శ్రీ/శ్రీమతి [DONOR_NAME] గారికి హృదయపూర్వక ప్రణామాలు.

మా శ్రీ రామ్ సేన వినాయక చవితి సందర్భంగా ఈరోజు గోవిందుపల్లి పండల్ వద్ద నిర్వహించే *మహానైవేద్య అన్నదాన ప్రసాద స్వీకరణకు* మిమ్మల్ని మీ కుటుంబాన్ని సాదరంగా ఆహ్వానిస్తున్నాము. 🌺

గణపతి బప్పా మీ కుటుంబానికి ఆరోగ్యం, ఆనందం అందించాలని కోరుకుంటున్నాము! 🙏`,

    nimajjanam: `🥁 *మహా నిమజ్జనోత్సవ ఆహ్వానం*
*SREE RAM SENA Vinayaka Chavithi 2026*

ప్రియమైన శ్రీ/శ్రీమతి [DONOR_NAME] గారికి ప్రణామాలు.

గోవిందుపల్లి శ్రీ రామ్ సేన వినాయక విగ్రహ మహా నిమజ్జన ఊరేగింపు మహోత్సవానికి మిమ్మల్ని మీ కుటుంబాన్ని ఆహ్వానిస్తున్నాము. 🌺

మండపం వద్ద సమయం: సాయంత్రం 4:00 గంటలకు.
దయచేసి వచ్చి స్వామివారి కృపకు పాత్రులు కాగలరని కోరుతున్నాము! 🙏`
  };

  const currentTemplateText = customMessage || templates[selectedTemplate];

  // Sample Preview Donor (First donor or fallback)
  const sampleDonor = donations.length > 0 ? donations[0] : { donorName: 'Roi Govindhupalli', amount: 10000, mobile: '9887665541' };
  
  const samplePreviewText = currentTemplateText
    .replace(/\[DONOR_NAME\]/g, sampleDonor.donorName || 'Devotee')
    .replace(/\[AMOUNT\]/g, (sampleDonor.amount || 0).toLocaleString('en-IN'));

  const handleSaveMetaCredentials = (e) => {
    e.preventDefault();
    localStorage.setItem('meta_whatsapp_token', metaToken);
    localStorage.setItem('meta_phone_number_id', metaPhoneId);
    localStorage.setItem('meta_waba_id', metaWabaId);
    setShowCloudConfig(false);
    alert("✓ Meta WhatsApp Cloud API credentials saved successfully!");
  };

  // Single Donor Dispatch
  const handleLaunchSingleBroadcast = async (donation) => {
    let finalMessage = currentTemplateText
      .replace(/\[DONOR_NAME\]/g, donation.donorName || 'Devotee')
      .replace(/\[AMOUNT\]/g, (donation.amount || 0).toLocaleString('en-IN'));

    if (dispatchMode === 'cloud' && metaToken && metaPhoneId) {
      try {
        const response = await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: metaToken,
            phoneId: metaPhoneId,
            mobile: donation.mobile,
            donorName: donation.donorName,
            amount: donation.amount,
            message: finalMessage
          })
        });

        const resData = await response.json();
        if (resData.directWaUrl) {
          window.open(resData.directWaUrl, '_blank');
        }
      } catch (err) {
        console.warn("Cloud API fallback to wa.me:", err.message);
        const phone = donation.mobile ? `91${donation.mobile.replace(/\D/g, '')}` : '';
        const encoded = encodeURIComponent(finalMessage);
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
      }
    } else {
      const phone = donation.mobile ? `91${donation.mobile.replace(/\D/g, '')}` : '';
      const encoded = encodeURIComponent(finalMessage);
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    }

    setSentCount(prev => prev + 1);
  };

  // 1-Click Mass Broadcast Engine
  const handle1ClickMassBroadcastAll = async () => {
    if (donations.length === 0) {
      alert("No donors found in the collection ledger.");
      return;
    }

    setIsMassBroadcasting(true);
    let count = 0;

    for (const donor of donations) {
      count++;
      let finalMessage = currentTemplateText
        .replace(/\[DONOR_NAME\]/g, donor.donorName || 'Devotee')
        .replace(/\[AMOUNT\]/g, (donor.amount || 0).toLocaleString('en-IN'));

      const phone = donor.mobile ? `91${donor.mobile.replace(/\D/g, '')}` : '';
      const encoded = encodeURIComponent(finalMessage);
      
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
      setSentCount(count);
      
      await new Promise(res => setTimeout(res, 500));
    }

    setIsMassBroadcasting(false);
    alert(`🎉 1-Click Mass Broadcast Complete! ${count} Gratitude messages prepared and dispatched.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4">
        
        {/* Header - Royal Blue & Teal Gradient */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-lg">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">WhatsApp Private Festival Broadcast</h3>
              <p className="text-xs text-indigo-100">1-on-1 Private Messages to All Ledger Donors ({donations.length} Donors)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-xs font-semibold text-slate-800">
          
          {/* Dispatch Mode Selector & Config Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-500 font-extrabold block uppercase tracking-wider text-[10px]">
                Select Dispatch Engine Mode:
              </label>

              <button
                type="button"
                onClick={() => setShowCloudConfig(!showCloudConfig)}
                className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showCloudConfig ? 'Hide Cloud Config' : '⚙️ Cloud API Credentials'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDispatchMode('direct')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center space-x-1.5 ${
                  dispatchMode === 'direct'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>⚡ 1-Click Direct WhatsApp (wa.me)</span>
              </button>

              <button
                type="button"
                onClick={() => setDispatchMode('cloud')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center space-x-1.5 ${
                  dispatchMode === 'cloud'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-4 h-4 text-blue-200" />
                <span>☁️ Meta WhatsApp Cloud API</span>
              </button>
            </div>
          </div>

          {/* META CLOUD API CREDENTIALS CONFIG DRAWER */}
          {showCloudConfig && (
            <form onSubmit={handleSaveMetaCredentials} className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-3 animate-in fade-in">
              <div className="flex items-center space-x-2 text-indigo-950 font-black text-xs">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Meta WhatsApp Cloud API Credentials Setup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Permanent Access Token</label>
                  <input
                    type="password"
                    placeholder="META_WHATSAPP_TOKEN"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    placeholder="META_PHONE_NUMBER_ID"
                    value={metaPhoneId}
                    onChange={(e) => setMetaPhoneId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">WABA Account ID</label>
                  <input
                    type="text"
                    placeholder="META_WABA_ID"
                    value={metaWabaId}
                    onChange={(e) => setMetaWabaId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-indigo-800 font-bold">
                  ✓ Credentials enable direct background API broadcasts. If blank, system uses 1-Click wa.me fallback!
                </span>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          )}

          {/* Template Selector */}
          <div>
            <label className="text-slate-500 font-extrabold block mb-1.5 uppercase tracking-wider text-[10px]">
              Select Festival Template or Custom Text:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setSelectedTemplate('gratitude'); setCustomMessage(''); }}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedTemplate === 'gratitude' && !customMessage
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                🙏 Gratitude Message
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTemplate('annadhanam'); setCustomMessage(''); }}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedTemplate === 'annadhanam' && !customMessage
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                🌺 Annadhanam Invitation
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTemplate('nimajjanam'); setCustomMessage(''); }}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedTemplate === 'nimajjanam' && !customMessage
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                🥁 Nimajjanam Invitation
              </button>
            </div>
          </div>

          {/* CLEAN SINGLE BROADCAST MESSAGE BOX */}
          <div>
            <label className="text-slate-500 font-extrabold block mb-1 uppercase tracking-wider text-[10px]">
              Message Text (Supports [DONOR_NAME] and [AMOUNT] tags):
            </label>
            <textarea
              rows={4}
              value={currentTemplateText}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500 text-xs leading-relaxed"
            />
          </div>

          {/* LIVE AUTOMATIC PREVIEW BOX */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-1.5">
            <div className="flex items-center justify-between text-amber-950 font-black text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-700" /> Live Automatic Preview for: <strong>{sampleDonor.donorName}</strong>
              </span>
              <span className="text-indigo-900 font-extrabold">Amount: ₹{sampleDonor.amount}</span>
            </div>
            <p className="text-slate-800 text-xs italic font-medium whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
              {samplePreviewText}
            </p>
            <span className="text-[10px] text-amber-900 font-extrabold block pt-0.5">
              ✓ `[DONOR_NAME]` automatically fills "{sampleDonor.donorName}" and `[AMOUNT]` fills "₹{sampleDonor.amount}" for each donor separately!
            </span>
          </div>

          {/* 1-CLICK MASS BROADCAST BUTTON */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 to-blue-950 rounded-2xl text-white space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>1-Click Mass Broadcast Engine</span>
                </h4>
                <p className="text-[11px] text-indigo-200">
                  Send personalized private messages to all {donations.length} donors in 1 click!
                </p>
              </div>

              <button
                type="button"
                disabled={isMassBroadcasting || donations.length === 0}
                onClick={handle1ClickMassBroadcastAll}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 active:scale-98 disabled:opacity-50"
              >
                {isMassBroadcasting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>⚡ 1-Click Mass Send All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>🔒 <strong>100% Private 1-on-1 Messages:</strong> Every donor receives their message privately on their personal WhatsApp. No public groups or channels are created.</span>
          </div>

          {/* Donor Dispatch Queue List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Donor Dispatch Ledger ({donations.length} Donors)
              </span>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Dispatched: {sentCount} / {donations.length}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
              {donations.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-bold">No donors in collection ledger yet.</div>
              ) : (
                donations.map((d) => (
                  <div key={d.id || d.receiptNo} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{d.donorName}</h4>
                      <span className="text-[10px] text-slate-500">📞 {d.mobile} • ₹{d.amount}</span>
                    </div>

                    <button
                      onClick={() => handleLaunchSingleBroadcast(d)}
                      className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Private WhatsApp</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
