import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  X, 
  Check, 
  Clock, 
  UserPlus, 
  AlertTriangle 
} from 'lucide-react';

export const AdminUsersModal = ({ isOpen, onClose }) => {
  const { registeredUsers, approveUser, rejectUser, role } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'all'

  if (!isOpen) return null;

  const pendingUsers = registeredUsers.filter(u => u.status === 'Pending Approval');
  const approvedUsers = registeredUsers.filter(u => u.status === 'Approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center font-extrabold">
              <Users className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Super Admin User Approval Portal</h3>
              <p className="text-xs text-slate-300">Approve or reject Collector registration requests</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 text-xs font-extrabold transition border-b-2 flex items-center space-x-2 ${
              activeSubTab === 'pending'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
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
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
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
                  <UserCheck className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                  <h4 className="font-extrabold text-sm text-slate-800">No Pending Registration Requests</h4>
                  <p className="text-xs text-slate-500">All collector signups are up to date and approved.</p>
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
                  <span className="font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    {u.role} (Approved)
                  </span>
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
