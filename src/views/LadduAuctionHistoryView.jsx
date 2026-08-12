import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Plus, Edit2, Archive, ShieldCheck, Calendar, MapPin, Award, X, History, Sparkles } from 'lucide-react';

export const LadduAuctionHistoryView = () => {
  const { 
    selectedYear, 
    previousYear, 
    role, 
    ladduAuctionCurrentYear = [], 
    ladduAuctionPreviousYear = [], 
    addLadduAuctionWinner, 
    updateLadduAuctionWinner, 
    archiveLadduAuctionWinner 
  } = useApp();

  const isSuperAdmin = role === 'Super Admin';

  // Latest Winners computed from Firestore createdAt DESC
  const latestCurrentWinner = ladduAuctionCurrentYear[0] || null;
  const latestPreviousWinner = ladduAuctionPreviousYear[0] || null;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [targetYear, setTargetYear] = useState(selectedYear);
  const [winnerName, setWinnerName] = useState('');
  const [winningAmount, setWinningAmount] = useState('');
  const [village, setVillage] = useState('');
  const [auctionDate, setAuctionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenAdd = (yearOverride = selectedYear) => {
    setEditingId(null);
    setTargetYear(yearOverride);
    setWinnerName('');
    setWinningAmount('');
    setVillage('Govindhupalli');
    setAuctionDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleOpenEdit = (record, yearOverride = selectedYear) => {
    setEditingId(record.id);
    setTargetYear(record.festivalYear || yearOverride);
    setWinnerName(record.winnerName || '');
    setWinningAmount(record.winningAmount || '');
    setVillage(record.village || '');
    setAuctionDate(record.auctionDate || new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!winnerName.trim() || !winningAmount) {
      alert("Please enter Winner Name and Winning Amount.");
      return;
    }

    const payload = {
      winnerName: winnerName.trim(),
      winningAmount: parseFloat(winningAmount) || 0,
      village: village.trim(),
      auctionDate,
      targetYear
    };

    if (editingId) {
      await updateLadduAuctionWinner(editingId, payload);
    } else {
      await addLadduAuctionWinner(payload);
    }

    setModalOpen(false);
    setWinnerName('');
    setWinningAmount('');
    setVillage('');
  };

  const handleArchive = async (id, name, yearToArchive = selectedYear) => {
    if (window.confirm(`Are you sure you want to archive the auction winner entry for "${name}" (${yearToArchive})?`)) {
      await archiveLadduAuctionWinner(id, yearToArchive);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Title Banner & Super Admin Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-yellow-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-amber-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
              OFFICIAL FESTIVAL RECORD • {selectedYear}
            </span>
            <span className="text-amber-200 text-xs font-bold">• {ladduAuctionCurrentYear.length} Recorded Entries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
            <span>Laddu Auction Winner History</span>
          </h1>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Official sacred Ganesha Laddu Prasadam auction winner records for festival year {selectedYear}.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenAdd(selectedYear)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg transition transform active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>+ Add {selectedYear} Winner</span>
            </button>
            <button
              onClick={() => handleOpenAdd(previousYear)}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs px-3 py-3 rounded-2xl border border-slate-600 shadow-md transition transform active:scale-95 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add {previousYear} Winner</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. TOP BANNER: CURRENT YEAR LATEST WINNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-400/50">
        <div className="absolute -right-6 -bottom-6 opacity-15 text-white pointer-events-none">
          <Trophy className="w-56 h-56" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-slate-950/40 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-300/40">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black text-amber-200 uppercase tracking-widest">
                🏆 {selectedYear} LADDU AUCTION WINNER
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-amber-100/90 bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
                Top Official Record
              </span>
              {isSuperAdmin && latestCurrentWinner && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(latestCurrentWinner, selectedYear)}
                    className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-200 transition"
                    title="Edit Top Winner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchive(latestCurrentWinner.id, latestCurrentWinner.winnerName, selectedYear)}
                    className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-red-900 text-red-200 transition"
                    title="Archive Record"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {latestCurrentWinner ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-200/90 uppercase tracking-wider block">Winner Name</span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {latestCurrentWinner.winnerName}
                </h2>
                {latestCurrentWinner.village && (
                  <p className="text-xs font-bold text-amber-100 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    <span>Village: {latestCurrentWinner.village}</span>
                  </p>
                )}
              </div>

              <div className="bg-slate-950/50 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-amber-300/30 text-right flex-shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">Winning Bid Amount</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  ₹ {parseFloat(latestCurrentWinner.winningAmount).toLocaleString('en-IN')}/-
                </span>
                <span className="text-[10px] font-bold text-amber-200 block mt-0.5">
                  Date: {latestCurrentWinner.auctionDate || 'Official Record'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2 bg-slate-950/30 rounded-2xl border border-amber-400/20">
              <Trophy className="w-10 h-10 text-amber-300/60 mx-auto" />
              <h3 className="text-lg font-bold text-white">🏆 {selectedYear} LADDU AUCTION</h3>
              <p className="text-xs text-amber-200 font-medium">
                No winner has been recorded yet for festival year {selectedYear}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. LOWER BANNER: PREVIOUS FESTIVAL YEAR LATEST WINNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 text-amber-400 flex items-center justify-center font-black flex-shrink-0 border border-slate-600">
            <History className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PREVIOUS YEAR WINNER ({previousYear})
              </span>
              <span className="bg-slate-700/80 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-600">
                {previousYear} Record
              </span>
              {isSuperAdmin && latestPreviousWinner && (
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handleOpenEdit(latestPreviousWinner, previousYear)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition"
                    title="Edit 2025 Winner"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleArchive(latestPreviousWinner.id, latestPreviousWinner.winnerName, previousYear)}
                    className="p-1 rounded bg-slate-800 hover:bg-red-900 text-red-300 transition"
                    title="Archive Record"
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {latestPreviousWinner ? (
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 flex items-center gap-2">
                <span>{latestPreviousWinner.winnerName}</span>
                {latestPreviousWinner.village && (
                  <span className="text-xs font-semibold text-slate-400">({latestPreviousWinner.village})</span>
                )}
              </h3>
            ) : (
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                No previous winner recorded for festival year {previousYear}.
              </p>
            )}
          </div>
        </div>

        {latestPreviousWinner ? (
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700 text-right flex-shrink-0 self-end sm:self-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Winning Amount</span>
            <span className="text-lg font-black text-amber-400">
              ₹ {parseFloat(latestPreviousWinner.winningAmount).toLocaleString('en-IN')}/-
            </span>
          </div>
        ) : (
          isSuperAdmin && (
            <button
              onClick={() => handleOpenAdd(previousYear)}
              className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl transition"
            >
              + Record {previousYear} Winner
            </button>
          )
        )}
      </div>

      {/* 4. HISTORICAL WINNER LEDGER FOR SELECTED YEAR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="font-extrabold text-base text-slate-900">
              {selectedYear} Auction Winner History Ledger
            </h2>
          </div>
          <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Ordered Newest First (DESC)
          </span>
        </div>

        {ladduAuctionCurrentYear.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No Historical Records Found for {selectedYear}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isSuperAdmin ? 'Click "+ Add ' + selectedYear + ' Winner" above to record the sacred auction winner.' : 'No auction winner entries have been published for ' + selectedYear + ' yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ladduAuctionCurrentYear.map((record, idx) => {
              const isTopEntry = idx === 0;
              return (
                <div 
                  key={record.id || idx} 
                  className={`rounded-2xl p-5 border transition flex flex-col justify-between space-y-4 ${
                    isTopEntry 
                      ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white border-amber-300 shadow-md ring-2 ring-amber-400/30' 
                      : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        isTopEntry 
                          ? 'bg-amber-500 text-slate-950 border-amber-600' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isTopEntry ? '🏆 TOP LATEST ENTRY' : `ENTRY #${ladduAuctionCurrentYear.length - idx}`}
                      </span>

                      {isSuperAdmin && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(record, selectedYear)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition"
                            title="Edit Winner Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(record.id, record.winnerName, selectedYear)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 transition"
                            title="Archive Record"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-lg text-slate-900 leading-tight">
                        {record.winnerName}
                      </h4>
                      {record.village && (
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{record.village}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Winning Bid</span>
                      <span className="text-lg font-black text-emerald-800">
                        ₹ {parseFloat(record.winningAmount).toLocaleString('en-IN')}/-
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Auction Date</span>
                      <span className="text-xs font-extrabold text-slate-700">
                        {record.auctionDate || 'Official Record'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SUPER ADMIN ADD / EDIT AUCTION WINNER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>{editingId ? 'Edit Laddu Auction Winner' : 'Add Laddu Auction Winner'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Festival Year *</label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-black text-amber-950 outline-none focus:border-amber-500"
                  required
                >
                  <option value="2025">2025 Festival Year</option>
                  <option value="2026">2026 Festival Year</option>
                  <option value="2027">2027 Festival Year</option>
                  <option value="2028">2028 Festival Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Winner Full Name *</label>
                <input
                  type="text"
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Winning Amount (₹) *</label>
                <input
                  type="number"
                  value={winningAmount}
                  onChange={(e) => setWinningAmount(e.target.value)}
                  placeholder="e.g. 175000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Village / Address (Optional)</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Govindhupalli, Jagtial"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Auction Date</label>
                <input
                  type="date"
                  value={auctionDate}
                  onChange={(e) => setAuctionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md transition"
                >
                  {editingId ? `Save Changes for ${targetYear}` : `Record Winner for ${targetYear}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
