import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendAutomatedWhatsAppReceipt } from '../utils/whatsappAutomation';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  QrCode, 
  X, 
  CheckCircle2, 
  Camera, 
  Mic, 
  AlertCircle,
  Phone,
  Trash2,
  Edit3,
  Check,
  Send,
  Sparkles,
  Zap
} from 'lucide-react';

export const DonationsView = ({ onViewReceipt, openAddModal, setOpenAddModal, onOpenOcr }) => {
  const { t, donations, addDonation, deleteDonation, updateDonation, committeeInfo, role } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [mobileError, setMobileError] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationNotice, setDictationNotice] = useState('');

  // Edit Modal State
  const [editingDonation, setEditingDonation] = useState(null);

  // New Donation Form State
  const [formData, setFormData] = useState({
    donorName: '',
    mobile: '',
    village: 'Govindhupalli',
    address: 'Govindhupalli',
    amount: '',
    paymentMethod: 'UPI',
    category: 'General Donation',
    notes: ''
  });

  // Intelligent Text / Voice Field Extractor
  const parseDictationText = (text) => {
    if (!text) return;

    // 1. Extract 10-Digit Mobile Number
    const mobileMatch = text.match(/[6-9]\d{9}/);
    const extractedMobile = mobileMatch ? mobileMatch[0] : formData.mobile;

    // 2. Extract Numbers for Amount
    const numberMatches = text.match(/\d+/g);
    let extractedAmount = formData.amount;
    
    if (numberMatches) {
      const possibleAmounts = numberMatches.filter(n => n.length !== 10 && parseInt(n) > 0);
      if (possibleAmounts.length > 0) {
        extractedAmount = possibleAmounts[0];
      }
    }

    // 3. Extract Payment Method
    let paymentMethod = 'UPI';
    if (/cash|క్యాష్|నగదు/i.test(text)) paymentMethod = 'Cash';
    if (/qr|upi/i.test(text)) paymentMethod = 'UPI';

    // 4. Extract Category
    let category = 'General Donation';
    if (/annadhanam|అన్నదానం|food/i.test(text)) category = 'Annadhanam Sponsor';
    if (/pooja|archana|పూజ/i.test(text)) category = 'Pooja & Archana';
    if (/flower|decoration|అలంకరణ/i.test(text)) category = 'Decoration & Flowers';

    // 5. Extract Village / Area
    let village = 'Govindhupalli';
    if (/jagtial|జగిత్యాల/i.test(text)) village = 'Jagtial';

    // 6. Extract Donor Name
    let donorName = text
      .replace(/[6-9]\d{9}/g, '')
      .replace(/\d+/g, '')
      .replace(/annadhanam|pooja|archana|flower|decoration|cash|upi|qr|rupees|రూపాయలు| donation|general/gi, '')
      .trim();

    if (!donorName) donorName = formData.donorName || 'Roi';

    setFormData(prev => ({
      ...prev,
      donorName,
      mobile: extractedMobile,
      amount: extractedAmount,
      village,
      paymentMethod,
      category
    }));

    setDictationNotice(`Parsed: ${donorName}, ₹${extractedAmount || 0}, ${extractedMobile || 'No Mobile'}, ${paymentMethod}, ${category}`);
  };

  const startFormVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use the quick voice fill buttons below or Chrome browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsDictating(true);
        setDictationNotice('🎙️ Listening... Speak Name, Mobile, Amount, Payment Method, Category (e.g. "Roi 9887665541 10000 UPI Annadhanam")');
      };

      recognition.onend = () => setIsDictating(false);

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        parseDictationText(text);
      };

      recognition.onerror = (event) => {
        setIsDictating(false);
        console.warn('Speech recognition warning:', event.error);
        setDictationNotice(`Mic notice (${event.error}). You can also use the Quick Sample Voice buttons below!`);
      };

      recognition.start();
    } catch (err) {
      console.warn('Dictation error:', err.message);
      setIsDictating(false);
    }
  };

  const handleMobileChange = (val) => {
    const cleanNum = val.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, mobile: cleanNum });

    if (cleanNum.length > 0 && cleanNum.length < 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
    } else if (cleanNum.length === 10 && !/^[6-9]\d{9}$/.test(cleanNum)) {
      setMobileError('Must be a valid 10-digit Indian mobile number starting with 6-9.');
    } else {
      setMobileError('');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.donorName || !formData.amount) {
      alert('Please enter Donor Name and Amount');
      return;
    }

    if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile)) {
      setMobileError('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
      return;
    }

    const created = await addDonation(formData);
    setOpenAddModal(false);

    // AUTOMATION: Launch pre-filled WhatsApp message tab to donor's mobile!
    sendAutomatedWhatsAppReceipt(created, committeeInfo);

    onViewReceipt(created);

    setFormData({
      donorName: '',
      mobile: '',
      village: 'Govindhupalli',
      address: 'Govindhupalli',
      amount: '',
      paymentMethod: 'UPI',
      category: 'General Donation',
      notes: ''
    });
    setMobileError('');
    setDictationNotice('');
  };

  const handleDelete = (receiptNo, donorName) => {
    if (window.confirm(`Are you sure you want to delete receipt ${receiptNo} (${donorName})? This action will be logged in the Security Audit Trail.`)) {
      deleteDonation(receiptNo);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDonation) return;

    updateDonation(editingDonation.receiptNo, editingDonation);
    setEditingDonation(null);
  };

  const filteredDonations = donations.filter((d) => {
    const matchesSearch = 
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mobile.includes(searchQuery) ||
      d.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'All' || d.paymentMethod === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.donationsLedger}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified donation receipts ledger with automated WhatsApp receipt delivery.
          </p>
        </div>

        {role !== 'Viewer' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenOcr}
              className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>AI Slip OCR</span>
            </button>

            <button
              onClick={() => setOpenAddModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.newDonation}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Donor, Receipt #, Mobile..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Mode:
          </span>
          {['All', 'UPI', 'Cash', 'QR Code'].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentFilter(method)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                paymentFilter === method
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>

      </div>

      {/* Donations List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-card overflow-hidden">
        
        {filteredDonations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">No Donations Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click New Donation or use AI Voice Entry to record your first receipt. Auto-WhatsApp launch is active.
            </p>
            {role !== 'Viewer' && (
              <button
                onClick={() => setOpenAddModal(true)}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Issue First Receipt</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">{t.receiptNo}</th>
                  <th className="py-3.5 px-4">{t.donorName}</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Village</th>
                  <th className="py-3.5 px-4">{t.amount}</th>
                  <th className="py-3.5 px-4">{t.paymentMethod}</th>
                  <th className="py-3.5 px-4">{t.collector}</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDonations.map((d, index) => (
                  <tr key={d.id || d.receiptNo || index} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{d.receiptNo}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{d.donorName}</td>
                    <td className="py-3 px-4 text-slate-600">{d.mobile}</td>
                    <td className="py-3 px-4 text-slate-700">{d.village}</td>
                    <td className="py-3 px-4 font-black text-emerald-950">₹{d.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        d.paymentMethod === 'UPI' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {d.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{d.collector}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onViewReceipt(d)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-extrabold shadow-xs transition"
                        >
                          View
                        </button>

                        <button
                          onClick={() => sendAutomatedWhatsAppReceipt(d, committeeInfo)}
                          className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition"
                          title="Auto WhatsApp Send"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {role === 'Super Admin' && (
                          <>
                            <button
                              onClick={() => setEditingDonation({ ...d })}
                              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="Edit Receipt"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(d.receiptNo, d.donorName)}
                              className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                              title="Delete Receipt"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* EDIT DONATION MODAL */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden my-8">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm">Edit Receipt {editingDonation.receiptNo}</h3>
              <button onClick={() => setEditingDonation(null)} className="text-white hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Donor Name</label>
                <input
                  type="text"
                  value={editingDonation.donorName}
                  onChange={(e) => setEditingDonation({ ...editingDonation, donorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editingDonation.amount}
                  onChange={(e) => setEditingDonation({ ...editingDonation, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-black text-emerald-800"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Mobile</label>
                <input
                  type="text"
                  maxLength={10}
                  value={editingDonation.mobile}
                  onChange={(e) => setEditingDonation({ ...editingDonation, mobile: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Village</label>
                <input
                  type="text"
                  value={editingDonation.village}
                  onChange={(e) => setEditingDonation({ ...editingDonation, village: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-extrabold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DONATION MODAL WITH INLINE VOICE DICTATION & QUICK SAMPLE VOICE FILL */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden my-8">
            
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base">Issue New Donation Receipt</h3>
                <button
                  type="button"
                  onClick={startFormVoiceDictation}
                  className={`p-1.5 rounded-full transition ${
                    isDictating ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Click to speak form details"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setOpenAddModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dictation Status / Quick Voice Presets Bar */}
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> AI Voice Quick-Fill Presets
                </span>
                <span className="text-[9px] text-emerald-700 font-bold">1-Click Dictation Test</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => parseDictationText("Roi 9887665541 10000 UPI Annadhanam")}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold shadow-xs transition"
                >
                  🎙️ "Roi 9887665541 10000 UPI Annadhanam"
                </button>
                <button
                  type="button"
                  onClick={() => parseDictationText("Ramesh Sharma 9876543210 5000 Cash Pooja")}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold shadow-xs transition"
                >
                  🎙️ "Ramesh 9876543210 5000 Cash Pooja"
                </button>
              </div>

              {dictationNotice && (
                <p className="text-[10px] font-bold text-emerald-900 italic mt-1">{dictationNotice}</p>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs font-semibold">
              
              <div>
                <label className="text-slate-700 font-bold block mb-1">Donor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  placeholder="e.g. Roi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mobile Number (10 Digits)</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="9887665541"
                      className={`w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-900 outline-none ${
                        mobileError ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {mobileError && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">{mobileError}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="10000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-900 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Village / Area</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="QR Code">QR Code</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none"
                >
                  <option value="General Donation">General Donation</option>
                  <option value="Annadhanam Sponsor">Annadhanam Sponsor</option>
                  <option value="Pooja & Archana">Pooja & Archana</option>
                  <option value="Decoration & Flowers">Decoration & Flowers</option>
                  <option value="Cultural Events">Cultural Events</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Remarks / Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional remarks"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Receipt & Auto WhatsApp</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
