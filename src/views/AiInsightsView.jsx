import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Award, 
  Zap, 
  PieChart, 
  BrainCircuit 
} from 'lucide-react';

export const AiInsightsView = () => {
  const { t, donations, expenses } = useApp();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-emerald-200 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              SREE RAM SENA AI Financial Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              Machine-driven budget forecasting, donor sentiment, and automated expense optimization.
            </p>
          </div>
        </div>
      </div>

      {/* AI INSIGHT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Prediction 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-slate-900">Donation Revenue Forecast</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Based on historical collection velocity from 2016-2026, total festival donations are projected to reach 
            <strong className="text-emerald-800"> ₹1,85,000</strong> within the next 10 days before Sri Rama Navami.
          </p>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900">
            AI Tip: Send automated thank-you WhatsApp messages to previous year Annadhanam sponsors to accelerate collections.
          </div>
        </div>

        {/* Prediction 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft-card space-y-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <Target className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Budget Prediction & Cap</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Estimated maximum festival expenditures (Tent House, Sound & Stage, Annadhanam, Pooja Items) are calculated at 
            <strong className="text-slate-900"> ₹72,500</strong>. Net surplus will remain strong at ~₹1.12 Lakhs.
          </p>
          <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800">
            AI Recommendation: Approve pending catering voucher VCH-0103 to lock vendor pricing.
          </div>
        </div>

      </div>

      {/* SPOTLIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Donor Spotlight */}
        <div className="glass-card-green p-6 rounded-3xl border border-emerald-300 shadow-soft-card flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
              Top Benefactor Spotlight
            </span>
            <h4 className="text-lg font-black text-slate-900">Venkateshwara Rao</h4>
            <p className="text-xs font-bold text-emerald-700">₹10,001 • Annadhanam Sponsorship</p>
          </div>
        </div>

        {/* Top Collector Spotlight */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 shadow-soft-card flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center text-2xl shadow-md">
            ⭐
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Top Collector Officer
            </span>
            <h4 className="text-lg font-black text-slate-900">Karthik Sharma</h4>
            <p className="text-xs font-bold text-slate-600">Collected ₹22,500 across 4 Receipts</p>
          </div>
        </div>

      </div>

    </div>
  );
};
