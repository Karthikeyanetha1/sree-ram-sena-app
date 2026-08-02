import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

export const SessionTimeoutModal = () => {
  const { signOut, isAuthenticated } = useApp();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer;
    let warningCountdownTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearInterval(warningCountdownTimer);
      setShowWarning(false);
      setCountdown(60);

      // 15 Minutes Inactivity Timeout (15 * 60 * 1000 = 900,000 ms)
      inactivityTimer = setTimeout(() => {
        setShowWarning(true);
        startWarningCountdown();
      }, 900000);
    };

    const startWarningCountdown = () => {
      warningCountdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(warningCountdownTimer);
            signOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // User activity listeners
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(inactivityTimer);
      clearInterval(warningCountdownTimer);
    };
  }, [isAuthenticated, signOut]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 text-white text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-white">Session Inactivity Warning</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            You have been inactive for 30 minutes. For your security, you will be automatically signed out in:
          </p>
        </div>

        <div className="text-3xl font-black text-amber-400 bg-slate-950/60 py-3 rounded-2xl border border-amber-500/30">
          00:{String(countdown).padStart(2, '0')}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => signOut()}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Now</span>
          </button>
          
          <button
            onClick={() => {
              setShowWarning(false);
              setCountdown(60);
            }}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Keep Me Signed In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
