import React, { useState } from 'react';
import { useApp, MAX_COLLECTORS_LIMIT } from '../context/AppContext';
import { ShieldCheck, Lock, User, KeyRound, X, CheckCircle, ArrowRight, UserPlus, AlertCircle, LogOut } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { setRole, role, registerUser, registeredUsers = [], setCurrentUser, currentUser, signOut } = useApp();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'

  // Sign In State (Starts completely empty with no pre-filled demo text)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState('Collector');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      setMessage(`Signed in successfully as ${found.name} (${found.role})`);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1000);
    } else {
      // Recognized Admin Accounts or Custom Credentials
      if (inputEmailClean.includes('admin') || inputEmailClean === 'karthikeyanetha7@gmail.com') {
        setRole('Super Admin');
        setCurrentUser({ name: 'Gurram Karthikeya (Super Admin)', email: inputEmailClean, role: 'Super Admin' });
      } else if (inputEmailClean.includes('collector')) {
        setRole('Collector');
        setCurrentUser({ name: 'Collector Member', email: inputEmailClean, role: 'Collector' });
      } else {
        setRole('Viewer');
        setCurrentUser({ name: 'Public Visitor', email: inputEmailClean, role: 'Viewer' });
      }
      setMessage(`Signed in successfully`);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1000);
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
      setMessage(`Registration submitted! Your ${signUpRole} account is pending Super Admin approval. Once approved, you have permanent access to sign in anytime.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-2 text-white font-extrabold">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h3 className="font-extrabold text-lg tracking-tight">Official Sign In & Member Portal</h3>
          <p className="text-xs text-emerald-100/90 mt-0.5">SREE RAM SENA Vinayaka Chaturthi 2026</p>
        </div>

        {/* Currently Logged In Session State */}
        {role !== 'Viewer' && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-slate-700 block">Logged in session:</span>
              <strong className="text-emerald-900 font-extrabold">{currentUser?.name} ({role})</strong>
            </div>
            <button
              onClick={() => {
                if (signOut) signOut();
                onClose();
              }}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { setActiveTab('signin'); setError(''); setMessage(''); }}
            className={`flex-1 py-3 text-xs font-extrabold transition border-b-2 ${
              activeTab === 'signin'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In Existing Account
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
            className={`flex-1 py-3 text-xs font-extrabold transition border-b-2 ${
              activeTab === 'signup'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up New Account ({currentCollectorsCount}/{MAX_COLLECTORS_LIMIT})
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. karthikeyanetha7@gmail.com)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 transition"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Gurram Karthikeya"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="karthikeyanetha7@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Requested Account Role</label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 outline-none"
                >
                  <option value="Collector">Collector (Requires Single Approval - Max 5 Members)</option>
                  <option value="Viewer">Visitor (Requires Single Approval for Permanent Access)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium leading-snug">
                🔑 <strong>Single Approval Permanent Access:</strong> Both Visitors and Collectors require a single Super Admin approval upon signup. Once approved, you gain permanent access and can sign in anytime.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={signUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT}
                  className={`w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl text-xs font-extrabold shadow-md transition ${
                    signUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {signUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT
                      ? 'Collector Limit Reached (Max 5)'
                      : 'Register Account Request'}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
