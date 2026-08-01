// Audit Logger Utility for SREE RAM SENA Divine Manager
const AUDIT_STORAGE_KEY = 'sreeramsena_audit_logs';

export const logAction = (user, role, action, details = {}) => {
  const existing = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
  
  const logEntry = {
    id: String(Date.now()),
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-IN'),
    user: user || 'Anonymous User',
    role: role || 'Viewer',
    action,
    details,
    device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'
  };

  const updated = [logEntry, ...existing].slice(0, 200); // Keep latest 200 logs
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  return logEntry;
};

export const getAuditLogs = () => {
  return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
};

export const clearAuditLogs = () => {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
};

export const exportAuditLogsCSV = () => {
  const logs = getAuditLogs();
  if (logs.length === 0) return '';

  const headers = ['Timestamp', 'User', 'Role', 'Action', 'Device', 'Details'];
  const rows = logs.map(l => [
    `"${l.timestamp}"`,
    `"${l.user}"`,
    `"${l.role}"`,
    `"${l.action}"`,
    `"${l.device}"`,
    `"${JSON.stringify(l.details).replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
