import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Plus, Edit2, Trash2, ShieldCheck, HeartHandshake, X } from 'lucide-react';

export const SponsorsView = () => {
  const { selectedYear, role, sponsors = [], addSponsor, updateSponsor, deleteSponsor } = useApp();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');

  const isSuperAdmin = role === 'Super Admin';

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPurpose('');
    setModalOpen(true);
  };

  const handleOpenEdit = (sponsor) => {
    setEditingId(sponsor.id);
    setName(sponsor.name || '');
    setPurpose(sponsor.purpose || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !purpose.trim()) {
      alert("Please enter both Sponsor Name and Purpose.");
      return;
    }

    if (editingId) {
      await updateSponsor(editingId, name, purpose);
    } else {
      await addSponsor(name, purpose);
    }

    setModalOpen(false);
    setName('');
    setPurpose('');
  };

  const handleDelete = async (sponsorId) => {
    if (window.confirm("Are you sure you want to remove this sponsor?")) {
      await deleteSponsor(sponsorId);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-amber-700/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
              FESTIVAL YEAR {selectedYear}
            </span>
            <span className="text-amber-200 text-xs font-bold">• {sponsors.length} Sponsors</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Festival Sponsors ({selectedYear})
          </h1>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Generous sponsors supporting SREE RAM SENA Vinayaka Chavithi Seva Samithi for {selectedYear}.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Add Sponsor</span>
          </button>
        )}
      </div>

      {/* Sponsors List / Cards */}
      {sponsors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mx-auto border border-amber-200">
            <Award className="w-8 h-8 text-amber-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Sponsors Added for {selectedYear}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isSuperAdmin ? 'Click "+ Add Sponsor" above to record sponsors and their contribution purpose for ' + selectedYear + '.' : 'No sponsors recorded for ' + selectedYear + ' yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor, idx) => (
            <div key={sponsor.id || idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm border border-amber-300 flex-shrink-0 mt-0.5">
                  <HeartHandshake className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                    {sponsor.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 mt-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                    Purpose: <span className="font-extrabold text-slate-800">{sponsor.purpose}</span>
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(sponsor)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition"
                    title="Edit Sponsor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition"
                    title="Delete Sponsor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Sponsor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <span>{editingId ? 'Edit Sponsor' : 'Add Sponsor'} ({selectedYear})</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sponsor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Rice Mill, Sri Laxmi Traders"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose / Sponsorship Item</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Prasadam Distribution, Pandal Lights & Sound"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-slate-950 shadow-md transition"
                >
                  {editingId ? 'Save Changes' : 'Add Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
