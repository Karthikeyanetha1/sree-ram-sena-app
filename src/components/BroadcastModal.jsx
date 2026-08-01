import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send, X, ShieldCheck, Users, Sparkles, CheckCircle2, MessageSquare, PhoneCall, Eye } from 'lucide-react';

export const BroadcastModal = ({ isOpen, onClose }) => {
  const { donations, committeeInfo } = useApp();
  
  const [selectedTemplate, setSelectedTemplate] = useState('annadhanam');
  const [customMessage, setCustomMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);

  if (!isOpen) return null;

  const templates = {
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
దయచేసి వచ్చి స్వామివారి కృపకు పాత్రులు కాగలరని కోరుతున్నాము! 🙏`,

    gratitude: `🙏 *హృదయపూర్వక ధన్యవాదములు*
*SREE RAM SENA Vinayaka Chavithi 2026*

ప్రియమైన శ్రీ/శ్రీమతి [DONOR_NAME] గారికి,

మా వినాయక చవితి సేవా కార్యక్రమానికి మీరు అందించిన విలువైన విరాళం ₹ [AMOUNT]/- కి శ్రీ రామ్ సేన తరఫున హృదయపూర్వక ధన్యవాదములు. 🌺

మీ సహకారంతో ఉత్సవాలు విజయవంతంగా పూర్తి అయ్యాయి.

గణపతి బప్పా మీ కుటుంబానికి ఆయురారోగ్యాలు, ఐశ్వర్యం అందించాలని మనస్పూర్తిగా కోరుకుంటున్నాము! 🙏`
  };

  const currentTemplateText = customMessage || templates[selectedTemplate];

  // Sample Preview Donor (First donor or demo fallback)
  const sampleDonor = donations.length > 0 ? donations[0] : { donorName: 'Roi Govindhupalli', amount: 10000, mobile: '9887665541' };
  
  const samplePreviewText = currentTemplateText
    .replace(/\[DONOR_NAME\]/g, sampleDonor.donorName || 'Devotee')
    .replace(/\[AMOUNT\]/g, (sampleDonor.amount || 0).toLocaleString('en-IN'));

  const handleLaunchBroadcast = (donation) => {
    let finalMessage = currentTemplateText
      .replace(/\[DONOR_NAME\]/g, donation.donorName || 'Devotee')
      .replace(/\[AMOUNT\]/g, (donation.amount || 0).toLocaleString('en-IN'));

    const phone = donation.mobile ? `91${donation.mobile.replace(/\D/g, '')}` : '';
    const encoded = encodeURIComponent(finalMessage);
    const link = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    
    window.open(link, '_blank');
    setSentCount(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-100 overflow-hidden my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              📢
            </div>
            <div>
              <h3 className="font-extrabold text-base">WhatsApp Private Festival Broadcast</h3>
              <p className="text-xs text-emerald-100/90">1-on-1 Private Messages to All Ledger Donors ({donations.length} Donors)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs font-semibold">
          
          {/* Template Selector */}
          <div>
            <label className="text-slate-700 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
              Select Festival Template or Custom Text:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setSelectedTemplate('annadhanam'); setCustomMessage(''); }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  selectedTemplate === 'annadhanam' && !customMessage
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                🌺 Annadhanam Invitation
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTemplate('nimajjanam'); setCustomMessage(''); }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  selectedTemplate === 'nimajjanam' && !customMessage
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                🥁 Nimajjanam Invitation
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTemplate('gratitude'); setCustomMessage(''); }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  selectedTemplate === 'gratitude' && !customMessage
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                🙏 Gratitude Message
              </button>
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <label className="text-slate-700 font-bold block mb-1 uppercase tracking-wider text-[10px]">
              Message Text (Supports [DONOR_NAME] and [AMOUNT] tags):
            </label>
            <textarea
              rows={4}
              value={currentTemplateText}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs leading-relaxed"
            />
          </div>

          {/* LIVE AUTOMATIC REPLACEMENT PREVIEW BOX */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-1">
            <div className="flex items-center justify-between text-amber-950 font-black text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-700" /> Live Automatic Preview for: <strong>{sampleDonor.donorName}</strong>
              </span>
              <span className="text-emerald-800 font-extrabold">Amount: ₹{sampleDonor.amount}</span>
            </div>
            <p className="text-slate-800 text-xs italic font-medium whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
              {samplePreviewText}
            </p>
            <span className="text-[10px] text-amber-900 font-bold block pt-0.5">
              ✓ `[DONOR_NAME]` automatically fills "{sampleDonor.donorName}" and `[AMOUNT]` fills "₹{sampleDonor.amount}" for each donor separately!
            </span>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>🔒 <strong>100% Private 1-on-1 Messages:</strong> Every donor receives their message privately on their personal WhatsApp. No public groups or channels are created.</span>
          </div>

          {/* Donor Dispatch Queue List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Donor Dispatch Ledger ({donations.length} Donors)
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
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
                      onClick={() => handleLaunchBroadcast(d)}
                      className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition"
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
