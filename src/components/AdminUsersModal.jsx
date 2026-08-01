import React, { useState } from 'react';
import { useApp, MAX_COLLECTORS_LIMIT } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  X, 
  Check, 
  Clock, 
  UserPlus, 
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';

export const AdminUsersModal = ({ isOpen, onClose }) => {
  const { registeredUsers, approveUser, rejectUser, updateUserStatus, emergencyLock, toggleEmergencyLock, role } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'all'

  if (!isOpen) return null;

  const pendingUsers = registeredUsers.filter(u => u.status === 'Pending Approval');
  const approvedUsers = registeredUsers.filter(u => u.status === 'Approved');
  const activeCollectorsCount = registeredUsers.filter(u => u.role === 'Collector' && u.status === 'Approved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Super Admin User Approval Portal</h3>
              <p className="text-xs text-slate-300">Approve, reject, or manage member permissions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Lock Control Banner */}
        <div className="bg-amber-50 p-4 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <h4 className="font-black text-xs text-amber-950">🚨 Emergency Lock System</h4>
              <p className="text-[11px] text-amber-800 font-medium">
                {emergencyLock 
                  ? 'All Collector entry permissions are currently DISABLED.' 
                  : 'Collectors Active: ' + activeCollectorsCount + ' / ' + MAX_COLLECTORS_LIMIT + ' Limit.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleEmergencyLock}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-sm ${
              emergencyLock
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {emergencyLock ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{emergencyLock ? 'Lift Emergency Lock' : 'Disable All Collectors'}</span>
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 text-xs font-extrabold transition border-b-2 flex items-center space-x-2 ${
              activeSubTab === 'pending'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals ({pendingUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-2 text-xs font-extrabold transition border-b-2 flex items-center space-x-2 ${
              activeSubTab === 'all'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Approved Roster ({approvedUsers.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: PENDING APPROVALS */}
          {activeSubTab === 'pending' && (
            <div>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <UserCheck className="w-10 h-10 mx-auto text-indigo-600 mb-2" />
                  <h4 className="font-extrabold text-sm text-slate-800">No Pending Registration Requests</h4>
                  <p className="text-xs text-slate-500">All collector & visitor signups are up to date and approved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{u.name}</h4>
                          <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                            {u.role} Request
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-600 mt-0.5">{u.email}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => approveUser(u.id)}
                          className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectUser(u.id)}
                          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL APPROVED USERS */}
          {activeSubTab === 'all' && (
            <div className="space-y-3">
              {approvedUsers.map((u) => (
                <div key={u.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900">{u.name}</h4>
                    <p className="text-slate-500 font-mono">{u.email}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px]">
                      {u.role} ({u.status})
                    </span>
                    {u.role !== 'Super Admin' && (
                      <button
                        onClick={() => updateUserStatus(u.id, u.status === 'Disabled' ? 'Approved' : 'Disabled')}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold"
                      >
                        {u.status === 'Disabled' ? 'Enable' : 'Disable'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
};
