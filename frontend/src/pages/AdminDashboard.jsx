import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import {
  Users, FolderLock, Lock, Shield, AlertTriangle, Activity,
  BarChart3, TrendingUp, ShieldAlert, XCircle, CheckCircle2,
  Eye, Cpu, Database
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card glass-hover">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-extrabold font-mono text-slate-100">{value ?? "—"}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function ThreatFeed({ threats = [] }) {
  if (!threats.length) return (
    <div className="card space-y-2">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-rose-400" />
        IDS Threat Feed
      </h3>
      <div className="py-6 text-center text-slate-500">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
        <p className="text-sm">No active threats detected</p>
      </div>
    </div>
  );

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-rose-400" />
        IDS Threat Feed
        <span className="badge-error text-[10px]">{threats.length} Active</span>
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
        {threats.map((t, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-rose-300">{t.type}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{t.ip} — {t.endpoint}</p>
              <p className="text-[10px] text-slate-600 font-mono">{new Date(t.timestamp).toLocaleString()}</p>
            </div>
            <span className={`badge text-[9px] shrink-0 ${
              t.severity === "CRITICAL" ? "badge-error" :
              t.severity === "HIGH" ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" :
              "badge-warn"
            }`}>{t.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserTable({ users = [] }) {
  return (
    <div className="card overflow-hidden p-0 space-y-0">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <Users className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-slate-300">User Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Username</th><th>Email</th><th>Role</th><th>Files</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map((u) => (
              <tr key={u._id}>
                <td className="font-semibold text-slate-200">{u.username}</td>
                <td className="text-slate-400 text-xs">{u.email}</td>
                <td>
                  <span className={`badge text-[10px] ${u.role === "Admin" ? "role-admin" : u.role === "Auditor" ? "role-auditor" : "role-user"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="font-mono text-xs text-slate-400">{u.totalFiles ?? 0}</td>
                <td>
                  <span className={`badge text-[9px] ${u.isBlocked ? "badge-error" : "badge-success"}`}>
                    {u.isBlocked ? <><XCircle className="w-2.5 h-2.5" />Blocked</> : <><CheckCircle2 className="w-2.5 h-2.5" />Active</>}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-500 py-8">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/dashboard/admin");
        setData(res.data);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <DashboardSkeleton />;
  const s = data?.summary || {};

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Admin Control Center</h1>
        <p className="text-sm text-slate-400 mt-1">Full system visibility, user management, and threat response.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total Users"       value={s.totalUsers}         color="bg-cyan-500/15 text-cyan-400"     sub="Registered accounts" />
        <StatCard icon={FolderLock} label="Total Files"      value={s.totalFiles}         color="bg-purple-500/15 text-purple-400"  sub="Platform-wide" />
        <StatCard icon={AlertTriangle} label="IDS Alerts"    value={s.idsThreats}         color="bg-rose-500/15 text-rose-400"     sub="Active threats" />
        <StatCard icon={Database}   label="IPFS Files"       value={s.ipfsPinnedFiles}    color="bg-emerald-500/15 text-emerald-400" sub="Pinned on IPFS" />
      </div>

      {/* Threats + System Health */}
      <div className="grid md:grid-cols-2 gap-4">
        <ThreatFeed threats={s.recentThreats || []} />
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            System Health
          </h3>
          {[
            { label: "Database",          ok: true,          note: "MongoDB Connected" },
            { label: "Encryption Engine", ok: true,          note: "AES-256-CBC Active" },
            { label: "IPFS Node",         ok: s.ipfsOnline,  note: s.ipfsOnline ? "Pinata Connected" : "Using Fallback" },
            { label: "Blockchain RPC",    ok: s.ethOnline,   note: s.ethOnline ? "Ganache/Mainnet Connected" : "Offline — Mock Mode" },
            { label: "IDS Module",        ok: true,          note: `${s.idsThreats ?? 0} alerts active` },
          ].map(({ label, ok, note }) => (
            <div key={label} className="flex items-center gap-3">
              {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">{label}</p>
                <p className="text-[11px] text-slate-500">{note}</p>
              </div>
              <span className={`badge text-[9px] ${ok ? "badge-success" : "badge-warn"}`}>{ok ? "Online" : "Degraded"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Table */}
      <UserTable users={s.users || []} />
    </div>
  );
}
