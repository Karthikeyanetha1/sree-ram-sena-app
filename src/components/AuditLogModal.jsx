import React, { useState, useEffect } from 'react';
import { getAuditLogs, clearAuditLogs, exportAuditLogsCSV } from '../utils/auditLogger';
import { ShieldCheck, X, Download, Trash2, Search, Activity, RefreshCw } from 'lucide-react';

export const AuditLogModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLogs(getAuditLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => 
    l.user.toLowerCase().includes(filter.toLowerCase()) ||
    l.action.toLowerCase().includes(filter.toLowerCase()) ||
    l.role.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const csvContent = exportAuditLogsCSV();
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SREE_RAM_SENA_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear audit logs?')) {
      clearAuditLogs();
      setLogs([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-emerald-100 overflow-hidden my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              📜
            </div>
            <div>
              <h3 className="font-extrabold text-base">Security & System Audit Log</h3>
              <p className="text-xs text-emerald-100/90">Immutable ledger of all login, transaction, receipt & WhatsApp events</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-semibold">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by user, action or role..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setLogs(getAuditLogs())}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold flex items-center space-x-1 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleClear}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400 font-bold">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3">
                        <strong className="text-slate-900 block text-xs">{log.user}</strong>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-extrabold">
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-extrabold text-xs">
                        {log.action}
                      </td>
                      <td className="p-3 text-[10px] text-slate-500 font-medium">
                        {log.device}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};
