import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { scanReceiptSlip, scanVendorBill } from '../utils/aiScanner';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export const AiOcrModal = ({ isOpen, onClose, mode = 'donation', onSaveExtractedDonation, onSaveExtractedExpense }) => {
  const { t } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uncertainFields, setUncertainFields] = useState([]);

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsScanning(true);
    setExtractedData(null);
    setUncertainFields([]);

    if (mode === 'expense') {
      const result = await scanVendorBill(file);
      setExtractedData(result);
      // Simulate low confidence on Remarks
      setUncertainFields(['remarks']);
    } else {
      const result = await scanReceiptSlip(file);
      setExtractedData(result);
      // Simulate low confidence check on Village for 1-tap correction test
      setUncertainFields(['village']);
    }

    setIsScanning(false);
  };

  const handleConfirm = () => {
    if (!extractedData) return;

    if (mode === 'expense') {
      onSaveExtractedExpense(extractedData);
    } else {
      onSaveExtractedDonation(extractedData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {mode === 'expense' ? "AI Vendor Bill OCR Scanner" : "AI Receipt Slip OCR Scanner"}
              </h3>
              <p className="text-xs text-emerald-100/90">OCR field extraction with uncertain field verification.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Upload Dropzone */}
          {!previewUrl && (
            <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-3xl p-8 bg-emerald-50/50 hover:bg-emerald-50 text-center flex flex-col items-center justify-center cursor-pointer transition space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Upload or Snap Photo</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                {mode === 'expense' 
                  ? "Upload vendor bill / receipt photo to extract Vendor, Amount & Category"
                  : "Upload handwritten slip / old receipt to extract Name, Amount & Mobile"
                }
              </p>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          )}

          {/* Image Preview & Scanning Indicator */}
          {previewUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
              <img src={previewUrl} alt="OCR Preview" className="max-h-48 object-contain opacity-80" />
              {isScanning && (
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs font-extrabold text-emerald-300">AI Extracting Text...</span>
                </div>
              )}
            </div>
          )}

          {/* Extracted Fields Review Form with Uncertain Field Highlights */}
          {extractedData && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-left space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Review Extracted Fields (Editable)
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                  Confidence: {extractedData.confidence || '95%'}
                </span>
              </div>

              {uncertainFields.length > 0 && (
                <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl flex items-center space-x-2 text-amber-900 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Low OCR confidence on highlighted fields. Please verify before saving.</span>
                </div>
              )}

              {mode === 'expense' ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Vendor Name</label>
                    <input 
                      type="text" 
                      value={extractedData.vendor} 
                      onChange={(e) => setExtractedData({...extractedData, vendor: e.target.value})}
                      className="w-full bg-white px-2.5 py-1.5 border border-emerald-300 rounded-lg font-bold text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Amount (₹)</label>
                    <input 
                      type="text" 
                      value={extractedData.amount} 
                      onChange={(e) => setExtractedData({...extractedData, amount: e.target.value})}
                      className="w-full bg-white px-2.5 py-1.5 border border-emerald-300 rounded-lg font-black text-emerald-800" 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Donor Name</label>
                    <input 
                      type="text" 
                      value={extractedData.donorName} 
                      onChange={(e) => setExtractedData({...extractedData, donorName: e.target.value})}
                      className="w-full bg-white px-2.5 py-1.5 border border-emerald-300 rounded-lg font-bold text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Mobile Number</label>
                    <input 
                      type="text" 
                      value={extractedData.mobile} 
                      onChange={(e) => setExtractedData({...extractedData, mobile: e.target.value})}
                      className="w-full bg-white px-2.5 py-1.5 border border-emerald-300 rounded-lg font-semibold text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Amount (₹)</label>
                    <input 
                      type="text" 
                      value={extractedData.amount} 
                      onChange={(e) => setExtractedData({...extractedData, amount: e.target.value})}
                      className="w-full bg-white px-2.5 py-1.5 border border-emerald-300 rounded-lg font-black text-emerald-800" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center justify-between">
                      <span>Village</span>
                      {uncertainFields.includes('village') && <span className="text-[9px] font-bold text-amber-700">Verify</span>}
                    </label>
                    <input 
                      type="text" 
                      value={extractedData.village} 
                      onChange={(e) => setExtractedData({...extractedData, village: e.target.value})}
                      className={`w-full px-2.5 py-1.5 border rounded-lg font-semibold text-slate-800 ${
                        uncertainFields.includes('village') ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-emerald-300'
                      }`} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => { setPreviewUrl(null); setExtractedData(null); }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Reset Image
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            {extractedData && (
              <button
                onClick={handleConfirm}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Save Entry</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
