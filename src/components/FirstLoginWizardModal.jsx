import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, ArrowRight, CheckCircle, QrCode, Calendar, Users, Sparkles, Building2 } from 'lucide-react';

export const FirstLoginWizardModal = ({ isOpen, onClose }) => {
  const { committeeInfo, setCommitteeInfo, registeredUsers = [] } = useApp();
  const [step, setStep] = useState(1); // Step 1 to 4

  const [wizardName, setWizardName] = useState(committeeInfo.name);
  const [wizardVillage, setWizardVillage] = useState(committeeInfo.village);
  const [wizardPhone, setWizardPhone] = useState(committeeInfo.phone);
  const [wizardUpi, setWizardUpi] = useState(committeeInfo.upiId);

  if (!isOpen) return null;

  const pendingUsersCount = (registeredUsers || []).filter(u => u.status === 'Pending Approval').length;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save changes
      setCommitteeInfo({
        ...committeeInfo,
        name: wizardName,
        village: wizardVillage,
        phone: wizardPhone,
        upiId: wizardUpi
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-lg">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Super Admin Setup Wizard</h3>
              <p className="text-xs text-emerald-100/90">Step {step} of 4 • Configure your committee parameters</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-6 space-y-5 text-xs font-semibold text-slate-800">
          
          {/* STEP 1: Committee Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>1. Committee Profile Setup</span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Organization Name</label>
                <input
                  type="text"
                  value={wizardName}
                  onChange={(e) => setWizardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Village / Mandal</label>
                  <input
                    type="text"
                    value={wizardVillage}
                    onChange={(e) => setWizardVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Committee Contact Phone</label>
                  <input
                    type="text"
                    value={wizardPhone}
                    onChange={(e) => setWizardPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UPI Payment Setup */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>2. Payment & UPI QR Setup</span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Committee Official VPA / UPI ID</label>
                <input
                  type="text"
                  value={wizardUpi}
                  onChange={(e) => setWizardUpi(e.target.value)}
                  placeholder="e.g. karthikeyanetha@slc"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-950 text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                ✓ This UPI ID generates the scannable payment QR code printed on all receipts!
              </div>
            </div>
          )}

          {/* STEP 3: Festival Countdown */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>3. Festival Countdown & Dates</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                <h4 className="font-extrabold text-amber-950 text-xs">Vinayaka Chavithi 2026</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  Countdown is active: <strong>44 Days Remaining</strong> until festival commencement in Govindhupalli!
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Member Approvals */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>4. Member Approvals & Status</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Pending Registrations:</span>
                  <span className="font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {pendingUsersCount} Pending
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Manage member approvals anytime from the top Navigation bar under Super Admin controls.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Back
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs shadow-md flex items-center space-x-1"
            >
              <span>{step === 4 ? 'Complete Setup' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
