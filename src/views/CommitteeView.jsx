import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Edit2, Trash2, ShieldCheck, UserCheck, X } from 'lucide-react';

export const CommitteeView = () => {
  const { selectedYear, role, committeeMembers = [], addCommitteeMember, updateCommitteeMember, deleteCommitteeMember } = useApp();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [position, setPosition] = useState('');
  const [name, setName] = useState('');

  const isSuperAdmin = role === 'Super Admin';

  const handleOpenAdd = () => {
    setEditingId(null);
    setPosition('');
    setName('');
    setModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member.id);
    setPosition(member.position || '');
    setName(member.name || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position.trim() || !name.trim()) {
      alert("Please enter both Position and Name.");
      return;
    }

    if (editingId) {
      await updateCommitteeMember(editingId, position, name);
    } else {
      await addCommitteeMember(position, name);
    }

    setModalOpen(false);
    setPosition('');
    setName('');
  };

  const handleDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this committee member?")) {
      await deleteCommitteeMember(memberId);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-emerald-700/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
              FESTIVAL YEAR {selectedYear}
            </span>
            <span className="text-emerald-300 text-xs font-bold">• {committeeMembers.length} Members</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Committee Management ({selectedYear})
          </h1>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            Official SREE RAM SENA festival organizers, executive officers, and seva members for {selectedYear}.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Committee Member</span>
          </button>
        )}
      </div>

      {/* Committee Grid / Table */}
      {committeeMembers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl mx-auto border border-emerald-200">
            <Users className="w-8 h-8 text-emerald-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Committee Members Added for {selectedYear}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isSuperAdmin ? 'Click "+ Add Committee Member" above to record committee positions for ' + selectedYear + '.' : 'No committee members have been published for ' + selectedYear + ' yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {committeeMembers.map((member, idx) => (
            <div key={member.id || idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-sm border border-emerald-300 flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 block inline-block mb-1">
                    {member.position}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {member.name}
                  </h4>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                    title="Edit Member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Committee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>{editingId ? 'Edit Committee Member' : 'Add Committee Member'} ({selectedYear})</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Position / Designation</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. President, Vice President, Treasurer, Member"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Member Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gurram Karthikeya"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition"
                >
                  {editingId ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
