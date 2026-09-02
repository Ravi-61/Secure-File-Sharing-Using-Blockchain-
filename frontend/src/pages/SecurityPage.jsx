import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export default function SecurityPage() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard/admin").then((r) => {
      setThreats(r.data.summary?.recentThreats || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-rose-400" /> Security & Auditor Suite
        </h1>
        <p className="text-sm text-slate-400 mt-1">Real-time Intrusion Detection System (IDS) alerts and compliance audit logs.</p>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" /> Active Threat Event Log ({threats.length})
        </h3>
        {threats.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-emerald-400 opacity-60" />
            <p>No active security threats logged</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threats.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{t.type}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{t.ip} — {t.endpoint}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge-error text-[9px]">{t.severity}</span>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">{new Date(t.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
