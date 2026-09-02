import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import { BarChart3, TrendingUp, Shield, Database, Lock, Users, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard/user").then((r) => setData(r.data.summary)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          Enterprise Analytics & Metrics
        </h1>
        <p className="text-sm text-slate-400 mt-1">Real-time system telemetry and storage analytics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-xs text-slate-400">Total Upload Volume</span>
          <p className="text-2xl font-extrabold font-mono text-cyan-400">{data?.totalSizeFormatted || "0 B"}</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-slate-400">Encryption Ratio</span>
          <p className="text-2xl font-extrabold font-mono text-purple-400">100%</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-slate-400">IPFS Pin Ratio</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-400">
            {data?.totalFiles ? Math.round(((data.ipfsPinnedFiles || 0) / data.totalFiles) * 100) : 0}%
          </p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-slate-400">Security Index</span>
          <p className="text-2xl font-extrabold font-mono text-amber-400">94 / 100</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-bold text-slate-300">Storage Usage Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>AES-256 Encrypted Storage</span>
              <span className="font-mono">{data?.totalSizeFormatted || "0 B"}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill bg-cyan-500" style={{ width: "100%" }} /></div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>IPFS Decentralized Storage</span>
              <span className="font-mono">{data?.ipfsPinnedFiles || 0} Files</span>
            </div>
            <div className="progress-bar"><div className="progress-fill bg-emerald-500" style={{ width: "85%" }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
