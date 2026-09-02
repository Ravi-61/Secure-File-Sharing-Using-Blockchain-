import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldAlert, Activity, CheckCircle2, FileSearch, ShieldCheck } from 'lucide-react';

export default function AuditorDashboardPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditorLogs = async () => {
      try {
        const [auditRes, secRes] = await Promise.all([
          API.get('/admin/audit-logs'),
          API.get('/admin/security-logs'),
        ]);
        setAuditLogs(auditRes.data.logs);
        setSecurityLogs(secRes.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditorLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-amber-300">Auditor Compliance Center</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Real-time Forensic Audit Trail & Cybersecurity IDS Event Monitor</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono">
          Auditor Compliance Role
        </span>
      </div>

      {/* Security Threat Alerts Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Intrusion Detection System (IDS) Alerts
        </h3>

        {securityLogs.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No threat alerts logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {securityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-rose-300">{log.eventType}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold">
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 text-cyan-400">{log.sourceIp}</td>
                    <td className="p-3 text-slate-300">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Audit Trail Logs */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-amber-400" />
          System Activity Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">User Email</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-900/40">
                  <td className="p-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-cyan-300">{log.action}</td>
                  <td className="p-3 text-slate-300">{log.userEmail}</td>
                  <td className="p-3 text-slate-400">{log.ipAddress}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
