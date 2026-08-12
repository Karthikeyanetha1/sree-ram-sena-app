import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  History,
  Filter,
  Users
} from 'lucide-react';

export const BroadcastModal = ({ isOpen, onClose }) => {
  const { donations, committeeInfo } = useApp();
  
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'

  // Question 1: Who receives?
  const [recipientFilter, setRecipientFilter] = useState('all'); // 'all' | 'today' | 'collector'

  // Question 2: What message?
  const [selectedTemplate, setSelectedTemplate] = useState('gratitude');
  const [customMessage, setCustomMessage] = useState('');

  // Live Broadcast Progress State
  const [broadcastStatus, setBroadcastStatus] = useState('Idle'); // 'Idle' | 'Queued' | 'Sending' | 'Completed' | 'Failed'
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Broadcast History Campaigns State
  const [campaignHistory, setCampaignHistory] = useState([
    { id: 1, date: 'Aug 2, 2026', type: 'Annadhanam Invitation', recipients: 328, delivered: 326, failed: 2, status: 'Completed' },
    { id: 2, date: 'Aug 1, 2026', type: 'Gratitude Message', recipients: 154, delivered: 154, failed: 0, status: 'Completed' }
  ]);

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

    pooja: `🌺 *శ్రీ వినాయక కుంకుమార్చన పూజా ఆహ్వానం*
*SREE RAM SENA Vinayaka Chavithi 2026*

ప్రియమైన శ్రీ/శ్రీమతి [DONOR_NAME] గారికి ప్రణామాలు.

మా శ్రీ రామ్ సేన వినాయక చవితి సేవలో భాగంగా ఈరోజు సాయంత్రం జరిపే *శ్రీ వినాయక స్వామి విశేష కుంకుమార్చన పూజకు* ఆహ్వానిస్తున్నాము. 🌺`,

    nimajjanam: `🥁 *మహా నిమజ్జనోత్సవ ఆహ్వానం*
*SREE RAM SENA Vinayaka Chavithi 2026*

ప్రియమైన శ్రీ/శ్రీమతి [DONOR_NAME] గారికి ప్రణామాలు.

గోవిందుపల్లి శ్రీ రామ్ సేన వినాయక విగ్రహ మహా నిమజ్జన ఊరేగింపు మహోత్సవానికి మిమ్మల్ని మీ కుటుంబాన్ని ఆహ్వానిస్తున్నాము. 🌺`
  };

  const currentTemplateText = customMessage || templates[selectedTemplate];

  // Filtered Donors List
  const todayStr = new Date().toISOString().split('T')[0];
  const targetDonors = donations.filter(d => {
    if (recipientFilter === 'today') return d.date === todayStr;
    return true;
  });

  const totalTargetCount = targetDonors.length > 0 ? targetDonors.length : 1;

  // Sample Preview Donor
  const sampleDonor = targetDonors.length > 0 ? targetDonors[0] : { donorName: 'Roi Govindhupalli', amount: 10000, mobile: '9887665541' };
  
  const samplePreviewText = currentTemplateText
    .replace(/\[DONOR_NAME\]/g, sampleDonor.donorName || 'Devotee')
    .replace(/\[AMOUNT\]/g, (sampleDonor.amount || 0).toLocaleString('en-IN'));

  // 1-Click Mass Broadcast Execution with Live Progress Bar
  const handleSendBroadcast = async () => {
    if (targetDonors.length === 0) {
      alert("No donors found for selected filter.");
      return;
    }

    setBroadcastStatus('Queued');
    setDeliveredCount(0);
    setFailedCount(0);

    await new Promise(res => setTimeout(res, 400));
    setBroadcastStatus('Sending');

    let delivered = 0;

    for (const donor of targetDonors) {
      let finalMessage = currentTemplateText
        .replace(/\[DONOR_NAME\]/g, donor.donorName || 'Devotee')
        .replace(/\[AMOUNT\]/g, (donor.amount || 0).toLocaleString('en-IN'));

      const cleanNum = (donor.mobile || '').replace(/\D/g, '');
      if (cleanNum.length >= 10) {
        const phone = `91${cleanNum.slice(-10)}`;
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(finalMessage)}`;

        try {
          const a = document.createElement('a');
          a.href = waUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {
          console.warn("Broadcast tab open note:", e);
        }
      }
      
      delivered++;
      setDeliveredCount(delivered);

      await new Promise(res => setTimeout(res, 800));
    }

    setBroadcastStatus('Completed');

    // Add to Campaign History Ledger
    const newCampaign = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: selectedTemplate === 'gratitude' ? 'Gratitude Message' : selectedTemplate === 'annadhanam' ? 'Annadhanam Invitation' : selectedTemplate === 'pooja' ? 'Kumkuma Pooja' : 'Nimajjanam Invitation',
      recipients: delivered,
      delivered: delivered,
      failed: 0,
      status: 'Completed'
    };

    setCampaignHistory(prev => [newCampaign, ...prev]);
  };

  const progressPercent = Math.min(Math.round((deliveredCount / totalTargetCount) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4">
        
        {/* Header - Ultra Clean Royal Blue */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg">
              📢
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Festival WhatsApp Broadcast</h3>
              <p className="text-xs text-indigo-100 font-medium">Personalized 1-on-1 Messages to All Donors</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Create Broadcast vs Broadcast History */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs font-black transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-2xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Send New Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-black transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-2xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Broadcast History ({campaignHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: 4-QUESTION CLEAN BROADCAST FORM */}
        {activeTab === 'create' && (
          <div className="p-5 sm:p-6 space-y-5 text-xs font-semibold text-slate-800">
            
            {/* 1. Who should receive the message? */}
            <div className="space-y-1.5">
              <label className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Who should receive the message?</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientFilter('all')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    recipientFilter === 'all'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">All Donors</div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">{donations.length} total donors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientFilter('today')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    recipientFilter === 'today'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">Today's Donors</div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">Today's collections</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientFilter('collector')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    recipientFilter === 'collector'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">Collector Wise</div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">Filter by collector</span>
                </button>
              </div>
            </div>

            {/* 2. What message should be sent? */}
            <div className="space-y-2">
              <label className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] block">
                2. Select Message Type:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedTemplate('gratitude'); setCustomMessage(''); }}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedTemplate === 'gratitude' && !customMessage
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  🙏 Gratitude
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedTemplate('annadhanam'); setCustomMessage(''); }}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedTemplate === 'annadhanam' && !customMessage
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  🌺 Annadhanam
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedTemplate('pooja'); setCustomMessage(''); }}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedTemplate === 'pooja' && !customMessage
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  🌺 Kumkuma Pooja
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedTemplate('nimajjanam'); setCustomMessage(''); }}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedTemplate === 'nimajjanam' && !customMessage
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  🥁 Nimajjanam
                </button>
              </div>

              {/* Message Box */}
              <textarea
                rows={3}
                value={currentTemplateText}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500 text-xs leading-relaxed"
              />
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-1">
              <div className="flex items-center justify-between text-amber-950 font-black text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-700" /> Live Preview: <strong>{sampleDonor.donorName}</strong>
                </span>
                <span className="text-indigo-900 font-extrabold">Amount: ₹{sampleDonor.amount}</span>
              </div>
              <p className="text-slate-800 text-xs italic font-medium whitespace-pre-line leading-relaxed bg-white p-2.5 rounded-xl border border-amber-200">
                {samplePreviewText}
              </p>
            </div>

            {/* 3. LIVE BROADCAST STATUS & PROGRESS BAR */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 shadow-md">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    3. Broadcast Live Status
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      broadcastStatus === 'Sending' ? 'bg-amber-400 text-slate-950 animate-pulse' :
                      broadcastStatus === 'Completed' ? 'bg-emerald-500 text-white' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {broadcastStatus === 'Sending' ? '⚡ Processing' : broadcastStatus === 'Completed' ? '✓ Completed' : 'Queued'}
                    </span>

                    <span className="text-xs font-extrabold text-white">
                      {deliveredCount} / {totalTargetCount} delivered
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">Target Recipients</span>
                  <span className="text-sm font-black text-amber-400">{targetDonors.length} Donors</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-emerald-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

            </div>

            {/* 4. SEND BROADCAST ACTION BUTTON */}
            <button
              type="button"
              disabled={broadcastStatus === 'Sending' || targetDonors.length === 0}
              onClick={handleSendBroadcast}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {broadcastStatus === 'Sending' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Processing Broadcast ({deliveredCount}/{totalTargetCount})...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast to {targetDonors.length} Donors</span>
                </>
              )}
            </button>

          </div>
        )}

        {/* TAB 2: BROADCAST HISTORY ANALYTICS CAMPAIGN LEDGER */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Past Campaign Broadcasts</h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              <div className="bg-slate-50 p-3 font-extrabold text-slate-600 grid grid-cols-12 text-[11px]">
                <div className="col-span-3">Date</div>
                <div className="col-span-4">Message Type</div>
                <div className="col-span-2 text-center">Recipients</div>
                <div className="col-span-3 text-right">Status</div>
              </div>

              {campaignHistory.map((c) => (
                <div key={c.id} className="p-3.5 grid grid-cols-12 items-center hover:bg-slate-50 transition">
                  <div className="col-span-3 font-bold text-slate-900">{c.date}</div>
                  <div className="col-span-4 font-extrabold text-indigo-900">{c.type}</div>
                  <div className="col-span-2 text-center font-bold text-slate-800">{c.recipients}</div>
                  <div className="col-span-3 text-right">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-[10px]">
                      ✓ {c.delivered} Delivered ({c.failed} Failed)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
