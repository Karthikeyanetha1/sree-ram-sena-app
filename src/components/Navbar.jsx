import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductionHealthBadge } from './ProductionHealthBadge';
import { 
  Mic, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Search, 
  Menu, 
  X,
  Sparkles,
  Bot,
  Users,
  Wifi,
  WifiOff,
  UserCheck,
  Lock,
  MessageSquare,
  FileText
} from 'lucide-react';

export const Navbar = ({ 
  onOpenVoice, 
  onToggleMobileSidebar, 
  searchVal, 
  setSearchVal, 
  onOpenAdminUsers, 
  onOpenAiChat,
  onOpenLogin,
  onOpenWhatsApp,
  onOpenAuditLog
}) => {
  const { lang, setLang, t, role, notifications, committeeInfo, isOnline } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Mobile menu toggle + Branding + Health Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center shadow-sm font-extrabold text-sm border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-extrabold text-xs sm:text-base text-slate-900 tracking-tight leading-none truncate max-w-[120px] sm:max-w-none">
                    {committeeInfo.name}
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-200">
                    2026
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 mt-0.5 hidden xs:block">
                  {t.appSubName}
                </p>
              </div>
            </div>

            {/* Live Production Health Status Badge */}
            <ProductionHealthBadge />
          </div>

          {/* Middle: Search bar (Desktop only) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-800 transition outline-none shadow-inner"
              />
            </div>
          </div>

          {/* Right: Actions aligned for mobile and desktop */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
            
            {/* Audit Log Button (Super Admin) */}
            {role === 'Super Admin' && (
              <button
                onClick={onOpenAuditLog}
                className="hidden lg:flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0"
                title="Security & System Audit Log"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Audit Log</span>
              </button>
            )}

            {/* WhatsApp Automation Control Button (Desktop) */}
            <button
              onClick={onOpenWhatsApp}
              className="hidden md:flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border border-emerald-200 transition flex-shrink-0"
              title="WhatsApp Automation Control"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Sync Badge */}
            <div className={`hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex-shrink-0 ${
              isOnline ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
              <span>{isOnline ? 'Synced' : 'Offline Queue'}</span>
            </div>

            {/* AI Assistant Chat Trigger (Desktop) */}
            <button
              onClick={onOpenAiChat}
              className="hidden md:flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 transition flex-shrink-0"
              title="AI Committee Assistant"
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>AI Helper</span>
            </button>

            {/* AI Voice Assistant Trigger */}
            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition flex-shrink-0"
              title="Activate AI Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden sm:inline">AI Voice</span>
            </button>

            {/* Admin Controls Trigger */}
            {role === 'Super Admin' && (
              <button
                onClick={onOpenAdminUsers}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition flex-shrink-0"
                title="Super Admin Control Panel"
              >
                <Users className="w-4 h-4 text-emerald-400" />
              </button>
            )}

            {/* Auth Session Button */}
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition flex-shrink-0"
              title="Click to Log In or Switch Account"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold">{role}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[11px] font-bold">{lang === 'en' ? 'TE' : 'EN'}</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Notifications</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {notifications.length} New
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-extrabold text-emerald-800 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
                            {n.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="font-medium text-slate-800 leading-snug">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
