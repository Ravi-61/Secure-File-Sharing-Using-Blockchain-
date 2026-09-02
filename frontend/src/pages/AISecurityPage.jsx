import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import {
  Cpu, Shield, ShieldOff, ShieldCheck, ShieldAlert,
  Lock, Database, Link2, TrendingUp, AlertCircle, Zap
} from "lucide-react";

function SecurityMeter({ score = 0, label = "", color = "from-cyan-500 to-teal-400" }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-bold text-slate-200">{score}%</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill bg-gradient-to-r ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function AISecurityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/ai/recommendations").then((r) => {
      setData(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const score = data?.overallSecurityScore ?? 72;
  const recs = data?.recommendations || [];
  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <Cpu className="w-7 h-7 text-purple-400" />
          AI Security Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time threat analysis, security scoring, and AI-driven recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Main Score */}
        <div className="md:col-span-1 card text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${score * 2.513} 251.3`}
                style={{ transition: "stroke-dasharray 1.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-extrabold font-mono text-slate-100">{score}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
          </div>
          <div>
            <p className={`text-xl font-bold ${score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
              {score >= 80 ? "Excellent" : score >= 60 ? "Moderate Risk" : "High Risk"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Overall Security Score</p>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="md:col-span-2 card space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Security Metric Breakdown
          </h3>
          <SecurityMeter label="Encryption Coverage"  score={metrics.encryptionCoverage ?? 85}  color="from-purple-500 to-cyan-400" />
          <SecurityMeter label="IPFS Storage Adoption" score={metrics.ipfsCoverage ?? 70}       color="from-emerald-500 to-teal-400" />
          <SecurityMeter label="Blockchain Registration" score={metrics.chainCoverage ?? 45}    color="from-amber-500 to-yellow-400" />
          <SecurityMeter label="Password Strength"     score={metrics.passwordStrength ?? 80}    color="from-cyan-500 to-blue-400" />
          <SecurityMeter label="Active Threat Level"   score={100 - (metrics.threatLevel ?? 10)} color="from-rose-500 to-red-400" />
        </div>
      </div>

      {/* Recommendations */}
      <div className="card space-y-4">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          AI Recommendations ({recs.length})
        </h3>
        {recs.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-emerald-400 opacity-50" />
            <p>All systems secure — no recommendations at this time</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {recs.map((r, i) => (
              <div key={i} className={`p-4 rounded-xl border space-y-2 ${
                r.severity === "CRITICAL" ? "bg-rose-500/8 border-rose-500/25" :
                r.severity === "HIGH"     ? "bg-orange-500/8 border-orange-500/25" :
                r.severity === "MEDIUM"   ? "bg-amber-500/8 border-amber-500/25" :
                                            "bg-cyan-500/8 border-cyan-500/25"
              }`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-200">{r.recommendation}</p>
                  <span className={`badge text-[9px] shrink-0 ml-2 ${
                    r.severity === "CRITICAL" ? "badge-error" :
                    r.severity === "HIGH"     ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" :
                    r.severity === "MEDIUM"   ? "badge-warn" : "badge-info"
                  }`}>{r.severity}</span>
                </div>
                {r.action && <p className="text-[11px] text-slate-400">{r.action}</p>}
                {r.category && <p className="text-[10px] font-mono text-slate-600 uppercase">{r.category}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
