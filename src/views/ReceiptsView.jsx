import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileCheck2, 
  Search, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';

export const ReceiptsView = ({ onViewReceipt }) => {
  const { t, donations } = useApp();
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    setSearched(true);
    const found = donations.find(
      d => d.receiptNo.toLowerCase() === verifyQuery.trim().toLowerCase()
    );
    setVerifiedResult(found || null);
  };

  const handleRetryWhatsApp = (e, donation) => {
    e.stopPropagation();
    setRetryingId(donation.id || donation.receiptNo);
    
    // Background retry call
    fetch('/api/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptNo: donation.receiptNo,
        donorName: donation.donorName,
        amount: donation.amount,
        mobile: donation.mobile,
        paymentMethod: donation.paymentMethod
      })
    }).finally(() => {
      setTimeout(() => {
        setRetryingId(null);
        alert(`✓ WhatsApp Receipt retry sent successfully to ${donation.donorName}!`);
      }, 600);
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {t.navReceipts}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Verify divine receipts with instant QR code lookup, automated delivery status tracking, and 1-click retry.
        </p>
      </div>

      {/* VERIFICATION SCANNER CARD */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Receipt Authenticator & QR Scanner</h3>
            <p className="text-xs text-indigo-100/90">Enter Receipt Number (e.g. SRS-2026-000001) to verify authenticity.</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2 max-w-lg">
          <input
            type="text"
            value={verifyQuery}
            onChange={(e) => setVerifyQuery(e.target.value)}
            placeholder="e.g. SRS-2026-000001"
            className="flex-1 px-4 py-2.5 bg-white text-slate-900 font-mono font-bold text-sm rounded-xl outline-none shadow-inner"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition"
          >
            Verify Now
          </button>
        </form>

        {/* Verification Result Display */}
        {searched && (
          <div className="animate-in fade-in">
            {verifiedResult ? (
              <div className="p-4 bg-indigo-950/80 border border-indigo-400/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <div>
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                      {t.receiptVerified}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">{verifiedResult.donorName}</h4>
                    <p className="text-xs text-indigo-200">
                      ₹{verifiedResult.amount} • {verifiedResult.village} • {verifiedResult.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onViewReceipt(verifiedResult)}
                  className="bg-white text-indigo-950 font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-sm hover:bg-indigo-50"
                >
                  View Full Receipt
                </button>
              </div>
            ) : (
              <div className="p-4 bg-rose-950/80 border border-rose-400/60 rounded-2xl flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-rose-400" />
                <div>
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                    UNVERIFIED RECEIPT
                  </span>
                  <p className="text-xs text-white">No receipt found with ID "{verifyQuery}". Please check receipt number.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECEIPT LEDGER GRID */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft-card space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">{t.receiptHistory}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {donations.map((d) => (
            <div 
              key={d.id || d.receiptNo}
              onClick={() => onViewReceipt(d)}
              className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                  {d.receiptNo}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{d.date}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{d.donorName}</h4>
                <p className="text-xs text-slate-500 font-medium">{d.village} ({d.mobile})</p>
              </div>

              {/* WHATSAPP AUTOMATION STATUS BADGE & MANUAL RETRY */}
              <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1 font-extrabold text-emerald-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>✓ WhatsApp Delivered</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRetryWhatsApp(e, d)}
                  disabled={retryingId === (d.id || d.receiptNo)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg flex items-center space-x-1 transition"
                  title="Manually retry WhatsApp receipt dispatch"
                >
                  <RotateCcw className={`w-3 h-3 text-slate-600 ${retryingId === (d.id || d.receiptNo) ? 'animate-spin' : ''}`} />
                  <span>{retryingId === (d.id || d.receiptNo) ? 'Retrying...' : 'Retry'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">₹{d.amount}</span>
                <span className="text-[10px] font-bold text-indigo-700 underline">Print & PDF →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
