import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import { Link2, Search, CheckCircle2, ExternalLink, Shield } from "lucide-react";

export default function BlockchainExplorer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/blockchain/my-records");
        setRecords(res.data.records || []);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const verify = async (hash) => {
    try {
      const res = await API.post("/blockchain/verify", { hash });
      setDetails(res.data);
    } catch (e) {
      alert("Verification failed: " + (e.response?.data?.message || e.message));
    }
  };

  const filtered = records.filter(
    (r) => r.fileName?.toLowerCase().includes(search.toLowerCase()) || r.hash?.includes(search)
  );

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <Link2 className="w-7 h-7 text-amber-400" />
          Blockchain Explorer
        </h1>
        <p className="text-sm text-slate-400 mt-1">Immutable file registry — verified on Ethereum smart contract.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by file name or SHA-256 hash..."
          className="input-base pl-10"
        />
      </div>

      {/* Details Panel */}
      {details && (
        <div className="card border-emerald-500/25 bg-emerald-500/5 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Blockchain Verification Result
          </h3>
          <div className="grid md:grid-cols-2 gap-3 font-mono text-xs">
            {Object.entries(details.record || {}).map(([k, v]) => (
              <div key={k} className="space-y-0.5">
                <p className="text-slate-500 uppercase text-[10px] tracking-wider">{k}</p>
                <p className="text-slate-200 break-all">{String(v)}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setDetails(null)} className="text-xs text-slate-400 hover:text-slate-200">Dismiss</button>
        </div>
      )}

      {/* Table */}
      {loading ? <DashboardSkeleton /> : (
        <div className="card overflow-hidden p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>File Name</th>
                <th>SHA-256 Hash</th>
                <th>IPFS CID</th>
                <th>Tx Hash</th>
                <th>Block</th>
                <th>Registered</th>
                <th className="text-right">Verify</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec, i) => (
                <tr key={rec._id || i}>
                  <td className="font-semibold text-slate-200 max-w-[140px] truncate">{rec.fileName}</td>
                  <td className="font-mono text-xs text-slate-400 max-w-[120px] truncate" title={rec.hash}>{rec.hash?.slice(0, 12)}…</td>
                  <td className="font-mono text-xs text-emerald-400 max-w-[100px] truncate" title={rec.ipfsCid}>{rec.ipfsCid?.slice(0, 12) || "—"}…</td>
                  <td className="font-mono text-xs text-amber-400 max-w-[100px] truncate" title={rec.txHash}>{rec.txHash?.slice(0, 10) || "—"}…</td>
                  <td className="font-mono text-xs text-slate-400">{rec.blockNumber ?? "—"}</td>
                  <td className="text-xs text-slate-500 font-mono">{rec.registeredAt ? new Date(rec.registeredAt).toLocaleDateString() : "—"}</td>
                  <td className="text-right">
                    <button onClick={() => verify(rec.hash)}
                      className="px-2.5 py-1 rounded-lg text-[11px] glass border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Shield className="w-3 h-3" /> Verify
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                  <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No blockchain records found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
