import React, { useState } from 'react';
import API from '../services/api';
import { Lock, Search, CheckCircle2, AlertTriangle, Shield, ExternalLink, Cpu } from 'lucide-react';

export default function BlockchainPage() {
  const [fileHash, setFileHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!fileHash.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await API.get(`/blockchain/verify-onchain/${fileHash.trim()}`);
      setResult(res.data);
    } catch (err) {
      setError("File verification search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Ethereum EVM Blockchain Explorer</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Verify cryptographic file integrity, owner address, and IPFS CID directly on the smart contract.
        </p>
      </div>

      <form onSubmit={handleVerify} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <label className="block text-xs font-semibold text-slate-300">Enter SHA-256 File Hash</label>
        <div className="flex gap-3">
          <input
            type="text"
            required
            value={fileHash}
            onChange={(e) => setFileHash(e.target.value)}
            placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn px-6 py-3 rounded-xl text-sm flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Verify On-Chain'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>On-Chain Verification Record Found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">File Name:</span>
              <p className="text-slate-200 font-semibold">{result.fileName}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Owner Wallet:</span>
              <p className="text-cyan-300 font-semibold break-all">{result.uploadedBy}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 md:col-span-2">
              <span className="text-slate-400">IPFS CID:</span>
              <p className="text-emerald-300 font-semibold break-all">{result.ipfsCid}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 md:col-span-2">
              <span className="text-slate-400">Blockchain Tx Hash:</span>
              <p className="text-purple-300 font-semibold break-all">{result.blockchainTxHash || "Recorded in Registry"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
