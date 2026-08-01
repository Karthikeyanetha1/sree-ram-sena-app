import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Award, Sparkles, Send, Phone, User, IndianRupee, History, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LadduAuctionView = ({ onViewReceipt }) => {
  const { ladduBids, addLadduBid, committeeInfo } = useApp();

  const [bidderName, setBidderName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [notice, setNotice] = useState('');

  const highestBid = ladduBids.length > 0 ? ladduBids[0] : { bidderName: 'None', amount: 0 };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#d97706', '#059669', '#fbbf24']
    });
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    if (!bidderName || !amount) {
      alert('Please enter Bidder Name and Amount');
      return;
    }

    const currentHighest = highestBid.amount || 0;
    const newAmount = parseFloat(amount);

    if (newAmount <= currentHighest) {
      alert(`Bid amount must be higher than the current leading bid of ₹${currentHighest.toLocaleString('en-IN')}`);
      return;
    }

    addLadduBid({
      bidderName,
      mobile: mobile || '9876543210',
      amount: newAmount
    });

    triggerConfetti();
    setNotice(`🎉 New Highest Bid Placed: ₹${newAmount.toLocaleString('en-IN')} by ${bidderName}!`);

    setBidderName('');
    setMobile('');
    setAmount('');
  };

  const handleWhatsAppWinner = (bid) => {
    const text = `🙏 *శ్రీ గణేష్ ప్రసాదం లడ్డు వేలం జయం*
*SREE RAM SENA Vinayaka Chavithi 2026*

మహాలడ్డు ప్రసాదం లడ్డు వేలంలో అత్యధిక బిడ్ దాఖలు చేసిన శ్రీ *${bid.bidderName}* గారికి హృదయపూర్వక అభినందనలు! 🟡

*విన్నర్ పేరు:* ${bid.bidderName}
*బిడ్ మొత్తం:* ₹ ${bid.amount.toLocaleString('en-IN')}/-
*మొబైల్:* ${bid.mobile}
*స్థలం:* Govindhupalli

గణపతి బప్పా మీ కుటుంబానికి ఆయురారోగ్యాలు, ఐశ్వర్యం అందించాలని కోరుకుంటున్నాము! 🙏`;

    const encoded = encodeURIComponent(text);
    const phone = bid.mobile ? `91${bid.mobile.replace(/\D/g, '')}` : '';
    window.open(phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* DIVINE GOLDEN BANNER WITH MOOSHIKA RAT & MARIGOLD FLOWERS */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/60 relative overflow-hidden">
        
        {/* Flower Garland Accents */}
        <div className="absolute top-2 left-0 right-0 flex justify-between px-4 text-xs opacity-60 pointer-events-none">
          <span>🌺 🌼 🌺 🌼 🌺 🌼 🌺</span>
          <span>🌺 🌼 🌺 🌼 🌺 🌼 🌺</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
          
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 px-3.5 py-1 rounded-full border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
              <span>🐁 Mooshika Vahana Prasadam</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-amber-300 tracking-tight font-serif">
              📜 Vinayaka Laddu Prasadam Auction
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl font-medium">
              Live digital auction ledger for the main Vinayaka Maha Laddu Prasadam on Nimajjanam day.
            </p>
          </div>

          {/* LEADING BIDDER HIGHLIGHT BADGE */}
          <div className="bg-white/10 backdrop-blur-md border-2 border-amber-400 p-5 rounded-3xl text-center min-w-[260px] shadow-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
              👑 LEADING BIDDER
            </div>
            <div className="text-3xl my-1 font-black text-amber-300">
              ₹ {highestBid.amount ? highestBid.amount.toLocaleString('en-IN') : '0'} /-
            </div>
            <h3 className="font-black text-white text-base truncate">{highestBid.bidderName}</h3>
            <span className="text-[10px] text-amber-200 font-bold block mt-0.5">
              📞 {highestBid.mobile || 'Govindhupalli'}
            </span>
          </div>

        </div>
      </div>

      {/* BID ENTRY FORM & BIDDING HISTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 1 COL: PLACE NEW BID FORM */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-soft-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-amber-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-black text-lg">
              🟡
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Record New Bid</h3>
              <p className="text-xs text-slate-500 font-medium">Enter bidder details & amount</p>
            </div>
          </div>

          {notice && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 animate-in fade-in">
              {notice}
            </div>
          )}

          <form onSubmit={handlePlaceBid} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Bidder Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  placeholder="e.g. Roi Govindhupalli"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Mobile Number (10 Digits)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9887665541"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Bid Amount (₹) *</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Higher than ₹${(highestBid.amount || 0).toLocaleString('en-IN')}`}
                  className="w-full pl-9 pr-3 py-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-black text-amber-950 text-base outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 rounded-xl font-extrabold text-xs shadow-md shadow-amber-600/30 transition"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Submit Highest Bid</span>
            </button>
          </form>
        </div>

        {/* RIGHT 2 COLS: LIVE BIDDING LEDGER TABLE */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-soft-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-900">Live Bidding History Ledger</h3>
            </div>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {ladduBids.length} Total Bids
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Bidder Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Bid Amount</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {ladduBids.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-black text-slate-900">{b.bidderName}</td>
                    <td className="py-3 px-4 text-slate-600">{b.mobile}</td>
                    <td className="py-3 px-4 font-black text-amber-950 text-sm">₹{b.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-500">{b.time}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        b.status.includes('Leading') ? 'bg-amber-400 text-amber-950 font-black shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleWhatsAppWinner(b)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold shadow-xs transition flex items-center justify-end space-x-1 ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp Winner</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
