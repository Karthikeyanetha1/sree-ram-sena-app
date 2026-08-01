import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User, Sparkles, Layers, Code2 } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { setRole, setCurrentUser, committeeInfo } = useApp();
  
  const [userNameInput, setUserNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('Super Admin'); // 'Super Admin' | 'Collector' | 'Viewer'

  const handleEnterDashboard = (e) => {
    e.preventDefault();

    let finalRole = selectedRole;
    let finalName = userNameInput.trim() || (selectedRole === 'Super Admin' ? 'Gurram Karthikeya' : selectedRole === 'Collector' ? 'Ramesh Kumar' : 'Public Visitor');

    setRole(finalRole);
    setCurrentUser({
      name: finalName,
      email: `${finalName.toLowerCase().replace(/\s+/g, '')}@sreeramsena.org`,
      role: finalRole
    });

    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-900 font-sans relative overflow-hidden">
      
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div />

      {/* Main Centered Minimalist Login Card (Matching User Screenshot 100%) */}
      <main className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 space-y-6 z-10 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* App Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Layers className="w-8 h-8 text-white" />
        </div>

        {/* Header Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Divine Manager
          </h1>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            {committeeInfo.name} • {committeeInfo.mandal} • EST. {committeeInfo.since || '2016'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEnterDashboard} className="space-y-4 pt-2">
          
          {/* Your Name Input Field */}
          <div>
            <input
              type="text"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Role Choice Pills */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <button
              type="button"
              onClick={() => setSelectedRole('Super Admin')}
              className={`py-3 px-2 rounded-2xl text-xs font-black transition ${
                selectedRole === 'Super Admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Super Admin
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('Collector')}
              className={`py-3 px-2 rounded-2xl text-xs font-black transition ${
                selectedRole === 'Collector'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Collector
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('Viewer')}
              className={`py-3 px-2 rounded-2xl text-xs font-black transition ${
                selectedRole === 'Viewer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Viewer
            </button>
          </div>

          {/* Big Enter Dashboard Gradient Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-blue-500/25 transition active:scale-98"
          >
            Enter Dashboard
          </button>

        </form>

      </main>

      {/* Official Brand Footer: codewithk developer */}
      <footer className="py-4 text-center z-10 text-xs font-extrabold text-slate-400 space-y-1">
        <div className="flex items-center justify-center space-x-1.5 text-slate-500">
          <Code2 className="w-4 h-4 text-indigo-500" />
          <span>Powered by <strong className="text-slate-800 font-black">codewithk developer</strong></span>
        </div>
        <p className="text-[10px] text-slate-400">© 2026 {committeeInfo.name} • Vercel Enterprise Active</p>
      </footer>

    </div>
  );
};
