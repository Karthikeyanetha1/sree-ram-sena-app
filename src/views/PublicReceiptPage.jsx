import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  Share2, 
  Search, 
  CheckCircle2, 
  MapPin
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper function to convert numbers into Indian rupees words
function numberToWords(num) {
  if (!num) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const n = ('000000000' + Math.floor(num)).substr(-9);
  const match = n.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!match) return `${num} Rupees Only`;
  
  let str = '';
  str += (match[1] != 0) ? (a[Number(match[1])] || b[match[1][0]] + ' ' + a[match[1][1]]) + 'Crore ' : '';
  str += (match[2] != 0) ? (a[Number(match[2])] || b[match[2][0]] + ' ' + a[match[2][1]]) + 'Lakh ' : '';
  str += (match[3] != 0) ? (a[Number(match[3])] || b[match[3][0]] + ' ' + a[match[3][1]]) + 'Thousand ' : '';
  str += (match[4] != 0) ? (a[Number(match[4])] || b[match[4][0]] + ' ' + a[match[4][1]]) + 'Hundred ' : '';
  str += (match[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(match[5])] || b[match[5][0]] + ' ' + a[match[5][1]]) : '';
  return str ? `${str.trim()} Rupees Only` : `${num} Rupees Only`;
}

export const PublicReceiptPage = ({ initialReceiptNo }) => {
  const [receiptNo, setReceiptNo] = useState(initialReceiptNo || '');
  const [searchInput, setSearchInput] = useState(initialReceiptNo || '');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchReceipt = (noToFetch) => {
    if (!noToFetch) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setNotFound(false);

    fetch(`/api/get-receipt?receiptNo=${encodeURIComponent(noToFetch.trim())}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.donation) {
          setReceipt(data.donation);
          setNotFound(false);
        } else {
          setReceipt(null);
          setNotFound(true);
        }
      })
      .catch(err => {
        console.warn("Public receipt fetch error:", err);
        setReceipt(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialReceiptNo) {
      fetchReceipt(initialReceiptNo);
    } else {
      setLoading(false);
    }
  }, [initialReceiptNo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    window.history.pushState({}, '', `/receipt/${encodeURIComponent(searchInput.trim())}`);
    setReceiptNo(searchInput.trim());
    fetchReceipt(searchInput.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const receiptElem = document.getElementById('public-receipt-card');
      if (!receiptElem) return;

      const canvas = await html2canvas(receiptElem, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SRS-Receipt-${receipt?.receiptNo || '2026'}.pdf`);
    } catch (err) {
      console.warn("PDF Download note:", err);
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    const rNo = receipt?.receiptNo || receiptNo;
    const cleanUrl = `https://sree-ram-sena-app.vercel.app/receipt/${encodeURIComponent(rNo)}`;
    const text = `🙏 *SREE RAM SENA VINAYAKA CHAVITHI 2026*
Official Digital Donation Receipt

*Receipt No:* ${rNo}
*Donor Name:* ${receipt?.donorName || 'Devotee'}
*Amount:* ₹ ${parseFloat(receipt?.amount || 0).toLocaleString('en-IN')}/-
*Status:* Verified Genuine ✓

📄 *View, Print & Download Receipt PDF:*
${cleanUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentUrl = `https://sree-ram-sena-app.vercel.app/receipt/${encodeURIComponent(receipt?.receiptNo || receiptNo)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 font-sans">
      
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            🕉️
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide">SREE RAM SENA</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Vinayaka Chavithi 2026 • Official Verification</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Verification</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto my-6 flex-1 flex flex-col justify-center">
        
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse mx-auto">
              <span className="text-3xl">🌺</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">Retrieving Official Digital Receipt...</h2>
            <p className="text-xs text-slate-400">Verifying cryptographically signed receipt record on SREE RAM SENA ledger.</p>
          </div>
        ) : notFound ? (
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-3xl mx-auto">
              ⚠️
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Receipt Record Not Found</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                No official receipt matching <strong className="text-amber-300 font-mono">{receiptNo || searchInput || 'ID'}</strong> was found in the SREE RAM SENA 2026 database.
              </p>
            </div>

            {/* Receipt Lookup Form */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Receipt # (e.g. SRS-2026-000001)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition"
              >
                Verify Now
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Action Bar Above Receipt */}
            <div className="flex items-center justify-between px-1 no-print">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Genuine Receipt</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center space-x-1 bg-emerald-950 hover:bg-black text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CARD */}
            <div 
              id="public-receipt-card"
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400/80 relative overflow-hidden space-y-6"
            >
              {/* Marigold Decorative Top Border */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

              {/* Receipt Header & Artwork */}
              <div className="flex items-start justify-between border-b border-amber-200 pb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-amber-300">
                    🌺
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                      SREE RAM SENA • VINAYAKA CHAVITHI 2026
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                      Official Seva Receipt
                    </h2>
                    <p className="text-xs font-bold text-slate-600">Govindhupalli, Jagtial, Telangana</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-amber-100 text-amber-950 text-xs font-black px-3 py-1 rounded-full border border-amber-300 inline-block font-mono">
                    {receipt?.receiptNo}
                  </span>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">Date: {receipt?.date || '2026'}</p>
                </div>
              </div>

              {/* Main Receipt Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Devotee / Donor Name</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{receipt?.donorName}</h3>
                  {receipt?.village && (
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{receipt.village}</span>
                    </span>
                  )}
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Donation Amount</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-0.5 font-mono">
                    ₹ {parseFloat(receipt?.amount || 0).toLocaleString('en-IN')}/-
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-1">
                    Payment Method: {receipt?.paymentMethod || 'UPI'}
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amount in Words</span>
                  <p className="text-xs font-black text-slate-800 italic mt-0.5">
                    {numberToWords(parseFloat(receipt?.amount || 0))}
                  </p>
                </div>

                {receipt?.collector && (
                  <div className="sm:col-span-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Collector / Receipt Officer</span>
                      <p className="text-xs font-black text-amber-950 mt-0.5">🤝 {receipt.collector}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                        Status: SUCCESSFUL ✓
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Verification Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <QRCodeSVG value={currentUrl} size={70} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                      Cryptographic Authenticity
                    </span>
                    <p className="text-[10px] text-slate-500 max-w-xs">
                      Scan QR code or open permanent link to verify authenticity on SREE RAM SENA ledger.
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-950 px-3 py-1 rounded-full text-xs font-black border border-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Verified Genuine</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">ID: {receipt?.id || receipt?.receiptNo}</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-2xl w-full mx-auto text-center py-4 border-t border-slate-900 text-slate-500 text-[11px] font-semibold">
        <p>© 2026 SREE RAM SENA Vinayaka Chavithi Seva Samithi. All Rights Reserved.</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Powered by codewithk developer • Divine Manager Platform</p>
      </footer>

    </div>
  );
};
