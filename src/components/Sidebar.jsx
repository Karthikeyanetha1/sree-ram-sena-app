import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Receipt, 
  FileCheck2, 
  BarChart3, 
  PackageCheck, 
  Settings,
  ShieldCheck,
  MapPin,
  X,
  Trophy
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { t, committeeInfo, role } = useApp();

  const navItems = [
    { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: LayoutDashboard },
    { id: 'donations', label: t.donations || 'Donations', icon: HeartHandshake, badge: 'Live' },
    { id: 'laddu-auction', label: 'Laddu Auction', emojiIcon: '📜', badge: '🟡 Auction' },
    { id: 'leaderboard', label: 'Seva Leaderboard', emojiIcon: '🏆', badge: 'Top 5' },
    { id: 'expenses', label: t.expenses || 'Expenses', icon: Receipt },
    { id: 'receipts', label: t.receipts || 'Receipts & Verification', icon: FileCheck2 },
    { id: 'reports', label: t.reports || 'Reports & Exports', icon: BarChart3 },
    { id: 'community', label: t.community || 'Inventory & Events', icon: PackageCheck },
    { id: 'ai-insights', label: t.aiInsights || 'AI Insights', emojiIcon: '🤖', badge: '🔮 Futuristic' },
    { id: 'settings', label: t.settings || 'Settings & Backup', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 shadow-xs">
      
      {/* Header Mobile Only */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between md:hidden">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span className="font-extrabold text-sm text-slate-900">{committeeInfo.name}</span>
        </div>
        <button 
          onClick={() => setMobileOpen(false)}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            PLATFORM NAVIGATION
          </span>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition duration-150 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.emojiIcon ? (
                  <span className="text-sm flex-shrink-0">{item.emojiIcon}</span>
                ) : (
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                )}
                <span className="font-extrabold text-xs tracking-tight text-slate-900">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  item.badge.includes('Futuristic') || item.badge === 'AI' 
                    ? 'bg-emerald-700 text-white' 
                    : item.badge.includes('Auction')
                    ? 'bg-amber-400 text-amber-950 font-black'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Committee Profile Badge */}
      <div className="p-3 m-3 bg-slate-50 rounded-2xl border border-slate-200/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {committeeInfo.name}
            </h4>
            <div className="flex items-center text-[10px] text-slate-500 space-x-1">
              <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Govindhupalli, Jagtial</span>
            </div>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Role: <strong className="text-emerald-700">{role}</strong></span>
          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">PWA Active</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 z-20">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
