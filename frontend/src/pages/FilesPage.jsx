import React, { useEffect, useState, useContext, useCallback } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import RealtimeUploadPipeline from "../components/RealtimeUploadPipeline";
import FileTimelineDrawer from "../components/FileTimelineDrawer";
import { DashboardSkeleton, TableRowSkeleton } from "../components/SkeletonLoaders";
import {
  FolderLock, Lock, Database, Share2, Star, StarOff, Trash2,
  RotateCcw, Clock, CheckCircle2, AlertCircle, Search, Filter,
  Heart, Download, Eye, MoreVertical, Grid, List, Shield
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card glass-hover">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-extrabold font-mono text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function FileCard({ file, onFav, onTrash, onTimeline, onShare }) {
  const mimeIcon = file.mimeType?.startsWith("image/") ? "🖼️" :
                   file.mimeType?.includes("pdf") ? "📄" :
                   file.mimeType?.includes("video") ? "🎬" :
                   file.mimeType?.includes("audio") ? "🎵" : "📁";

  return (
    <div className="glass-hover rounded-2xl p-4 border border-slate-800 group space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl">{mimeIcon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{file.originalName}</p>
            <p className="text-xs text-slate-500 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onFav(file._id)} title="Favorite" className="p-1.5 rounded-lg hover:bg-amber-500/15 text-slate-500 hover:text-amber-400 transition-colors">
            {file.isFavorite ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Star className="w-4 h-4" />}
          </button>
          <button onClick={() => onTimeline(file)} title="Timeline" className="p-1.5 rounded-lg hover:bg-cyan-500/15 text-slate-500 hover:text-cyan-400 transition-colors">
            <Clock className="w-4 h-4" />
          </button>
          <button onClick={() => onShare(file._id)} title="Share" className="p-1.5 rounded-lg hover:bg-purple-500/15 text-slate-500 hover:text-purple-400 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={() => onTrash(file._id)} title="Move to Trash" className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {file.isEncrypted && <span className="badge-info text-[10px]"><Lock className="w-3 h-3" />AES-256</span>}
        {file.ipfsCid && <span className="badge-success text-[10px]"><Database className="w-3 h-3" />IPFS</span>}
        {file.isOnChain && <span className="badge-warn text-[10px]"><Shield className="w-3 h-3" />On-Chain</span>}
      </div>

      <p className="text-[10px] font-mono text-slate-600 truncate" title={file.hash}>
        SHA-256: {file.hash}
      </p>
    </div>
  );
}

export default function FilesPage() {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all"); // all | favorites | trash
  const [search, setSearch] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [timeline, setTimeline] = useState(null); // { fileId, fileName }
  const [shareUrl, setShareUrl] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "trash") params.set("isTrashed", "true");
      else params.set("isTrashed", "false");
      if (filter === "favorites") params.set("isFavorite", "true");

      const [filesRes, dashRes] = await Promise.all([
        API.get(`/files/user-files?${params.toString()}`),
        API.get("/dashboard/user"),
      ]);

      setFiles(filesRes.data.files || []);
      setDashboard(dashRes.data.summary);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleFav = async (id) => {
    try {
      await API.patch(`/files/${id}/favorite`);
      fetchFiles();
    } catch (_) {}
  };

  const handleTrash = async (id) => {
    if (filter === "trash") {
      if (!window.confirm("Permanently delete this file?")) return;
      await API.delete(`/files/${id}`);
    } else {
      await API.patch(`/files/${id}/trash`);
    }
    fetchFiles();
  };

  const handleRestore = async (id) => {
    await API.patch(`/files/${id}/restore`);
    fetchFiles();
  };

  const handleShare = async (id) => {
    try {
      const res = await API.post("/share/create", { fileId: id, expiryHours: 24 });
      setShareUrl(res.data.shareUrl);
    } catch (_) { alert("Failed to create share link"); }
  };

  const filteredFiles = files.filter((f) =>
    f.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Stats Bar */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FolderLock} label="Total Files" value={dashboard.totalFiles}  color="bg-cyan-500/15 text-cyan-400" sub="All time uploads" />
          <StatCard icon={Database}   label="Storage Used" value={dashboard.totalSizeFormatted} color="bg-emerald-500/15 text-emerald-400" sub="Encrypted on IPFS" />
          <StatCard icon={Lock}       label="Encrypted" value={dashboard.encryptedFiles} color="bg-purple-500/15 text-purple-400" sub="AES-256 protected" />
          <StatCard icon={Share2}     label="Shared Links" value={dashboard.activeShareLinks} color="bg-amber-500/15 text-amber-400" sub="Active links" />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 glass rounded-xl p-1 border border-slate-800 shrink-0">
          {[["all","All Files"],["favorites","Favorites"],["trash","Trash"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === key ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/25" : "text-slate-400 hover:text-slate-200"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="input-base pl-10 py-2 text-xs"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 glass rounded-xl p-1 border border-slate-800 shrink-0">
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}><List className="w-4 h-4" /></button>
        </div>

        {/* Upload Button */}
        <button onClick={() => setShowUpload(!showUpload)}
          className="gradient-btn-sm flex items-center gap-2 shrink-0"
        >
          <Lock className="w-3.5 h-3.5" />
          {showUpload ? "Hide Upload" : "Upload File"}
        </button>
      </div>

      {/* Upload Panel */}
      {showUpload && <RealtimeUploadPipeline onComplete={() => { fetchFiles(); setShowUpload(false); }} />}

      {/* Share URL Alert */}
      {shareUrl && (
        <div className="alert-info">
          <Share2 className="w-4 h-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-1">Share Link Generated!</p>
            <input readOnly value={shareUrl} className="w-full text-xs font-mono bg-transparent border-0 outline-none text-cyan-300 truncate" onClick={(e) => e.target.select()} />
          </div>
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); }} className="text-xs text-cyan-300 hover:text-cyan-100 shrink-0">Copy</button>
          <button onClick={() => setShareUrl(null)} className="text-slate-400 hover:text-slate-200 shrink-0">✕</button>
        </div>
      )}

      {/* Files */}
      {loading ? (
        <div className={view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
          {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton rounded-2xl h-32" />)}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <FolderLock className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold text-slate-400">
            {filter === "trash" ? "Trash is empty" : filter === "favorites" ? "No favorites yet" : "No files found"}
          </p>
          <p className="text-sm mt-1">
            {filter === "all" && !search && "Upload your first encrypted file using the button above."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div key={file._id} className="relative group">
              <FileCard
                file={file}
                onFav={handleFav}
                onTrash={handleTrash}
                onTimeline={(f) => setTimeline({ fileId: f._id, fileName: f.originalName })}
                onShare={handleShare}
              />
              {filter === "trash" && (
                <button onClick={() => handleRestore(file._id)}
                  className="mt-2 w-full py-1.5 rounded-lg glass border border-slate-700 text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div className="card overflow-hidden p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Hash (SHA-256)</th>
                <th>IPFS</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file._id}>
                  <td className="font-semibold text-slate-200 max-w-[200px] truncate">{file.originalName}</td>
                  <td className="font-mono text-slate-400 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                  <td className="font-mono text-xs text-slate-500 max-w-[120px] truncate" title={file.hash}>{file.hash}</td>
                  <td>{file.ipfsCid ? <span className="badge-success text-[10px]">Pinned</span> : <span className="text-slate-600 text-xs">Local</span>}</td>
                  <td className="text-right space-x-1">
                    <button onClick={() => handleFav(file._id)} className="p-1.5 rounded-lg hover:bg-amber-500/15 text-slate-500 hover:text-amber-400 transition-colors">
                      <Star className={`w-3.5 h-3.5 ${file.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <button onClick={() => setTimeline({ fileId: file._id, fileName: file.originalName })} className="p-1.5 rounded-lg hover:bg-cyan-500/15 text-slate-500 hover:text-cyan-400 transition-colors">
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleShare(file._id)} className="p-1.5 rounded-lg hover:bg-purple-500/15 text-slate-500 hover:text-purple-400 transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleTrash(file._id)} className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Drawer */}
      {timeline && (
        <FileTimelineDrawer
          fileId={timeline.fileId}
          fileName={timeline.fileName}
          onClose={() => setTimeline(null)}
        />
      )}
    </div>
  );
}
