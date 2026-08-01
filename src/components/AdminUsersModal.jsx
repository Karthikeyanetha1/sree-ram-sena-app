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
  ShieldAlert,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

export const AdminUsersModal = ({ isOpen, onClose }) => {
  const { 
    registeredUsers, 
    approveUser, 
    rejectUser, 
    updateUserStatus, 
    deleteUserAccount,
    updateSuperAdminCredentials,
    emergencyLock, 
    toggleEmergencyLock, 
    currentUser 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'all' | 'creds'

  // Admin Credentials Reset State
  const [adminName, setAdminName] = useState(currentUser?.name || 'Dustin (Super Admin)');
  const [adminEmail, setAdminEmail] = useState(currentUser?.email || 'admin@sreeramsena.org');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPass, setShowAdminPass] = useState(false);

  if (!isOpen) return null;

  const pendingUsers = registeredUsers.filter(u => u.status === 'Pending Approval');
  const approvedUsers = registeredUsers.filter(u => u.status === 'Approved');
  const activeCollectorsCount = registeredUsers.filter(u => u.role === 'Collector' && u.status === 'Approved').length;

  const handleUpdateAdminCreds = (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPassword) {
      alert("Please fill in all fields for the new Super Admin account.");
      return;
    }
    updateSuperAdminCredentials(adminName, adminEmail, adminPassword);
    alert("✓ Super Admin credentials updated! Old default credentials have been deleted.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-lg">
              👑
            </div>
            <div>
              <h3 className="font-extrabold text-base">Super Admin Roster & Credentials Portal</h3>
              <p className="text-xs text-indigo-100">View user IDs, manage permissions, or change Super Admin credentials</p>
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
              <h4 className="font-black text-xs text-amber-950">🚨 Emergency Collector Lock</h4>
              <p className="text-[11px] text-amber-800 font-medium">
                {emergencyLock 
                  ? 'All Collector entry permissions are currently DISABLED.' 
                  : 'Active Collectors: ' + activeCollectorsCount + ' / ' + MAX_COLLECTORS_LIMIT + ' Limit.'}
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
            <span>Full User Roster ({registeredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('creds')}
            className={`px-4 py-2 text-xs font-extrabold transition border-b-2 flex items-center space-x-2 ${
              activeSubTab === 'creds'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Change Super Admin ID</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs font-semibold">
          
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

          {/* TAB 2: FULL USER ROSTER (SUPER ADMIN, COLLECTORS, VISITORS) */}
          {activeSubTab === 'all' && (
            <div className="space-y-3">
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Registered Accounts & Passwords</h4>

              {registeredUsers.map((u) => (
                <div key={u.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900">{u.name}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        u.role === 'Super Admin' ? 'bg-amber-100 text-amber-900' :
                        u.role === 'Collector' ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px]">{u.email}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`font-extrabold px-2.5 py-1 rounded-full text-[10px] ${
                      u.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      u.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>

                    {u.role !== 'Super Admin' && (
                      <>
                        <button
                          onClick={() => updateUserStatus(u.id, u.status === 'Disabled' ? 'Approved' : 'Disabled')}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold"
                        >
                          {u.status === 'Disabled' ? 'Enable' : 'Disable'}
                        </button>
                        <button
                          onClick={() => deleteUserAccount(u.id)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: UPDATE SUPER ADMIN CREDENTIALS */}
          {activeSubTab === 'creds' && (
            <form onSubmit={handleUpdateAdminCreds} className="space-y-4 max-w-md bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
              <div className="flex items-center space-x-2 text-indigo-900 font-black">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Create New Super Admin Credentials</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Updating your details here deletes old default admin credentials and locks the platform to your new email & password.
              </p>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Super Admin Display Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Gurram Karthikeya"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-extrabold text-slate-900 bg-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Super Admin Email / Login ID</label>
                <input
                  type="text"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@sreeramsena.org"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">New Super Admin Password</label>
                <div className="relative">
                  <input
                    type={showAdminPass ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-white outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs rounded-xl shadow-md transition hover:from-indigo-700 hover:to-blue-700 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save New Super Admin Credentials</span>
              </button>
            </form>
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
