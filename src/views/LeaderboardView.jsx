import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Award, Star, UserCheck, ShieldCheck, HeartHandshake, Zap, ArrowUpRight } from 'lucide-react';

export const LeaderboardView = () => {
  const { donations } = useApp();

  // Group collections by collector name
  const collectorStats = donations.reduce((acc, d) => {
    const name = d.collector || 'Karthik Sharma';
    if (!acc[name]) {
      acc[name] = { name, total: 0, count: 0 };
    }
    acc[name].total += parseFloat(d.amount) || 0;
    acc[name].count += 1;
    return acc;
  }, {});

  // Default demo stats if fresh start
  if (!collectorStats['Karthik Sharma']) {
    collectorStats['Karthik Sharma'] = { name: 'Karthik Sharma (Super Admin)', total: 0, count: 0 };
  }
  if (!collectorStats['Ravi Kumar']) {
    collectorStats['Ravi Kumar'] = { name: 'Ravi Kumar (Collector)', total: 0, count: 0 };
  }

  const sortedCollectors = Object.values(collectorStats).sort((a, b) => b.total - a.total);

  const getBadge = (index) => {
    if (index === 0) return { title: '🥇 Gold Seva Star', bg: 'bg-amber-400 text-amber-950 border-amber-500' };
    if (index === 1) return { title: '🥈 Silver Seva Star', bg: 'bg-slate-200 text-slate-800 border-slate-300' };
    return { title: '🥉 Seva Star', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* BANNER WITH MOOSHIKA RAT & FLOWER GARLANDS */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-700 relative overflow-hidden">
        <div className="absolute top-2 left-0 right-0 flex justify-between px-4 text-xs opacity-60 pointer-events-none">
          <span>🌺 🌼 🌺 🌼 🌺 🌼 🌺</span>
          <span>🌺 🌼 🌺 🌼 🌺 🌼 🌺</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
          <div>
            <div className="inline-flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span>🐁 Mooshika Devotional Seva</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
              🏆 Collector Daily Seva Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Celebrating our festival committee collection volunteers & daily seva achievements.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                Top Seva Champion
              </span>
              <span className="text-lg font-black text-amber-300">
                {sortedCollectors[0]?.name || 'Karthik Sharma'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LEADERBOARD CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCollectors.map((c, idx) => {
          const badge = getBadge(idx);
          const targetLimit = 50000;
          const progress = Math.min(100, (c.total / targetLimit) * 100);

          return (
            <div key={c.name} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl shadow-xs">
                    {idx === 0 ? '👑' : '🤝'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{c.name}</h3>
                    <span className="text-xs text-slate-500 font-bold">{c.count} Verified Receipts</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black border shadow-xs ${badge.bg}`}>
                  {badge.title}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Daily Seva Target Progress</span>
                  <span className="text-emerald-800 font-black">₹{c.total.toLocaleString('en-IN')} / ₹50,000</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
