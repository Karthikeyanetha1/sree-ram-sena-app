import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, X, Volume2, CheckCircle, RefreshCw, AlertCircle, Sparkles, Send, Zap, ShieldCheck } from 'lucide-react';

export const VoiceAssistantModal = ({ isOpen, onClose, onAddDonationFromVoice, onAddExpenseFromVoice }) => {
  const { lang, t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);
  
  const [parsedData, setParsedData] = useState({
    donorName: 'Roi',
    mobile: '9887665541',
    amount: '10000',
    village: 'Govindhupalli',
    paymentMethod: 'UPI',
    category: 'General Donation'
  });
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Initialize with sample parser data
      parseVoiceInput("Roi 9887665541 10000 Govindhupalli UPI");
      setVoiceConfirmed(false);
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage('⚠️ Speech recognition is not supported over HTTP by this browser. Type below or use quick fill buttons!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('🎙️ Listening now... Speak Name, Mobile, Amount (e.g. "Roi 9887665541 10000")');
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        parseVoiceInput(text);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setStatusMessage('🔒 Microphone access blocked by browser over HTTP IP. Please allow mic in browser settings or type input below!');
        } else if (event.error === 'network') {
          setStatusMessage('🌐 Speech network service unavailable over local HTTP. Type input or use Quick-Fill presets below!');
        } else {
          setStatusMessage(`Mic notice (${event.error}). Type or use Quick-Fill presets below!`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice recognition error:', err.message);
      setIsListening(false);
      setStatusMessage('Type or use Quick-Fill presets below!');
    }
  };

  // ENHANCED VOICE / TEXT PARSER
  const parseVoiceInput = (text) => {
    if (!text) return;

    // 1. Extract 10-Digit Mobile Number
    const mobileMatch = text.match(/[6-9]\d{9}/);
    const extractedMobile = mobileMatch ? mobileMatch[0] : parsedData.mobile;

    // 2. Extract Numbers for Amount
    const numberMatches = text.match(/\d+/g);
    let extractedAmount = parsedData.amount;
    
    if (numberMatches) {
      const possibleAmounts = numberMatches.filter(n => n.length !== 10 && parseInt(n) > 0);
      if (possibleAmounts.length > 0) {
        extractedAmount = possibleAmounts[0];
      }
    }

    // 3. Extract Payment Method
    let paymentMethod = 'UPI';
    if (/cash|క్యాష్|నగదు/i.test(text)) paymentMethod = 'Cash';

    // 4. Extract Category
    let category = 'General Donation';
    if (/annadhanam|అన్నదానం|food/i.test(text)) category = 'Annadhanam Sponsor';
    if (/pooja|archana|పూజ/i.test(text)) category = 'Pooja & Archana';

    // 5. Extract Village / Area
    let village = 'Govindhupalli';
    if (/jagtial|జగిత్యాల/i.test(text)) village = 'Jagtial';

    // 6. Extract Donor Name
    let donorName = text
      .replace(/[6-9]\d{9}/g, '')
      .replace(/\d+/g, '')
      .replace(/annadhanam|pooja|archana|cash|upi|qr|rupees|రూపాయలు|donation|general/gi, '')
      .trim();

    if (!donorName) donorName = parsedData.donorName || 'Roi';

    const updated = {
      donorName,
      mobile: extractedMobile,
      amount: extractedAmount,
      village,
      paymentMethod,
      category
    };

    setParsedData(updated);
    setStatusMessage(`✓ Extracted: ${donorName}, ₹${extractedAmount}, Mobile: ${extractedMobile}, ${paymentMethod}`);
  };

  const handleManualTextParse = (e) => {
    e.preventDefault();
    parseVoiceInput(inputText);
  };

  const handleConfirmAndSave = () => {
    if (!parsedData.donorName || !parsedData.amount) {
      alert('Please enter Donor Name and Amount.');
      return;
    }

    onAddDonationFromVoice(parsedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h3 className="font-extrabold text-base">AI Voice & Smart Assistant</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-semibold text-slate-800">
          
          {/* Animated Microphone Trigger Button */}
          <div className="text-center space-y-2">
            <button
              onClick={startListening}
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition shadow-lg ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Click to activate voice mic"
            >
              <Mic className="w-8 h-8" />
            </button>

            <span className="text-xs font-extrabold text-slate-700 block">
              {isListening ? '🎙️ Listening... Speak Now' : 'Click Mic to Speak Voice Command'}
            </span>
          </div>

          {/* Status / Notice Box */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs font-bold leading-snug ${
              statusMessage.includes('🔒') || statusMessage.includes('⚠️') || statusMessage.includes('🌐')
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Voice / Text Dictation Input Bar */}
          <form onSubmit={handleManualTextParse} className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
              Or Type Voice Command / Dictation Below
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='e.g. "Roi 9887665541 10000 Govindhupalli UPI"'
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs shadow-xs"
              >
                Parse
              </button>
            </div>
          </form>

          {/* Quick-Fill Presets Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Quick Voice Sample Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputText("Roi 9887665541 10000 Govindhupalli UPI Annadhanam");
                  parseVoiceInput("Roi 9887665541 10000 Govindhupalli UPI Annadhanam");
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold shadow-xs transition"
              >
                🎙️ "Roi 9887665541 10000 UPI"
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText("Ramesh Sharma 9876543210 5000 Cash Pooja");
                  parseVoiceInput("Ramesh Sharma 9876543210 5000 Cash Pooja");
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold shadow-xs transition"
              >
                🎙️ "Ramesh 9876543210 5000 Cash"
              </button>
            </div>
          </div>

          {/* VOICE CONFIRMATION SUMMARY CARD BEFORE SAVING */}
          <div className="p-4 bg-emerald-950 text-white rounded-2xl border-2 border-emerald-600 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Voice Confirmation Summary
              </span>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Review Before Save
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-emerald-300 font-bold block">DONOR NAME:</span>
                <input
                  type="text"
                  value={parsedData.donorName}
                  onChange={(e) => setParsedData({ ...parsedData, donorName: e.target.value })}
                  className="w-full px-2 py-1 bg-emerald-900 border border-emerald-700 rounded-lg font-bold text-white text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-emerald-300 font-bold block">AMOUNT:</span>
                <input
                  type="number"
                  value={parsedData.amount}
                  onChange={(e) => setParsedData({ ...parsedData, amount: e.target.value })}
                  className="w-full px-2 py-1 bg-emerald-900 border border-emerald-700 rounded-lg font-black text-amber-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-emerald-300 font-bold block">MOBILE:</span>
                <input
                  type="text"
                  maxLength={10}
                  value={parsedData.mobile}
                  onChange={(e) => setParsedData({ ...parsedData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-2 py-1 bg-emerald-900 border border-emerald-700 rounded-lg font-bold text-white text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-emerald-300 font-bold block">PAYMENT METHOD:</span>
                <select
                  value={parsedData.paymentMethod}
                  onChange={(e) => setParsedData({ ...parsedData, paymentMethod: e.target.value })}
                  className="w-full px-2 py-1 bg-emerald-900 border border-emerald-700 rounded-lg font-bold text-white text-xs"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="QR Code">QR Code</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={startListening}
              className="flex items-center space-x-1 text-slate-600 hover:text-emerald-700 font-bold text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-speak / Edit</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndSave}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-black text-xs shadow-md flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4 text-emerald-200" />
                <span>Confirm & Save Receipt</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
