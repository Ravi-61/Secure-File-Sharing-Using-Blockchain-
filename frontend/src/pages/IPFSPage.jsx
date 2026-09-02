import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import { Database, Search, ExternalLink, CheckCircle2, HardDrive } from "lucide-react";

export default function IPFSPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/files/user-files").then((r) => {
      setFiles((r.data.files || []).filter((f) => f.ipfsCid));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <Database className="w-7 h-7 text-emerald-400" /> IPFS Storage Explorer
        </h1>
        <p className="text-sm text-slate-400 mt-1">Decentralized P2P content-addressed file objects (Pinata Pinning).</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table-base">
          <thead><tr><th>File Name</th><th>IPFS Content ID (CID)</th><th>Pin Status</th><th>Gateway Link</th></tr></thead>
          <tbody>
            {files.map((f) => (
              <tr key={f._id}>
                <td className="font-semibold text-slate-200">{f.originalName}</td>
                <td className="font-mono text-xs text-emerald-400">{f.ipfsCid}</td>
                <td><span className="badge-success text-[10px]">Pinned</span></td>
                <td>
                  <a href={`https://gateway.pinata.cloud/ipfs/${f.ipfsCid}`} target="_blank" rel="noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Open Gateway <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-slate-500">No IPFS pinned files found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
