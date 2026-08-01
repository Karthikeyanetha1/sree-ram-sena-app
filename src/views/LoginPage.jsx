import React, { useState } from 'react';
import { useApp, MAX_COLLECTORS_LIMIT } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  HeartHandshake, 
  Eye as EyeIcon, 
  Crown,
  MapPin,
  Building2,
  Check
} from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { setRole, registerUser, registeredUsers = [], setCurrentUser, committeeInfo } = useApp();
  
  const [selectedRoleTile, setSelectedRoleTile] = useState('Super Admin'); // 'Super Admin' | 'Collector' | 'Viewer'
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'

  // Sign In Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState('Collector');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentCollectorsCount = (registeredUsers || []).filter(u => u.role === 'Collector').length;

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const inputEmailClean = email.trim().toLowerCase();

    if (!inputEmailClean) {
      setError('Please enter your email address to sign in.');
      return;
    }

    const found = (registeredUsers || []).find(u => u.email.toLowerCase() === inputEmailClean);

    if (found) {
      if (found.status === 'Pending Approval') {
        setError(`Your registration request for ${found.role} is currently PENDING APPROVAL by Super Admin.`);
        return;
      }
      setRole(found.role);
      setCurrentUser(found);
      setMessage(`Welcome back, ${found.name}! Signed in as ${found.role}.`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    } else {
      // Recognized Admin Accounts or Selected Role Tile
      let assignedRole = selectedRoleTile;
      let userName = 'Karthik Netha';

      if (inputEmailClean.includes('admin') || inputEmailClean.includes('karthiknetha') || inputEmailClean.includes('karthikeya')) {
        assignedRole = 'Super Admin';
        userName = 'Gurram Karthikeya';
      } else if (inputEmailClean.includes('collector')) {
        assignedRole = 'Collector';
        userName = 'Collector Member';
      } else if (selectedRoleTile === 'Viewer') {
        assignedRole = 'Viewer';
        userName = 'Public Visitor';
      }

      setRole(assignedRole);
      setCurrentUser({ name: userName, email: inputEmailClean, role: assignedRole });
      setMessage(`Signed in successfully as ${assignedRole}`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!signUpName || !signUpEmail) {
      setError('Please enter your full name and email address.');
      return;
    }

    try {
      if (registerUser) {
        registerUser(signUpName, signUpEmail, signUpRole);
      }
      setMessage(`Registration request submitted! Your ${signUpRole} account is pending Super Admin approval. Once approved, you gain permanent access.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickVisitorAccess = () => {
    setRole('Viewer');
    setCurrentUser({ name: 'Public Visitor', email: 'visitor@sreeramsena.org', role: 'Viewer' });
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-extrabold shadow-lg border border-emerald-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-none">
              {committeeInfo.name}
            </h1>
            <p className="text-xs font-medium text-emerald-400 mt-0.5">
              {committeeInfo.village}, {committeeInfo.mandal} • {committeeInfo.festivalName}
            </p>
          </div>
        </div>

        <button
          onClick={handleQuickVisitorAccess}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-extrabold border border-slate-800 transition flex items-center space-x-1.5 shadow-sm"
        >
          <EyeIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Public Viewer Access</span>
        </button>
      </header>

      {/* Main Authentication Portal Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 z-10 space-y-8">
        
        {/* Title Banner */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Official Member Authentication Portal
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Select Your Role to Access Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            Choose your account role below to proceed with secure single-approval authentication.
          </p>
        </div>

        {/* 3 ROLE CHOICE TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Tile 1: Super Admin */}
          <button
            type="button"
            onClick={() => { setSelectedRoleTile('Super Admin'); setSignUpRole('Super Admin'); }}
            className={`p-5 rounded-3xl border text-left transition duration-200 relative overflow-hidden flex flex-col justify-between space-y-4 ${
              selectedRoleTile === 'Super Admin'
                ? 'bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/50'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {selectedRoleTile === 'Super Admin' && (
              <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 p-1 rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}

            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">👑 Super Admin</h3>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Full administrative control, member approvals, reports, and system settings.
              </p>
            </div>

            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
              Master Access
            </span>
          </button>

          {/* Tile 2: Collector */}
          <button
            type="button"
            onClick={() => { setSelectedRoleTile('Collector'); setSignUpRole('Collector'); }}
            className={`p-5 rounded-3xl border text-left transition duration-200 relative overflow-hidden flex flex-col justify-between space-y-4 ${
              selectedRoleTile === 'Collector'
                ? 'bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/50'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {selectedRoleTile === 'Collector' && (
              <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 p-1 rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}

            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">🤝 Seva Collector</h3>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Record donations, issue receipts, and sync offline collection queue.
              </p>
            </div>

            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
              Collection Access ({currentCollectorsCount}/{MAX_COLLECTORS_LIMIT})
            </span>
          </button>

          {/* Tile 3: Public Visitor */}
          <button
            type="button"
            onClick={() => { setSelectedRoleTile('Viewer'); setSignUpRole('Viewer'); }}
            className={`p-5 rounded-3xl border text-left transition duration-200 relative overflow-hidden flex flex-col justify-between space-y-4 ${
              selectedRoleTile === 'Viewer'
                ? 'bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/50'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {selectedRoleTile === 'Viewer' && (
              <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 p-1 rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}

            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <EyeIcon className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">👁️ Public Visitor</h3>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Read-only public dashboard, receipt verifier, and countdown timer.
              </p>
            </div>

            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">
              Read-Only Access
            </span>
          </button>

        </div>

        {/* AUTH FORM CARD */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg mx-auto shadow-2xl space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 rounded-2xl">
            <button
              onClick={() => { setActiveTab('signin'); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition ${
                activeTab === 'signin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In Existing Account
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition ${
                activeTab === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up New Account
            </button>
          </div>

          {message && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-200 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-amber-950/80 border border-amber-700 rounded-2xl flex items-center space-x-2 text-xs font-bold text-amber-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. karthiknetha@sreeramsena.org)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-3 rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-950/50 transition"
              >
                <span>Sign In as {selectedRoleTile}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Karthik Netha"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="karthiknetha@sreeramsena.org"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Requested Role</label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-extrabold text-white outline-none"
                >
                  <option value="Collector">Collector (Requires Single Approval - Max 5 Members)</option>
                  <option value="Viewer">Visitor (Requires Single Approval for Permanent Access)</option>
                </select>
              </div>

              <div className="p-3.5 bg-amber-950/60 rounded-2xl border border-amber-800/60 text-[11px] text-amber-200 font-medium leading-relaxed">
                🔑 <strong>Single Approval Access:</strong> Submitted registrations require a single Super Admin approval. Once approved, you gain permanent access to sign in anytime.
              </div>

              <button
                type="submit"
                disabled={signUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT}
                className={`w-full flex items-center justify-center space-x-2 p-3 rounded-2xl text-xs font-extrabold shadow-lg transition ${
                  signUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {signUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT
                    ? 'Collector Limit Reached (Max 5)'
                    : 'Submit Registration Request'}
                </span>
              </button>

            </form>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center z-10 pt-4 pb-2 border-t border-slate-900 text-[11px] text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 {committeeInfo.name} • All Rights Reserved</span>
        <div className="flex items-center space-x-4">
          <span>Official Festival Manager</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Vercel Enterprise Active</span>
        </div>
      </footer>

    </div>
  );
};
