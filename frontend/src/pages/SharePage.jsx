import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Share2, Copy, QrCode, Trash2, CheckCircle2, Clock } from "lucide-react";

export default function SharePage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    API.get("/share/my-links").then((r) => setLinks(r.data.links || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const revoke = async (id) => {
    await API.delete(`/share/${id}`).catch(() => {});
    setLinks((prev) => prev.filter((l) => l._id !== id));
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <Share2 className="w-7 h-7 text-purple-400" />Shared Links
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage encrypted share links with expiry controls.</p>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="table-base">
          <thead><tr><th>File</th><th>Share URL</th><th>Expires</th><th>Downloads</th><th>Actions</th></tr></thead>
          <tbody>
            {links.map((l) => (
              <tr key={l._id}>
                <td className="font-semibold text-slate-200 max-w-[150px] truncate">{l.fileName}</td>
                <td className="max-w-[200px] truncate font-mono text-xs text-cyan-400">{l.shareUrl}</td>
                <td className="text-xs font-mono text-slate-400">
                  {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : "Never"}
                </td>
                <td className="font-mono text-slate-400 text-xs">{l.downloadCount ?? 0}</td>
                <td className="flex items-center gap-2">
                  <button onClick={() => copy(l.shareUrl, l._id)} className="p-1.5 rounded-lg hover:bg-cyan-500/15 text-slate-400 hover:text-cyan-400 transition-colors">
                    {copied === l._id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => revoke(l._id)} className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {links.length === 0 && !loading && (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No active share links</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
