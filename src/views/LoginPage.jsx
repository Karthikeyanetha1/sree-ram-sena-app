import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Users,
  Shield,
  Sparkles,
  Phone,
  Clock
} from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { setRole, setCurrentUser, registeredUsers, registerUser } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signUpName, setSignUpName] = useState('');
  const [signUpIdentifier, setSignUpIdentifier] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSignUpRole, setSelectedSignUpRole] = useState('Collector');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Failed Login Brute-Force Protection State (5 Wrong Passwords = 15-min Lock)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const normalizeRole = (rawRole, input = '') => {
    if (!rawRole) {
      const lower = input.toLowerCase();
      if (lower.includes('admin') || lower.includes('speed') || lower.includes('karthik') || lower.includes('dustin')) return 'Super Admin';
      if (lower.includes('collector')) return 'Collector';
      return 'Super Admin';
    }
    const lower = String(rawRole).toLowerCase();
    if (lower.includes('admin') || lower.includes('super')) return 'Super Admin';
    if (lower.includes('collector')) return 'Collector';
    return 'Viewer';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanInput = loginIdentifier.trim().toLowerCase();

    if (!cleanInput) {
      setError('Please enter your registered email or mobile number.');
      return;
    }

    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    // 0. Server-side Lockout Check via /api/login-check
    try {
      const lockRes = await fetch('/api/login-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_lock', email: cleanInput })
      });
      const lockData = await lockRes.json();
      if (lockData.locked) {
        const remaining = lockData.remainingSeconds || 900;
        setLockoutTimer(remaining);
        setError(`🚨 Account Locked for ${Math.ceil(remaining / 60)} minutes due to 5 consecutive wrong password attempts.`);
        return;
      }
    } catch (e) {
      console.warn("Lockout check API note:", e.message);
    }

    let authUser = null;

    // Helper for recording failed attempts
    const recordFailedAttempt = async (errorMessage) => {
      try {
        const failRes = await fetch('/api/login-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'failed_attempt', email: cleanInput })
        });
        const failData = await failRes.json();
        const nextFail = failData.failedAttempts || (failedAttempts + 1);
        setFailedAttempts(nextFail);

        if (failData.locked || nextFail >= 5) {
          const remaining = failData.remainingSeconds || 900;
          setLockoutTimer(remaining);
          setError(`🚨 Account Locked for 15 minutes due to 5 consecutive wrong password attempts.`);
          return;
        }
      } catch (e) {
        console.warn("Failed attempt record note:", e.message);
      }
      setError(errorMessage);
    };

    // Helper for recording success
    const recordSuccess = () => {
      try {
        fetch('/api/login-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'success', email: cleanInput })
        }).catch(e => console.warn("Reset lock note:", e.message));
      } catch (e) {}
    };

    // 1. Strict Firebase Authentication for Email Sign-In
    if (cleanInput.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanInput, loginPassword);
        authUser = userCredential.user;
      } catch (firebaseErr) {
        console.warn("Firebase Auth Notice:", firebaseErr.message);
        await recordFailedAttempt("🚨 Invalid Credentials: Email or password is incorrect. Only registered accounts in Firebase can access the portal.");
        return; // STOP EXECUTION IMMEDIATELY! NO FALLBACK LOGIN!
      }
    }

    // 2. Query Firestore `users` collection to fetch exact role, approval status & name
    try {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const foundFirestore = docs.find(d => 
        (d.Email && d.Email.toLowerCase() === cleanInput) || 
        (d.email && d.email.toLowerCase() === cleanInput) ||
        (d.Mobile && String(d.Mobile).replace(/\D/g, '') === cleanInput.replace(/\D/g, '')) ||
        (d.mobile && String(d.mobile).replace(/\D/g, '') === cleanInput.replace(/\D/g, ''))
      );

      if (foundFirestore) {
        // If logged in via Mobile (not Firebase Auth email), verify password match
        if (!cleanInput.includes('@')) {
          const docPassword = foundFirestore.Password || foundFirestore.password;
          if (docPassword && docPassword !== loginPassword) {
            await recordFailedAttempt("🚨 Invalid Credentials: Incorrect mobile number or password.");
            return; // STOP EXECUTION!
          }
        }

        const rawRole = foundFirestore.Role || foundFirestore.role || '';
        const lowerRole = String(rawRole).toLowerCase();
        const isSuperAdmin = lowerRole.includes('admin') || lowerRole.includes('super') || cleanInput.includes('speed') || cleanInput.includes('karthik');
        const isApproved = foundFirestore.Approved === true || foundFirestore.approved === true || foundFirestore.status === 'Approved' || isSuperAdmin;
        const isActive = foundFirestore.Active !== false && foundFirestore.active !== false && foundFirestore.status !== 'Disabled';

        if (!isApproved) {
          if (authUser) firebaseSignOut(auth);
          setError("⏳ Account Pending Approval: Your account is awaiting Super Admin approval before you can access the portal.");
          return;
        }

        if (!isActive) {
          if (authUser) firebaseSignOut(auth);
          setError("🚫 Account Disabled: Your account has been disabled by the Super Admin.");
          return;
        }

        recordSuccess();

        const fullName = foundFirestore['Full name'] || foundFirestore.fullName || foundFirestore.name || cleanInput.split('@')[0];
        const assignedRole = isSuperAdmin ? 'Super Admin' : (lowerRole.includes('collector') ? 'Collector' : 'Viewer');

        const userObj = {
          name: fullName,
          email: foundFirestore.Email || foundFirestore.email || cleanInput,
          role: assignedRole,
          status: 'Approved'
        };

        setRole(assignedRole);
        setCurrentUser(userObj);
        setMessage(`Logged in successfully as ${fullName} (${assignedRole})`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 500);
        return;
      }
    } catch (err) {
      console.warn("Firestore query note:", err.message);
    }

    // 3. Fallback for Local Registered Users (Strict Password Verification)
    const foundLocal = (registeredUsers || []).find(u => 
      (u.email.toLowerCase() === cleanInput || u.id === cleanInput) && u.password === loginPassword
    );

    if (foundLocal) {
      if (foundLocal.status === 'Pending Approval') {
        setError("⏳ Account Pending Approval: Your account is awaiting Super Admin approval.");
        return;
      }

      recordSuccess();

      const assignedRole = normalizeRole(foundLocal.role, cleanInput);
      const userObj = { ...foundLocal, role: assignedRole };
      setRole(assignedRole);
      setCurrentUser(userObj);
      setMessage(`Logged in successfully as ${foundLocal.name} (${assignedRole})`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
      return;
    }

    // If Firebase Auth succeeded (valid email/password in Firebase Auth but missing from Firestore `users`)
    if (authUser) {
      recordSuccess();
      const isSuperAdmin = cleanInput.includes('admin') || cleanInput.includes('speed') || cleanInput.includes('karthik');
      const assignedRole = isSuperAdmin ? 'Super Admin' : 'Viewer';
      const fullName = isSuperAdmin ? 'Gurram Karthikeya' : authUser.displayName || cleanInput.split('@')[0];

      const userObj = {
        name: fullName,
        email: cleanInput,
        role: assignedRole,
        status: 'Approved'
      };

      setRole(assignedRole);
      setCurrentUser(userObj);
      setMessage(`Logged in successfully as ${fullName} (${assignedRole})`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
      return;
    }

    // STRICT REJECTION FOR ANY UNREGISTERED / FAKE CREDENTIALS!
    await recordFailedAttempt("🚨 Invalid Credentials: Incorrect email/mobile or password. Only registered accounts can access SREE RAM SENA Divine Manager.");
  };

  const handlePasswordReset = async () => {
    setError('');
    setMessage('');
    const cleanEmail = loginIdentifier.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your valid email address above to receive a password reset link.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setMessage(`✓ Password reset link dispatched to ${cleanEmail}. Check your inbox!`);
    } catch (err) {
      setError(`Password reset notice: ${err.message}`);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!signUpName || !signUpIdentifier || !signUpPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    const cleanInput = signUpIdentifier.trim().toLowerCase();

    // Strict 8-character combination validation rule for Visitor / Collector Sign Ups
    const hasAlpha = /[a-zA-Z]/.test(signUpPassword);
    const hasNum = /[0-9]/.test(signUpPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signUpPassword);

    if (signUpPassword.length < 8 || !hasAlpha || !hasNum || !hasSpecial) {
      setError('🔒 Password Security Rule: Must be at least 8 characters long and contain a combination of Alphabets (A-Z), Numbers (0-9), and Special Characters (@, #, $, %, etc.).');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please re-enter password.');
      return;
    }

    // 1. Server-side Duplicate Check via Firebase Admin API (/api/check-duplicate)
    try {
      const res = await fetch(`/api/check-duplicate?email=${encodeURIComponent(cleanInput)}&mobile=${encodeURIComponent(cleanInput)}`);
      const data = await res.json();
      if (data.exists) {
        const fieldName = data.field === 'mobile' ? 'Mobile' : 'Email';
        setError(`🚨 Account Already Exists: An account with this ${fieldName} (${cleanInput}) is already registered. Please switch to Log In.`);
        return; // STOP EXECUTION!
      }
    } catch (err) {
      console.warn("Duplicate check API note:", err.message);
    }

    // Public Sign Ups are explicitly restricted to Collector or Viewer roles only
    const publicRole = selectedSignUpRole === 'Collector' ? 'Collector' : 'Viewer';

    // Register user with Approved: false & status: 'Pending Approval'
    await registerUser(signUpName, cleanInput, signUpPassword, publicRole);

    // Display Pending Approval Message (DO NOT LOG THEM IN!)
    setMessage(`⏳ Registration Submitted Successfully for ${signUpName} (${publicRole})! Your account is awaiting Super Admin approval. Once approved by the Super Admin, you can log in with your credentials.`);

    // Reset sign up form
    setSignUpName('');
    setSignUpIdentifier('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');

    // Switch back to Login tab after 2.5 seconds
    setTimeout(() => {
      setActiveTab('login');
      setLoginIdentifier(cleanInput);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-500 text-white shadow-xl shadow-indigo-500/20 border border-indigo-400/30 mb-2">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          SREE RAM SENA
        </h1>
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          VINAYAKA CHAVITHI 2026 • DIVINE MANAGER
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
          
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
              className={`py-2 text-xs font-black rounded-xl transition ${
                activeTab === 'login'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
              className={`py-2 text-xs font-black rounded-xl transition ${
                activeTab === 'signup'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-2xl flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* Lockout Warning */}
          {lockoutTimer > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 text-xs font-black rounded-2xl flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                <span>Account Locked (5 wrong attempts)</span>
              </span>
              <span className="font-mono text-amber-900">{Math.floor(lockoutTimer / 60)}:{String(lockoutTimer % 60).padStart(2, '0')}</span>
            </div>
          )}

          {/* TAB 1: LOG IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
              
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="you@example.com or 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs font-semibold">
              
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email or Mobile</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signUpIdentifier}
                    onChange={(e) => setSignUpIdentifier(e.target.value)}
                    placeholder="you@example.com or 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  🔒 Must be 8+ characters combining Alphabets (A-Z), Numbers (0-9) & Special Characters (@, #, $).
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSignUpRole('Collector')}
                    className={`py-2 rounded-xl border font-extrabold text-xs transition ${
                      selectedSignUpRole === 'Collector'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    🤝 Collector
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSignUpRole('Viewer')}
                    className={`py-2 rounded-xl border font-extrabold text-xs transition ${
                      selectedSignUpRole === 'Viewer'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    👁️ Viewer
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

        </div>

        {/* Footer Branding */}
        <div className="text-center mt-6">
          <span className="text-xs text-slate-500 font-semibold">
            Powered by <strong className="text-white">codewithk developer</strong>
          </span>
        </div>

      </div>
    </div>
  );
};
