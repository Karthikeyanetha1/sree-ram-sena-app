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

  const fetchReceipt = async (targetNo) => {
    if (!targetNo) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const cleanTarget = String(targetNo).trim().toUpperCase();
    const targetDigits = cleanTarget.replace(/\D/g, '');

    const formatReceiptDoc = (docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        receiptNo: d.receiptNo || d['Receipt No'] || cleanTarget,
        donorName: d.donorName || d['Donor Name'] || d.name || 'Devotee',
        amount: parseFloat(d.amount || d.Amount) || 0,
        amountInWords: d.amountInWords || d['Amount In Words'] || `${parseFloat(d.amount || d.Amount) || 0} Rupees Only`,
        date: d.date || d.Date || '',
        paymentMethod: d.paymentMethod || d['Payment Method'] || 'UPI',
        village: d.village || d.Village || 'Govindhupalli',
        address: d.address || d.Address || '',
        mobile: d.mobile || d.Mobile || '',
        notes: d.notes || d.Notes || '',
        status: d.status || d.Status || 'Verified',
        collectorName: d.collectorName || d.collector || d['Collector'] || 'SREE RAM SENA'
      };
    };

    // 1. API Route check
    try {
      const res = await fetch(`/api/get-receipt?receiptNo=${encodeURIComponent(cleanTarget)}`);
      const data = await res.json();
      if (data.success && data.donation) {
        setReceipt(data.donation);
        setNotFound(false);
        setLoading(false);
        return;
      }
    } catch (e) {}

    // 2. Query Firestore collections: festivals/2026/donations, festivals/2027/donations, festivals/2025/donations, and root /donations
    const collectionsToSearch = [
      collection(db, "festivals", "2026", "donations"),
      collection(db, "festivals", "2027", "donations"),
      collection(db, "festivals", "2025", "donations"),
      collection(db, "donations")
    ];

    for (const colRef of collectionsToSearch) {
      try {
        const snap = await getDocs(colRef);
        for (const docSnap of snap.docs) {
          const d = docSnap.data();
          const rNo = String(d.receiptNo || d['Receipt No'] || docSnap.id).trim().toUpperCase();
          const rDigits = rNo.replace(/\D/g, '');

          if (rNo === cleanTarget || (targetDigits.length >= 3 && rDigits === targetDigits)) {
            console.log(`[PUBLIC RECEIPT] Found matching receipt in Firestore:`, docSnap.id);
            setReceipt(formatReceiptDoc(docSnap));
            setNotFound(false);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Firestore collection query note:", err.message);
      }
    }

    // 3. Fallback: Search LocalStorage Caches
    const cacheKeys = ['srs_donations_2026', 'srs_donations_2027', 'srs_donations_2025', 'srs_donations'];
    for (const k of cacheKeys) {
      try {
        const cached = JSON.parse(localStorage.getItem(k) || '[]');
        const found = cached.find(item => {
          const rNo = String(item.receiptNo || item['Receipt No'] || item.id).trim().toUpperCase();
          const rDigits = rNo.replace(/\D/g, '');
          return rNo === cleanTarget || (targetDigits.length >= 3 && rDigits === targetDigits);
        });

        if (found) {
          setReceipt({
            id: found.id || 'cached-receipt',
            receiptNo: found.receiptNo || cleanTarget,
            donorName: found.donorName || found['Donor Name'] || 'Devotee',
            amount: parseFloat(found.amount || found.Amount) || 0,
            amountInWords: found.amountInWords || `${found.amount || 0} Rupees Only`,
            date: found.date || '',
            paymentMethod: found.paymentMethod || 'UPI',
            village: found.village || 'Govindhupalli',
            address: found.address || '',
            mobile: found.mobile || '',
            notes: found.notes || '',
            status: 'Verified',
            collectorName: found.collector || 'SREE RAM SENA'
          });
          setNotFound(false);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

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

  const addInteractivePdfLinks = (pdf, receiptElem, xPos, yPos, imgWidth, imgHeight) => {
    if (!receiptElem || !pdf) return;
    const containerRect = receiptElem.getBoundingClientRect();
    if (!containerRect.width || !containerRect.height) return;

    const scaleX = imgWidth / containerRect.width;
    const scaleY = imgHeight / containerRect.height;

    const linkElements = receiptElem.querySelectorAll('[data-pdf-link]');
    linkElements.forEach(el => {
      const url = el.getAttribute('data-pdf-link');
      if (!url) return;

      const elRect = el.getBoundingClientRect();
      const relLeft = elRect.left - containerRect.left;
      const relTop = elRect.top - containerRect.top;

      const linkX = xPos + (relLeft * scaleX);
      const linkY = yPos + (relTop * scaleY);
      const linkW = elRect.width * scaleX;
      const linkH = elRect.height * scaleY;

      try {
        pdf.link(linkX, linkY, linkW, linkH, { url });
      } catch (e) {
        console.warn("PDF link annotation note:", e);
      }
    });
  };

  const handleDownloadPdf = async () => {
    try {
      const receiptElem = document.getElementById('public-receipt-card');
      if (!receiptElem) return;

      const canvas = await html2canvas(receiptElem, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        windowWidth: 1200
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 6;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);

      let imgWidth = maxWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const xPos = (pageWidth - imgWidth) / 2;
      const yPos = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight, undefined, 'FAST');
      addInteractivePdfLinks(pdf, receiptElem, xPos, yPos, imgWidth, imgHeight);

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
              {/* SACRED LORD GANESHA WATERMARK OVERLAY */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <img 
                  src="/assets/ganesha_watermark_soft.png" 
                  alt="Lord Ganesha Watermark" 
                  className="w-72 sm:w-80 h-auto object-contain"
                />
              </div>

              {/* Top ESTD 2016 & Sacred Mantra Banner */}
              <div className="text-center mb-3 flex flex-wrap items-center justify-center gap-2 relative z-10">
                <span className="bg-emerald-900 text-amber-300 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest border border-amber-400 shadow-xs uppercase">
                  ESTD. 2016
                </span>
                <span className="inline-block bg-amber-100 text-amber-900 px-4 py-0.5 rounded-full text-xs font-extrabold tracking-widest border border-amber-300 shadow-xs">
                  ॥ శ్రీ గణేశాయ నమః ॥
                </span>
              </div>

              {/* TOP SECTION: SREE RAM SENA LOGO + LORD GANESHA IDOL LOGO */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-emerald-800/30 gap-2 relative z-10">
                
                {/* Left Official Gold Emblem Logo */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 sm:border-3 border-amber-400 p-0.5 flex items-center justify-center bg-black shadow-md flex-shrink-0 overflow-hidden">
                  <img 
                    src="/assets/sree_ram_sena_logo.jpg" 
                    alt="SREE RAM SENA YOUTH GOVINDUPALLY" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Center Title */}
                <div className="text-center flex-1 min-w-0 px-1">
                  <h2 className="text-sm sm:text-xl font-black text-emerald-950 tracking-tight uppercase leading-tight font-serif whitespace-nowrap overflow-hidden text-ellipsis">
                    SREE RAM SENA
                  </h2>
                  <h3 className="text-[11px] sm:text-xs font-extrabold text-amber-700 tracking-wider uppercase mt-0.5 whitespace-nowrap">
                    VINAYAKA CHAVITHI 2026
                  </h3>
                  <span className="text-[8px] sm:text-[10px] font-extrabold text-emerald-800 tracking-widest uppercase block mt-0.5 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
                    DONATION RECEIPT
                  </span>
                </div>

                {/* Right Lord Ganesha Idol Photo Logo */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 sm:border-3 border-amber-400 p-0.5 flex items-center justify-center bg-amber-900 shadow-md flex-shrink-0 overflow-hidden">
                  <img 
                    src="/assets/right_ganesha_header.jpg" 
                    alt="Lord Ganesha Seva Idol" 
                    className="w-full h-full object-cover rounded-full object-top"
                  />
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
                  data-pdf-link={`upi://pay?pa=karthikeyanetha@slc&pn=SREE%20RAM%20SENA&am=${receipt?.amount || 0}&cu=INR`}
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
                  data-pdf-link="https://www.google.com/maps/place/18%C2%B047'04.8%22N+78%C2%B055'09.7%22E/@18.784665,78.9167941,17z"
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
                  <a href="https://instagram.com/sreeramsena_g.p" target="_blank" rel="noreferrer" data-pdf-link="https://instagram.com/sreeramsena_g.p" className="flex items-center gap-1 hover:underline">
                    📸 Instagram: @sreeramsena_g.p
                  </a>
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
