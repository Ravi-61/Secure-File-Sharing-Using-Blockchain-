import React, { useState } from 'react';
import API from '../services/api';
import { Upload, Lock, Database, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function FileUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [useIpfs, setUseIpfs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setStatus('Initializing AES-256 encryption stream...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = useIpfs ? '/files/ipfs/upload' : '/files/upload';
      
      setStatus(useIpfs ? 'Encrypting & Pinning to IPFS Network...' : 'Calculating SHA-256 file hash...');

      const res = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      setStatus('Upload Complete!');
      setFile(null);

      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          Secure File Upload
        </h3>
        <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={useIpfs}
            onChange={(e) => setUseIpfs(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
          />
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          Enable IPFS Pinning
        </label>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-8 text-center transition-all bg-slate-900/40 relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            {file ? (
              <div>
                <p className="text-sm font-semibold text-cyan-300">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-300 font-medium">Drag & drop files here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Automatic AES-256 Stream Encryption & SHA-256 Hashing</p>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-cyan-300">{status}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 font-mono">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.message}</span>
            </div>
            {result.ipfsCid && (
              <p className="break-all">
                <strong className="text-slate-300">IPFS CID:</strong> {result.ipfsCid}
              </p>
            )}
            {result.hash && (
              <p className="break-all">
                <strong className="text-slate-300">SHA-256:</strong> {result.hash}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-3 rounded-xl gradient-btn text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Encrypt & Upload File
        </button>
      </form>
    </div>
  );
}
