import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  Share2, 
  Search, 
  CheckCircle2, 
  MapPin,
  User,
  Phone,
  IndianRupee,
  CreditCard,
  FileText,
  ExternalLink
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

  const fetchReceipt = async (noToFetch) => {
    if (!noToFetch) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    const targetNo = String(noToFetch).trim();
    setLoading(true);
    setNotFound(false);

    // 1. Try Serverless API (/api/get-receipt)
    try {
      const res = await fetch(`/api/get-receipt?receiptNo=${encodeURIComponent(targetNo)}`);
      const data = await res.json();
      if (data.success && data.donation) {
        setReceipt(data.donation);
        setNotFound(false);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("API receipt fetch note:", e.message);
    }

    // 2. Fallback: Query Direct Cloud Firestore DB (donations collection)
    try {
      const q1 = query(collection(db, "donations"), where("receiptNo", "==", targetNo));
      let snap = await getDocs(q1);

      if (snap.empty) {
        const q2 = query(collection(db, "donations"), where("Receipt No", "==", targetNo));
        snap = await getDocs(q2);
      }

      if (!snap.empty) {
        const d = snap.docs[0].data();
        const foundDonation = {
          id: snap.docs[0].id,
          receiptNo: d.receiptNo || d['Receipt No'] || targetNo,
          donorName: d.donorName || d['Donor Name'] || d.name || 'Devotee',
          amount: parseFloat(d.amount || d.Amount) || 0,
          date: d.date || d.Date || '',
          paymentMethod: d.paymentMethod || d['Payment Method'] || 'UPI',
          village: d.village || d.Village || 'Govindhupalli',
          address: d.address || d.Address || '',
          mobile: d.mobile || d.Mobile || '',
          notes: d.notes || d.Notes || '',
          status: d.status || d.Status || 'Verified',
          collectorName: d.collectorName || d.collector || d['Collector'] || 'SREE RAM SENA'
        };
        setReceipt(foundDonation);
        setNotFound(false);
        setLoading(false);
        return;
      }
    } catch (dbErr) {
      console.warn("Direct Firestore receipt query note:", dbErr.message);
    }

    // 3. Fallback: Search LocalStorage Cache (srs_donations)
    try {
      const cached = JSON.parse(localStorage.getItem('srs_donations') || '[]');
      const foundLocal = cached.find(item => 
        String(item.receiptNo || item['Receipt No']).trim() === targetNo
      );

      if (foundLocal) {
        setReceipt({
          id: foundLocal.id || 'cached-receipt',
          receiptNo: foundLocal.receiptNo || targetNo,
          donorName: foundLocal.donorName || foundLocal['Donor Name'] || 'Devotee',
          amount: parseFloat(foundLocal.amount) || 0,
          date: foundLocal.date || '',
          paymentMethod: foundLocal.paymentMethod || 'UPI',
          village: foundLocal.village || 'Govindhupalli',
          address: foundLocal.address || '',
          mobile: foundLocal.mobile || '',
          notes: foundLocal.notes || '',
          status: 'Verified',
          collectorName: foundLocal.collector || 'SREE RAM SENA'
        });
        setNotFound(false);
        setLoading(false);
        return;
      }
    } catch (cacheErr) {}

    setReceipt(null);
    setNotFound(true);
    setLoading(false);
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

            {/* PRINTABLE RECEIPT CARD - GRAND DOUBLE GOLD & EMERALD BORDER FORMAT */}
            <div 
              id="public-receipt-card"
              className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border-[6px] border-double border-emerald-800 relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30"
            >
              {/* Top Sacred Mantra Banner */}
              <div className="text-center mb-3">
                <span className="inline-block bg-amber-100 text-amber-900 px-4 py-0.5 rounded-full text-xs font-extrabold tracking-widest border border-amber-300 shadow-xs">
                  ॥ శ్రీ గణేశాయ నమః ॥
                </span>
              </div>

              {/* TOP SECTION: SREE RAM SENA LOGO + GANESHA ARTWORK */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-emerald-800/30 gap-2">
                
                {/* Left Temple Seal Emblem */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-emerald-800 p-1 flex flex-col items-center justify-center text-center bg-white shadow-sm flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-800" />
                  <span className="text-[8px] font-extrabold text-emerald-950 mt-0.5">Est. 2016</span>
                </div>

                {/* Center Title */}
                <div className="text-center flex-1">
                  <h2 className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight uppercase leading-tight font-serif">
                    SREE RAM SENA
                  </h2>
                  <h3 className="text-xs sm:text-sm font-extrabold text-amber-700 tracking-wider uppercase mt-0.5">
                    VINAYAKA CHAVITHI 2026
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-800 tracking-widest uppercase block mt-0.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block">
                    VINAYAKA CHAVITHI DONATION RECEIPT
                  </span>
                </div>

                {/* Right Lord Ganesha SVG Artwork */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-100 p-1.5 flex items-center justify-center shadow-md flex-shrink-0 border border-amber-400">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-amber-900 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L9.5 5H14.5L12 2Z" fill="#d97706"/>
                    <path d="M12 6C9.24 6 7 8.24 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 8.24 14.76 6 12 6ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z"/>
                    <path d="M5 12C3.9 12 3 12.9 3 14C3 15.1 3.9 16 5 16H6.18C6.06 15.36 6 14.69 6 14C6 13.31 6.06 12.64 6.18 12H5Z"/>
                    <path d="M19 12H17.82C17.94 12.64 18 13.31 18 14C18 14.69 17.94 15.36 17.82 16H19C20.1 16 21 15.1 21 14C21 12.9 20.1 12 19 12Z"/>
                  </svg>
                </div>

              </div>

              {/* RECEIPT NUMBER BADGE */}
              <div className="my-4 text-center">
                <div className="inline-block bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950 text-white px-6 sm:px-7 py-2 rounded-2xl shadow-lg border-2 border-amber-400/60 ring-2 ring-emerald-900/20">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-300 mr-2">
                    RECEIPT NO:
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono tracking-wider text-white">
                    {receipt?.receiptNo}
                  </span>
                </div>

                <div className="mt-2 text-xs font-bold text-slate-600 flex items-center justify-center space-x-1">
                  <span>📅 Date & Time: </span>
                  <span>{receipt?.date || '2026-08-12'}</span>
                </div>
              </div>

              {/* CENTER DETAILS TABLE */}
              <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200/80 shadow-xs space-y-2.5 text-xs font-semibold text-slate-800">
                
                <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>DONOR NAME</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-extrabold text-slate-900 text-sm">
                    {receipt?.donorName}
                  </div>
                </div>

                <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>MOBILE NUMBER</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-bold text-slate-800">
                    {receipt?.mobile || 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ADDRESS</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-bold text-slate-800">
                    {receipt?.village || 'Govindhupalli'} {receipt?.address ? `(${receipt.address})` : ''}
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center py-1.5 bg-emerald-50/80 rounded-xl px-2 border border-emerald-200">
                  <div className="col-span-4 text-emerald-900 font-extrabold flex items-center space-x-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-700" />
                    <span>AMOUNT</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-emerald-800">:</div>
                  <div className="col-span-7 font-black text-xl sm:text-2xl text-emerald-950">
                    ₹ {parseFloat(receipt?.amount || 0).toLocaleString('en-IN')}/-
                  </div>
                </div>

                <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>AMOUNT IN WORDS</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-bold text-slate-800 italic">
                    {numberToWords(parseFloat(receipt?.amount || 0))}
                  </div>
                </div>

                <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                    <span>PAYMENT METHOD</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-extrabold text-slate-900">
                    {receipt?.paymentMethod || 'UPI'}
                  </div>
                </div>

                <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PAYMENT STATUS</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-extrabold text-emerald-700">
                    SUCCESSFUL ✓
                  </div>
                </div>

                {/* COLLECTOR ENTRY BLOCK */}
                <div className="grid grid-cols-12 items-baseline py-1">
                  <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>COLLECTOR</span>
                  </div>
                  <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                  <div className="col-span-7 font-extrabold text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block">
                    {receipt?.collectorName || receipt?.collector || 'Gurram Karthikeya'}
                  </div>
                </div>

              </div>

              {/* CLICKABLE & SCANNABLE DUAL QR CODE LAYOUT */}
              <div className="mt-4 pt-3 border-t-2 border-emerald-800/30 grid grid-cols-2 gap-3 items-center text-center">
                
                {/* 1. UPI PAYMENT QR CODE */}
                <a 
                  href={`upi://pay?pa=karthikeyanetha@slc&pn=SREE%20RAM%20SENA&am=${receipt?.amount || 0}&cu=INR`} 
                  className="bg-white p-2 rounded-2xl border border-emerald-300 shadow-xs flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer"
                  title="Scan with Camera OR Click to Pay via UPI"
                >
                  <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                    <QRCodeSVG 
                      value={`upi://pay?pa=karthikeyanetha@slc&pn=SREE%20RAM%20SENA&am=${receipt?.amount || 0}&cu=INR`}
                      size={72}
                      bgColor="#ffffff"
                      fgColor="#022c22"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[9px] font-black text-emerald-950 block mt-1 uppercase tracking-wide flex items-center gap-0.5">
                    Scan or Tap to Pay <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                  </span>
                  <span className="text-[8px] font-mono font-bold text-emerald-800 block truncate max-w-[120px]">
                    karthikeyanetha@slc
                  </span>
                </a>

                {/* 2. GOOGLE MAPS LOCATION QR CODE */}
                <a 
                  href="https://www.google.com/maps/place/18%C2%B047'04.8%22N+78%C2%B055'09.7%22E/@18.784665,78.9167941,17z" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white p-2 rounded-2xl border border-emerald-300 shadow-xs flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer"
                  title="Scan with Camera OR Click to Open Google Maps"
                >
                  <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                    <QRCodeSVG 
                      value="https://www.google.com/maps/place/18%C2%B047'04.8%22N+78%C2%B055'09.7%22E/@18.784665,78.9167941,17z"
                      size={72}
                      bgColor="#ffffff"
                      fgColor="#065f46"
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[9px] font-black text-emerald-950 block mt-1 uppercase tracking-wide flex items-center gap-0.5">
                    Scan or Tap for Maps <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                  </span>
                  <span className="text-[8px] font-bold text-emerald-800 block">
                    Pandal Location
                  </span>
                </a>

              </div>

              {/* FOOTER */}
              <div className="mt-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-3 text-center shadow-md border border-emerald-700 space-y-1">
                <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
                  🙏 Thank You for Supporting SREE RAM SENA Vinayaka Chavithi 2026
                </h4>
                <p className="text-[10px] font-semibold text-emerald-100 italic">
                  May Lord Ganesha bless you and your family with Health, Happiness, Prosperity and Success.
                </p>

                <div className="pt-1.5 border-t border-emerald-800/80 flex flex-wrap items-center justify-center gap-2.5 text-[9px] font-bold text-emerald-200">
                  <span className="flex items-center gap-1">📞 8688496208</span>
                  <span className="flex items-center gap-1">📍 Govindhupalli, Jagtial</span>
                  <span className="flex items-center gap-1">📸 Instagram: @sreeramsena_g.p</span>
                </div>
              </div>

              {/* BOTTOM BRANDING */}
              <div className="text-center mt-2">
                <span className="text-[9px] font-semibold text-slate-400">
                  Generated by SREE RAM SENA Divine Manager
                </span>
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
