import React from 'react';
import { useApp } from '../context/AppContext';
import { generateWhatsAppLink } from '../utils/receiptGenerator';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  ShieldCheck, 
  User,
  Phone,
  MapPin,
  IndianRupee,
  CreditCard,
  FileText,
  Wallet,
  CheckCircle2,
  Home,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

export const ReceiptModal = ({ donation, isOpen, onClose, onNavigateHome }) => {
  const { t, committeeInfo } = useApp();

  if (!isOpen || !donation) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#d97706', '#10b981', '#fbbf24']
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const receiptElem = document.getElementById('receipt-printable-area');
      if (!receiptElem) {
        window.print();
        return;
      }
      const canvas = await html2canvas(receiptElem, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SRS-Receipt-${donation.receiptNo || '2026'}.pdf`);
    } catch (err) {
      console.warn("PDF generation fallback to print:", err);
      window.print();
    }
  };

  const handleWhatsApp = async () => {
    const waLink = generateWhatsAppLink(donation, committeeInfo);

    if (navigator.share && navigator.canShare) {
      try {
        const receiptElem = document.getElementById('receipt-printable-area');
        if (receiptElem) {
          const canvas = await html2canvas(receiptElem, { scale: 2, useCORS: true });
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `SRS-Receipt-${donation.receiptNo || '2026'}.png`, { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: `SREE RAM SENA Official Receipt ${donation.receiptNo}`,
                  text: `🙏 Official Receipt for ${donation.donorName} - ₹${donation.amount}\n📄 View Online: https://sree-ram-sena-app.vercel.app/?receiptNo=${donation.receiptNo}`,
                  files: [file]
                });
                return;
              }
            }
            window.open(waLink, '_blank');
          }, 'image/png');
          return;
        }
      } catch (err) {
        console.warn("Web Share API note:", err);
      }
    }

    window.open(waLink, '_blank');
  };

  const handleBackHome = () => {
    onClose();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const amountStr = parseFloat(donation.amount).toLocaleString('en-IN');
  const paymentStatusText = donation.paymentMethod === 'Cash' ? 'CASH RECEIVED ✓' : 'SUCCESSFUL ✓';

  const upiPayload = `upi://pay?pa=${committeeInfo.upiId || 'karthikeyanetha@slc'}&pn=SREE%20RAM%20SENA&am=${donation.amount}&cu=INR`;
  const locationUrl = committeeInfo.locationMapsUrl || "https://www.google.com/maps/place/18%C2%B047'04.8%22N+78%C2%B055'09.7%22E/@18.784665,78.9167941,17z";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 overflow-hidden my-4">
        
        {/* Modal Top Navigation Bar with Back to Dashboard Button */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBackHome}
              className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition"
              title="Return to Dashboard Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 hidden sm:inline">
              Official Receipt
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div className="p-4 sm:p-6 printable-area bg-white relative">
          
          {/* RECEIPT OUTER BORDER WITH DOUBLE GOLD & EMERALD BORDER */}
          <div className="border-[6px] border-double border-emerald-800 rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 relative shadow-inner">
            
            {/* Top Mantra Banner */}
            <div className="text-center mb-3">
              <span className="inline-block bg-amber-100 text-amber-900 px-4 py-0.5 rounded-full text-xs font-extrabold tracking-widest border border-amber-300 shadow-xs">
                ॥ శ్రీ గణేశాయ నమః ॥
              </span>
            </div>

            {/* TOP SECTION: SREE RAM SENA LOGO + GANESHA ARTWORK */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-emerald-800/30 gap-2">
              
              {/* Left Temple Seal Emblem */}
              <div className="w-16 h-16 rounded-full border-2 border-emerald-800 p-1 flex flex-col items-center justify-center text-center bg-white shadow-sm flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-800" />
                <span className="text-[8px] font-extrabold text-emerald-950 mt-0.5">Est. {committeeInfo.since || '2016'}</span>
              </div>

              {/* Center Title */}
              <div className="text-center flex-1">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight uppercase leading-tight font-serif">
                  {committeeInfo.name}
                </h2>
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-700 tracking-wider uppercase mt-0.5">
                  VINAYAKA CHAVITHI 2026
                </h3>
                <span className="text-[10px] font-extrabold text-emerald-800 tracking-widest uppercase block mt-0.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block">
                  VINAYAKA CHAVITHI DONATION RECEIPT
                </span>
              </div>

              {/* Right Lord Ganesha SVG Artwork */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-100 p-1.5 flex items-center justify-center shadow-md flex-shrink-0 border border-amber-400">
                <svg className="w-12 h-12 text-amber-900 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L9.5 5H14.5L12 2Z" fill="#d97706"/>
                  <path d="M12 6C9.24 6 7 8.24 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 8.24 14.76 6 12 6ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z"/>
                  <path d="M5 12C3.9 12 3 12.9 3 14C3 15.1 3.9 16 5 16H6.18C6.06 15.36 6 14.69 6 14C6 13.31 6.06 12.64 6.18 12H5Z"/>
                  <path d="M19 12H17.82C17.94 12.64 18 13.31 18 14C18 14.69 17.94 15.36 17.82 16H19C20.1 16 21 15.1 21 14C21 12.9 20.1 12 19 12Z"/>
                </svg>
              </div>

            </div>

            {/* RECEIPT NUMBER BADGE */}
            <div className="my-4 text-center">
              <div className="inline-block bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950 text-white px-7 py-2.5 rounded-2xl shadow-lg border-2 border-amber-400/60 ring-2 ring-emerald-900/20">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 mr-2">
                  RECEIPT NO:
                </span>
                <span className="text-lg font-black font-mono tracking-wider text-white">
                  {donation.receiptNo}
                </span>
              </div>

              <div className="mt-2 text-xs font-bold text-slate-600 flex items-center justify-center space-x-1">
                <span>📅 Date & Time: </span>
                <span>{donation.date || '27 May 2026, 10:45 AM'}</span>
              </div>
            </div>

            {/* CENTER DETAILS TABLE */}
            <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200/80 shadow-xs space-y-3 text-xs font-semibold text-slate-800">
              
              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>DONOR NAME</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-extrabold text-slate-900 text-sm">
                  {donation.donorName}
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>MOBILE NUMBER</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-bold text-slate-800">
                  {donation.mobile || '98765 43210'}
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ADDRESS</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-bold text-slate-800">
                  {donation.village} ({donation.address})
                </div>
              </div>

              <div className="grid grid-cols-12 items-center py-1.5 bg-emerald-50/80 rounded-xl px-2 border border-emerald-200">
                <div className="col-span-4 text-emerald-900 font-extrabold flex items-center space-x-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-700" />
                  <span>AMOUNT</span>
                </div>
                <div className="col-span-1 text-center font-bold text-emerald-800">:</div>
                <div className="col-span-7 font-black text-2xl text-emerald-950">
                  ₹ {amountStr}/-
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>AMOUNT IN WORDS</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-bold text-slate-800 italic">
                  {donation.amountInWords}
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>PAYMENT METHOD</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-extrabold text-slate-900">
                  {donation.paymentMethod}
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PAYMENT STATUS</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-extrabold text-emerald-700">
                  {paymentStatusText}
                </div>
              </div>

              {/* COLLECTOR ENTRY BLOCK */}
              <div className="grid grid-cols-12 items-baseline py-1 border-b border-slate-100">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>COLLECTOR</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-extrabold text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block">
                  {donation.collector || donation.Collector || 'karthiknetha'}
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline py-1">
                <div className="col-span-4 text-slate-500 font-bold flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>COLLECTOR NAME</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">:</div>
                <div className="col-span-7 font-bold text-slate-800">
                  {donation.collector || 'Ravi Kumar'}
                </div>
              </div>

            </div>

            {/* CLICKABLE & SCANNABLE DUAL QR CODE LAYOUT FOR PDF & WEB */}
            <div className="mt-4 pt-4 border-t-2 border-emerald-800/30 grid grid-cols-2 gap-4 items-center text-center">
              
              {/* 1. CLICKABLE & SCANNABLE UPI PAYMENT QR CODE */}
              <a 
                href={upiPayload} 
                className="bg-white p-2.5 rounded-2xl border border-emerald-300 shadow-xs flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer"
                title="Scan with Camera OR Click to Pay via PhonePe/GPay"
              >
                <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                  <QRCodeSVG 
                    value={upiPayload}
                    size={84}
                    bgColor="#ffffff"
                    fgColor="#022c22"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-950 block mt-1 uppercase tracking-wide flex items-center gap-0.5">
                  Scan or Tap to Pay <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                </span>
                <span className="text-[8px] font-mono font-bold text-emerald-800 block truncate max-w-[140px]">
                  {committeeInfo.upiId || 'karthikeyanetha@slc'}
                </span>
              </a>

              {/* 2. CLICKABLE & SCANNABLE GOOGLE MAPS LOCATION QR CODE */}
              <a 
                href={locationUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white p-2.5 rounded-2xl border border-emerald-300 shadow-xs flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer"
                title="Scan with Camera OR Click to Open Google Maps"
              >
                <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                  <QRCodeSVG 
                    value={locationUrl}
                    size={84}
                    bgColor="#ffffff"
                    fgColor="#065f46"
                    level="Q"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-950 block mt-1 uppercase tracking-wide flex items-center gap-0.5">
                  Scan or Tap for Maps <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                </span>
                <span className="text-[8px] font-bold text-emerald-800 block">
                  Pandal Location
                </span>
              </a>

            </div>

            {/* FOOTER */}
            <div className="mt-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-3.5 text-center shadow-md border border-emerald-700 space-y-1">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                🙏 Thank You for Supporting SREE RAM SENA Vinayaka Chavithi 2026
              </h4>
              <p className="text-[11px] font-semibold text-emerald-100 italic">
                May Lord Ganesha bless you and your family with Health, Happiness, Prosperity and Success.
              </p>

              <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold text-emerald-200">
                <span className="flex items-center gap-1">📞 {committeeInfo.phone || '8688496208'}</span>
                <span className="flex items-center gap-1">📍 Govindhupalli, Jagtial</span>
                <span className="flex items-center gap-1">📸 Instagram: {committeeInfo.instagram || '@sreeramsena_g.p'}</span>
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

        {/* BOTTOM ACTION BAR WITH HOME RETURN BUTTON */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          
          <button
            onClick={handleBackHome}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Share</span>
            </button>

            <button
              onClick={() => {
                triggerConfetti();
                handlePrint();
              }}
              className="flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>High Quality Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 bg-emerald-950 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>PDF Download</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
