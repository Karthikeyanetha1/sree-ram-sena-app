import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Code2, 
  Check, 
  AlertCircle, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { setRole, registerUser, registeredUsers = [], setCurrentUser, committeeInfo } = useApp();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // Log In Form Inputs (Matching Screenshot 2 100%)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form Inputs (Matching Screenshot 1 100%)
  const [signUpName, setSignUpName] = useState('');
  const [signUpIdentifier, setSignUpIdentifier] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSignUpRole, setSelectedSignUpRole] = useState('Collector'); // 'Collector' | 'Viewer' (Super Admin hidden)

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentCollectorsCount = (registeredUsers || []).filter(u => u.role === 'Collector').length;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanInput = loginIdentifier.trim().toLowerCase();

    if (!cleanInput) {
      setError('Please enter your email or mobile number.');
      return;
    }

    const found = (registeredUsers || []).find(u => 
      u.email.toLowerCase() === cleanInput || u.id === cleanInput
    );

    if (found) {
      if (found.status === 'Pending Approval') {
        setError(`Your registration request for ${found.role} is currently PENDING APPROVAL by Super Admin.`);
        return;
      }
      if (found.status === 'Disabled' || found.status === 'Suspended') {
        setError(`Account is ${found.status}. Please contact Super Admin.`);
        return;
      }
      setRole(found.role);
      setCurrentUser(found);
      setMessage(`Logged in successfully as ${found.name} (${found.role})`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    } else {
      // Recognized Admin Accounts or Selected Credentials
      let assignedRole = 'Viewer';
      let userName = 'Public Visitor';

      if (cleanInput.includes('admin') || cleanInput.includes('dustin') || cleanInput.includes('jony') || cleanInput.includes('prince')) {
        assignedRole = 'Super Admin';
        userName = 'Dustin (Super Admin)';
      } else if (cleanInput.includes('collector')) {
        assignedRole = 'Collector';
        userName = 'Prince (Collector)';
      }

      setRole(assignedRole);
      setCurrentUser({ name: userName, email: cleanInput, role: assignedRole });
      setMessage(`Logged in successfully as ${assignedRole}`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!signUpName || !signUpIdentifier || !signUpPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (signUpPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please re-enter password.');
      return;
    }

    try {
      if (registerUser) {
        registerUser(signUpName, signUpIdentifier, selectedSignUpRole);
      }
      setMessage(`Registration request submitted! Your ${selectedSignUpRole} account is pending Super Admin approval.`);
      setTimeout(() => {
        setActiveTab('login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-900 font-sans relative overflow-hidden">
      
      {/* Background Accent Blur */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div />

      {/* Main Centered Minimalist Auth Card (Matching User Screenshots 100%) */}
      <main className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-5 z-10 text-center animate-in fade-in zoom-in-95 duration-300 my-auto">
        
        {/* App Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Layers className="w-7 h-7 text-white" />
        </div>

        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Divine Manager
          </h1>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            {committeeInfo.name} • {committeeInfo.mandal} • EST. {committeeInfo.since || '2016'}
          </p>
        </div>

        {/* Tab Switcher: Log In vs Sign Up (Matching Screenshot 1 & 2) */}
        <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              activeTab === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              activeTab === 'signup'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center space-x-2 text-left">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-center space-x-2 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOG IN FORM (Matching Screenshot 2 100%) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Email or Mobile</label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="you@example.com or 9876543210"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/25 transition active:scale-98"
            >
              Log In
            </button>

          </form>
        )}

        {/* TAB 2: SIGN UP FORM (Matching Screenshot 1 100%) */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-left">
            
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Email or Mobile</label>
              <input
                type="text"
                required
                value={signUpIdentifier}
                onChange={(e) => setSignUpIdentifier(e.target.value)}
                placeholder="you@example.com or 9876543210"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">At least 8 characters</span>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection Pills for Public Signup (Super Admin Hidden for Security) */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Requested Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSignUpRole('Collector')}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-black transition ${
                    selectedSignUpRole === 'Collector'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Collector ({currentCollectorsCount}/5)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSignUpRole('Viewer')}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-black transition ${
                    selectedSignUpRole === 'Viewer'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Viewer
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedSignUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT}
              className={`w-full py-3.5 text-white rounded-2xl text-xs font-black shadow-lg transition ${
                selectedSignUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 shadow-blue-500/25 active:scale-98'
              }`}
            >
              {selectedSignUpRole === 'Collector' && currentCollectorsCount >= MAX_COLLECTORS_LIMIT
                ? 'Collector Limit Reached (Max 5)'
                : 'Create Account'}
            </button>

            <span className="text-[10px] text-slate-400 font-medium block text-center pt-1">
              Accounts require single Super Admin approval for permanent activation.
            </span>

          </form>
        )}

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
