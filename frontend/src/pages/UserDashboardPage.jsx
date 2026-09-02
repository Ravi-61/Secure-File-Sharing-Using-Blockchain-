import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import FileUploader from '../components/FileUploader';
import { Shield, FileText, Database, Share2, Lock, Trash2, CheckCircle2, Download, ExternalLink } from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModalToken, setShareModalToken] = useState(null);

  const fetchDashboard = async () => {
    try {
      const [dashRes, filesRes] = await Promise.all([
        API.get('/dashboard/user'),
        API.get('/files/user-files'),
      ]);
      setDashboardData(dashRes.data);
      setFiles(filesRes.data.files);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await API.delete(`/files/${id}`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleGenerateShareLink = async (fileId) => {
    try {
      const res = await API.post('/share/create', { fileId, expiryHours: 24 });
      setShareModalToken(res.data.shareUrl);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create share link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome, {user?.username || 'User'}</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Role: {user?.role} • Status: Active</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AES-256 System Active
          </span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            Total Uploads
          </div>
          <p className="text-2xl font-extrabold font-mono text-cyan-300">{summary.totalFiles || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-400" />
            Storage Used
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-300">{summary.totalSizeFormatted || '0.00 MB'}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-400" />
            AES-256 Encrypted
          </div>
          <p className="text-2xl font-extrabold font-mono text-purple-300">{summary.encryptedFiles || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-amber-400" />
            Active Share Links
          </div>
          <p className="text-2xl font-extrabold font-mono text-amber-300">{summary.activeShareLinks || 0}</p>
        </div>
      </div>

      {/* File Upload Component */}
      <FileUploader onUploadComplete={fetchDashboard} />

      {/* Share Modal Alert */}
      {shareModalToken && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-cyan-300 font-bold text-sm">
            <span>Encrypted Share Link Generated!</span>
            <button onClick={() => setShareModalToken(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <input
            type="text"
            readOnly
            value={shareModalToken}
            className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
          />
        </div>
      )}

      {/* Files Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          My Encrypted Files
        </h3>

        {files.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">SHA-256 Hash</th>
                  <th className="p-3">IPFS CID</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {files.map((file) => (
                  <tr key={file._id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-200">{file.originalName}</td>
                    <td className="p-3">{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="p-3 truncate max-w-[150px] text-slate-400" title={file.hash}>{file.hash}</td>
                    <td className="p-3 truncate max-w-[150px] text-cyan-400">
                      {file.ipfsCid ? file.ipfsCid : <span className="text-slate-600">Local Only</span>}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleGenerateShareLink(file._id)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        title="Generate Share Link"
                      >
                        <Share2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
