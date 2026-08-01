import React from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  PlusCircle, 
  Mic, 
  FileText, 
  ShieldCheck,
  ArrowUpRight,
  UserCheck,
  Award,
  Clock,
  Camera,
  MapPin,
  Lock,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const DashboardView = ({ onOpenNewDonation, onOpenNewExpense, onOpenVoice, onViewReceipt, onOpenOcr, onOpenLogin, onOpenWizard }) => {
  const { t, donations, expenses, committeeInfo, role, currentUser } = useApp();

  const totalDonationsAmount = donations.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const netBalanceAmount = totalDonationsAmount - totalExpensesAmount;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCollection = donations
    .filter(d => d.date === todayStr)
    .reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);

  const todaysExpenses = expenses
    .filter(e => e.date === todayStr)
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const trendData = [
    { day: 'Mon', collection: 0, expense: 0 },
    { day: 'Tue', collection: 0, expense: 0 },
    { day: 'Wed', collection: 0, expense: 0 },
    { day: 'Thu', collection: 0, expense: 0 },
    { day: 'Fri', collection: 0, expense: 0 },
    { day: 'Sat', collection: 0, expense: 0 },
    { day: 'Sun', collection: todaysCollection, expense: todaysExpenses },
  ];

  const locationUrl = committeeInfo.locationMapsUrl || "https://www.google.com/maps/place/18%C2%B047'04.8%22N+78%C2%B055'09.7%22E/@18.784665,78.9167941,17z";

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Personalized Greeting */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="text-base">✨</span>
              <span>SREE RAM SENA Divine Manager</span>
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                {role === 'Super Admin' ? '👑 Super Admin' : role === 'Collector' ? '🤝 Collector' : '👁️ Visitor'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              Welcome back, {currentUser?.name || 'Gurram Karthikeya'}!
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl flex items-center gap-2 font-medium">
              <span>Last login: Today, 8:15 AM • Mobile / Chrome on Linux</span>
              {role === 'Super Admin' && onOpenWizard && (
                <button
                  onClick={onOpenWizard}
                  className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border border-white/30 transition shadow-xs"
                >
                  ⚙️ Setup Wizard
                </button>
              )}
            </p>
          </div>

          {/* Vinayaka Chaturthi Countdown Card */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-md">
              🐘
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-200 block">
                Vinayaka Chaturthi Countdown
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-white">{committeeInfo.daysRemaining || 44}</span>
                <span className="text-xs font-bold text-emerald-100">{t.daysLeft}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC AI EXECUTIVE TEXT SUMMARY CARD WITH FUTURISTIC BRAIN EMOJI */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 p-6 rounded-3xl border border-emerald-200 shadow-soft-card space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            🧠
          </div>
          <div>
            <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-1.5">
              <span>Futuristic AI Executive Summary</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">🤖 Smart AI</span>
            </h3>
            <p className="text-xs text-emerald-700 font-medium">Automated financial intelligence narrative</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs text-xs font-semibold text-slate-800 leading-relaxed">
          <p className="text-sm font-extrabold text-slate-900 mb-1">
            "Today's collection is ₹{todaysCollection.toLocaleString('en-IN')}. Expenses are ₹{todaysExpenses.toLocaleString('en-IN')}. Net balance is ₹{netBalanceAmount.toLocaleString('en-IN')}. Festival countdown: {committeeInfo.daysRemaining || 44} days remaining."
          </p>
          <span className="text-[11px] text-emerald-700 font-bold block mt-1">
            ✓ Ready for fresh Vinayaka Chaturthi Pandal & Annadhanam Seva prep.
          </span>
        </div>
      </div>

      {/* 4 KEY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card-green p-5 rounded-2xl shadow-soft-card border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {t.todaysCollection}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹{todaysCollection.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Fresh Festival Start
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-soft-card border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Collection
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹{totalDonationsAmount.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] font-bold text-slate-500 mt-1 block">
              {donations.length} Verified Receipts
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-soft-card border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {t.totalExpenses}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹{totalExpensesAmount.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] font-bold text-amber-600 mt-1 block">
              {expenses.length} Vouchers Approved
            </span>
          </div>
        </div>

        <div className="glass-card-green p-5 rounded-2xl shadow-soft-card border border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
              {t.netBalance}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-950">
              ₹{netBalanceAmount.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 mt-1 block">
              Vinayaka Chaturthi Fund
            </span>
          </div>
        </div>

      </div>

      {/* STRICT ROLE-BASED QUICK ACTIONS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            {t.quickActions}
          </span>
          {role === 'Viewer' && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Viewer Mode (Read-Only)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenNewDonation}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newDonation}</span>
          </button>

            <button
              onClick={onOpenOcr}
              className="flex items-center justify-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white p-3 rounded-xl font-bold text-xs shadow-md transition"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>AI Slip OCR</span>
            </button>

            <button
              onClick={onOpenVoice}
              className="flex items-center justify-center space-x-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 p-3 rounded-xl font-bold text-xs border border-emerald-300 transition"
            >
              <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span>Voice Entry</span>
            </button>

            <button
              onClick={onOpenNewExpense}
              className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-bold text-xs shadow-md transition"
            >
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>{t.addExpense}</span>
            </button>
          </div>
      </div>

      {/* CHARTS GRID & OUR LOCATION MAPS REAL SCANNABLE QR CODE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Collection & Expense Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Donation & Expense Trends</h3>
              <p className="text-xs text-slate-500 font-medium">Daily collection in Rupees (₹)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Donations
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="collection" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorCollection)" />
                <Area type="monotone" dataKey="expense" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GOOGLE MAPS LOCATION REAL SCANNABLE QR CODE CARD */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-700 shadow-xl flex flex-col justify-between items-center text-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
              OUR PANDAL LOCATION
            </span>
            <h3 className="font-extrabold text-base text-white">SCAN TO OPEN GOOGLE MAPS</h3>
            <p className="text-xs text-emerald-200 mt-0.5">18°47'04.8"N 78°55'09.7"E • Govindhupalli</p>
          </div>

          <a 
            href={locationUrl} 
            target="_blank" 
            rel="noreferrer"
            className="my-4 p-3 bg-white rounded-2xl border border-amber-400/50 relative shadow-inner hover:scale-105 transition flex items-center justify-center"
            title="Click to Open Google Maps Location"
          >
            <QRCodeSVG 
              value={locationUrl}
              size={144}
              bgColor="#ffffff"
              fgColor="#022c22"
              level="Q"
              includeMargin={false}
            />
          </a>

          <div className="space-y-1 text-center">
            <a 
              href={locationUrl}
              target="_blank"
              rel="noreferrer" 
              className="text-[10px] font-extrabold text-amber-300 hover:underline flex items-center justify-center gap-1 uppercase tracking-wider"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
              📞 8688496208 • {committeeInfo.instagram || '@sreeramsena_g.p'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
