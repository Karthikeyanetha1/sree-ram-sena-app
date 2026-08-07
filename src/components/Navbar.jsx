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
  Bot,
  Users,
  Wifi,
  WifiOff,
  UserCheck,
  MessageSquare,
  FileText,
  LogOut,
  User,
  ChevronDown,
  Lock,
  Key
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
  const { lang, setLang, t, role, notifications, committeeInfo, isOnline, isAuthenticated, currentUser, signOut, registeredUsers = [] } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleEmoji = role === 'Super Admin' ? '👑' : role === 'Collector' ? '🤝' : '👁️';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Mobile menu toggle + Branding + Health Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md font-extrabold text-sm border border-indigo-400/30">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-black text-xs sm:text-base text-slate-900 tracking-tight leading-none truncate max-w-[120px] sm:max-w-none">
                    {committeeInfo?.name || "SREE RAM SENA"}
                  </h1>
                  <span className="bg-indigo-100 text-indigo-900 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full border border-indigo-200">
                    2026
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-indigo-600 mt-0.5 hidden xs:block">
                  {t?.appSubName || "Divine Manager 2026"}
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
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-800 transition outline-none shadow-xs"
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
                <FileText className="w-3.5 h-3.5 text-indigo-700" />
                <span>Audit Log</span>
              </button>
            )}

            {/* WhatsApp Automation Control Button */}
            <button
              onClick={onOpenWhatsApp}
              className="hidden md:flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border border-indigo-200 transition flex-shrink-0"
              title="WhatsApp Automation Control"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>WhatsApp</span>
            </button>

            {/* Sync Badge */}
            <div className={`hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex-shrink-0 ${
              isOnline ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
              <span>{isOnline ? 'Synced' : 'Offline Queue'}</span>
            </div>

            {/* AI Assistant Chat Trigger */}
            <button
              onClick={onOpenAiChat}
              className="hidden md:flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-200 transition flex-shrink-0"
              title="AI Committee Assistant"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>AI Helper</span>
            </button>

            {/* AI Voice Assistant Trigger */}
            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition flex-shrink-0"
              title="Activate AI Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Voice</span>
            </button>

            {/* Admin Controls Trigger */}
            {role === 'Super Admin' && (
              <button
                onClick={onOpenAdminUsers}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition flex-shrink-0"
                title="Super Admin Control Panel"
              >
                <Users className="w-4 h-4 text-indigo-400" />
              </button>
            )}

            {/* AUTHENTICATED USER PROFILE MENU WITH LOGOUT FOR ALL ROLES */}
            {isAuthenticated ? (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition"
                  title="Click to view Profile & Sign Out"
                >
                  <span className="text-xs">{roleEmoji}</span>
                  <span className="text-[11px] font-bold max-w-[100px] truncate">{currentUser?.name || role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{roleEmoji}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {currentUser?.name || 'Authenticated User'}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono truncate">
                            {currentUser?.email || 'authenticated@sreeramsena.org'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="bg-indigo-100 text-indigo-900 text-[9px] font-black px-2 py-0.5 rounded-full">
                          {role}
                        </span>
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Signed In
                        </span>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setLang(lang === 'en' ? 'te' : 'en');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition"
                      >
                        <span className="flex items-center space-x-2">
                          <Globe className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Language ({lang === 'en' ? 'English' : 'తెలుగు'})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{lang === 'en' ? 'TE' : 'EN'}</span>
                      </button>

                      {role === 'Super Admin' && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenAdminUsers();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 transition"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Admin User Roster</span>
                        </button>
                      )}

                      {/* SIGN OUT / LOGOUT BUTTON (AVAILABLE FOR ALL ROLES: SUPER ADMIN, COLLECTOR, VIEWER) */}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          signOut();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 flex items-center space-x-2 transition mt-1 border-t border-slate-100 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>🔒 Sign Out ({role})</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* Public Visitor (Unauthenticated) Log In Trigger */
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm hover:from-indigo-700 hover:to-blue-700 transition flex-shrink-0"
                title="Click to Log In"
              >
                <Key className="w-3.5 h-3.5 text-amber-300" />
                <span>Log In</span>
              </button>
            )}

            {/* Language Switcher Button (Compact) */}
            <button
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-700" />
              <span className="text-[11px] font-bold">{lang === 'en' ? 'TE' : 'EN'}</span>
            </button>

            {/* Notifications & Pending Approvals Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {(registeredUsers || []).filter(u => u.status === 'Pending Approval').length > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce ring-2 ring-white">
                    {(registeredUsers || []).filter(u => u.status === 'Pending Approval').length}
                  </span>
                ) : notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">System Notification Center</h4>
                    {(registeredUsers || []).filter(u => u.status === 'Pending Approval').length > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                        ⏳ {(registeredUsers || []).filter(u => u.status === 'Pending Approval').length} Pending Approvals
                      </span>
                    )}
                  </div>

                  {/* PENDING SIGN-UP APPROVAL REQUESTS SECTION */}
                  {role === 'Super Admin' && (registeredUsers || []).filter(u => u.status === 'Pending Approval').length > 0 && (
                    <div className="p-3 bg-amber-50/80 border-b border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                          <span>🔔 New Sign-Up Approval Requests</span>
                        </span>
                        <button 
                          onClick={() => { setShowNotifications(false); onOpenAdminUsers(); }}
                          className="text-[9px] font-extrabold text-amber-800 underline cursor-pointer"
                        >
                          View Roster Modal
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {(registeredUsers || []).filter(u => u.status === 'Pending Approval').map(u => (
                          <div key={u.id} className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-extrabold text-slate-900">{u.name} <span className="text-[10px] text-amber-700 font-bold">({u.role})</span></div>
                              <div className="text-[10px] text-slate-500">{u.email || u.mobile}</div>
                            </div>
                            <button
                              onClick={() => {
                                approveUser(u.id);
                                setShowNotifications(false);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] shadow-xs cursor-pointer"
                            >
                              Approve ✓
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs font-semibold">
                    <div className="p-3 bg-emerald-50/50 flex items-center space-x-2">
                      <span className="text-emerald-700 font-extrabold text-sm">✓</span>
                      <div>
                        <div className="font-extrabold text-emerald-950">System Online & Hardened</div>
                        <span className="text-[10px] text-emerald-800">SREE RAM SENA 2026 Active</span>
                      </div>
                    </div>

                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-extrabold text-indigo-900 uppercase bg-indigo-100 px-1.5 py-0.5 rounded">
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
