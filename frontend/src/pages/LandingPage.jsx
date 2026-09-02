import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Database, Cpu, CheckCircle2, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
          <Shield className="w-3.5 h-3.5" />
          Enterprise Blockchain & Cybersecurity Architecture
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Decentralized Secure File Sharing with <span className="gradient-text">AES-256 & Smart Contracts</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Zero-trust file encryption, IPFS storage, SHA-256 cryptographic verification, EVM smart contracts, role-based access control, and AI threat detection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/register" className="gradient-btn px-8 py-4 rounded-xl text-base shadow-xl flex items-center gap-2">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-xl text-base font-semibold glass-panel hover:bg-slate-800 transition-all border border-slate-700">
            Sign In to Portal
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">AES-256 Stream Encryption</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Automatic end-to-end symmetric stream encryption before files ever leave your system, removing unencrypted disk residue.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">IPFS & Hardhat Smart Contracts</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Content-addressed IPFS CID storage paired with Ethereum EVM smart contracts for tamper-proof audit trails and access control.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">AI Threat Detection & IDS</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Real-time Intrusion Detection System (IDS) monitoring SQLi/XSS threats alongside AI entropy password analysis and file risk scores.
          </p>
        </div>
      </section>
    </div>
  );
}
