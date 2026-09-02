import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import {
  FolderLock, Lock, Database, Share2, Activity, Shield,
  TrendingUp, Users, AlertTriangle, CheckCircle2, Cpu,
  BarChart3, ArrowUpRight, Zap, Clock
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, delta, to }) {
  return (
    <div className="stat-card glass-hover group">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta !== undefined && (
          <span className={`badge text-[10px] ${delta >= 0 ? "badge-success" : "badge-error"}`}>
            <TrendingUp className="w-2.5 h-2.5" />
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold font-mono text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function SecurityScoreMeter({ score = 0 }) {
  const clamp = Math.min(100, Math.max(0, score));
  const color = clamp >= 80 ? "from-emerald-500 to-teal-400" :
                clamp >= 60 ? "from-amber-500 to-yellow-400" :
                              "from-rose-500 to-red-400";
  const label = clamp >= 80 ? "Excellent" : clamp >= 60 ? "Moderate" : "At Risk";

  return (
    <div className="card space-y-4">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
        <Shield className="w-4 h-4 text-cyan-400" />
        Security Health Score
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${clamp * 2.513} 251.3`}
              style={{ transition: "stroke-dasharray 1.2s ease" }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={clamp >= 80 ? "#10b981" : clamp >= 60 ? "#f59e0b" : "#ef4444"} />
                <stop offset="100%" stopColor={clamp >= 80 ? "#06b6d4" : clamp >= 60 ? "#eab308" : "#f87171"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-xl font-extrabold font-mono text-slate-100">{clamp}</span>
              <span className="block text-[9px] text-slate-500">/ 100</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <p className={`font-bold text-lg ${clamp >= 80 ? "text-emerald-400" : clamp >= 60 ? "text-amber-400" : "text-rose-400"}`}>
            {label}
          </p>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              AES-256 Encryption Active
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              IPFS Decentralized Storage
            </div>
            <div className="flex items-center gap-2">
              {clamp >= 80
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              Blockchain Registration
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIRecommendations({ recommendations = [] }) {
  if (!recommendations.length) return null;
  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-purple-400" />
        AI Security Recommendations
      </h3>
      <div className="space-y-2">
        {recommendations.slice(0, 4).map((rec, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
              rec.severity === "CRITICAL" ? "bg-rose-500" :
              rec.severity === "HIGH" ? "bg-orange-500" :
              rec.severity === "MEDIUM" ? "bg-amber-500" : "bg-cyan-400"
            }`} />
            <div>
              <p className="text-xs font-semibold text-slate-200">{rec.recommendation}</p>
              {rec.action && <p className="text-[11px] text-slate-500 mt-0.5">{rec.action}</p>}
            </div>
            <span className={`badge text-[9px] shrink-0 ml-auto ${
              rec.severity === "CRITICAL" ? "badge-error" :
              rec.severity === "HIGH" ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" :
              rec.severity === "MEDIUM" ? "badge-warn" : "badge-info"
            }`}>{rec.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ files = [] }) {
  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        Recent Activity
      </h3>
      <div className="space-y-2">
        {files.slice(0, 6).map((file) => (
          <div key={file._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm shrink-0">
              {file.mimeType?.startsWith("image/") ? "🖼️" :
               file.mimeType?.includes("pdf") ? "📄" : "📁"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{file.originalName}</p>
              <p className="text-[10px] text-slate-500 font-mono">{(file.size / (1024*1024)).toFixed(2)} MB</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {file.isEncrypted && <span className="badge-info text-[9px]"><Lock className="w-2.5 h-2.5" />AES</span>}
              {file.ipfsCid && <span className="badge-success text-[9px]">IPFS</span>}
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No recent file activity</p>
        )}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, aiRes] = await Promise.all([
          API.get("/dashboard/user"),
          API.get("/ai/recommendations"),
        ]);
        setData(dashRes.data);
        setAi(aiRes.data);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const s = data?.summary || {};
  const score = ai?.overallSecurityScore ?? 75;

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">
          Welcome back, <span className="gradient-text">{user?.username}</span> 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your secure file vault is protected and operational.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FolderLock} label="Total Files"   value={s.totalFiles ?? 0}            color="bg-cyan-500/15 text-cyan-400"    delta={12} />
        <StatCard icon={Lock}       label="Encrypted"     value={s.encryptedFiles ?? 0}         color="bg-purple-500/15 text-purple-400" delta={5}  />
        <StatCard icon={Database}   label="IPFS Pinned"   value={s.ipfsPinnedFiles ?? 0}        color="bg-emerald-500/15 text-emerald-400" delta={8} />
        <StatCard icon={Share2}     label="Active Links"  value={s.activeShareLinks ?? 0}       color="bg-amber-500/15 text-amber-400"   delta={-2} />
      </div>

      {/* Middle: Security Score + AI Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        <SecurityScoreMeter score={score} />
        <AIRecommendations recommendations={ai?.recommendations || []} />
      </div>

      {/* Bottom: Recent Activity + Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RecentActivity files={s.recentFiles || []} />
        </div>
        <div className="card space-y-3">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Upload File",      href: "/files",      icon: FolderLock, color: "text-cyan-400 bg-cyan-500/10"    },
              { label: "View Blockchain",  href: "/blockchain",  icon: BarChart3,  color: "text-amber-400 bg-amber-500/10"  },
              { label: "AI Security",      href: "/ai-security", icon: Cpu,        color: "text-purple-400 bg-purple-500/10" },
              { label: "Analytics",        href: "/analytics",   icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10" },
            ].map(({ label, href, icon: Icon, color }) => (
              <a key={label} href={href}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl ${color} border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02] text-center`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
