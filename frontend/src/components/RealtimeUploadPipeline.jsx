import React, { useState, useCallback } from "react";
import API from "../services/api";
import {
  Upload, Lock, Database, Link2, CheckCircle2, AlertTriangle,
  FileText, X, Clock, Zap
} from "lucide-react";

const STEPS = [
  { id: "uploading",    label: "Uploading File",              icon: Upload,      color: "text-cyan-400" },
  { id: "hashing",      label: "SHA-256 Integrity Hash",      icon: FileText,    color: "text-teal-400" },
  { id: "encrypting",   label: "AES-256 Stream Encryption",   icon: Lock,        color: "text-purple-400" },
  { id: "ipfs",         label: "IPFS Decentralized Pinning",  icon: Database,    color: "text-emerald-400" },
  { id: "blockchain",   label: "Blockchain Registration",     icon: Link2,       color: "text-amber-400" },
  { id: "complete",     label: "Secure Upload Complete",      icon: CheckCircle2, color: "text-emerald-400" },
];

function StepIndicator({ step, currentIdx, stepIdx }) {
  const Icon = step.icon;
  const done = stepIdx < currentIdx;
  const active = stepIdx === currentIdx;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
        done   ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
        active ? "border-cyan-400 bg-cyan-500/10 text-cyan-400 pulse-glow" :
                 "border-slate-700 bg-slate-900 text-slate-600"
      }`}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-colors ${active ? "text-slate-100" : done ? "text-slate-400" : "text-slate-600"}`}>
          {step.label}
        </p>
        {active && (
          <div className="mt-1 progress-bar">
            <div className="progress-fill bg-gradient-to-r from-cyan-500 to-emerald-500 shimmer" style={{ width: "60%" }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function RealtimeUploadPipeline({ onComplete }) {
  const [file, setFile]             = useState(null);
  const [useIpfs, setUseIpfs]       = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [pipeline, setPipeline]     = useState(null); // null = idle
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [uploadSpeed, setUploadSpeed] = useState(null);

  // --- Drag and Drop ---
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) { setFile(dropped); setError(""); setResult(null); }
  }, []);

  const progressTo = (stepId) => {
    const idx = STEPS.findIndex((s) => s.id === stepId);
    setCurrentStep(idx);
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file) return;

    setError("");
    setResult(null);
    setPipeline("running");
    setCurrentStep(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const startTime = Date.now();

      progressTo("hashing");
      await new Promise((r) => setTimeout(r, 400));

      progressTo("encrypting");
      await new Promise((r) => setTimeout(r, 600));

      const endpoint = useIpfs ? "/files/ipfs/upload" : "/files/upload";

      progressTo("ipfs");

      const res = await API.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = e.loaded / elapsed / 1024;
          setUploadSpeed(speed.toFixed(1));
        },
      });

      progressTo("blockchain");
      await new Promise((r) => setTimeout(r, 500));

      progressTo("complete");
      setResult(res.data);
      setPipeline("done");

      if (onComplete) onComplete();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setPipeline(null);
    }
  };

  const reset = () => {
    setFile(null); setPipeline(null); setResult(null);
    setError(""); setCurrentStep(0); setUploadSpeed(null);
  };

  return (
    <div className="card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-400" />
          Secure Upload Pipeline
        </h3>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input type="checkbox" checked={useIpfs} onChange={(e) => setUseIpfs(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 accent-cyan-500"
          />
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          IPFS Pinning
        </label>
      </div>

      {/* Drop Zone */}
      {!pipeline && (
        <div
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-cyan-400 bg-cyan-500/5 scale-[1.01]"
              : "border-slate-700 hover:border-slate-600 bg-slate-900/30 hover:bg-slate-900/50"
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => { setFile(e.target.files?.[0]); setError(""); setResult(null); }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDragging ? "bg-cyan-500/20" : "bg-slate-800"}`}>
              <Upload className={`w-7 h-7 ${isDragging ? "text-cyan-400" : "text-slate-500"}`} />
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="font-semibold text-cyan-300 text-sm">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-300">Drop files here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Automatic AES-256 encryption · SHA-256 hashing · IPFS pin</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Progress */}
      {pipeline && (
        <div className="space-y-4 py-2">
          {STEPS.map((step, idx) => (
            <StepIndicator key={step.id} step={step} stepIdx={idx} currentIdx={currentStep} />
          ))}

          {uploadSpeed && pipeline !== "done" && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Transfer speed: {uploadSpeed} KB/s
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert-error text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/25 space-y-2">
          <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {result.message}
          </p>
          <div className="font-mono text-xs space-y-1 text-slate-400">
            {result.ipfsCid && <p className="break-all"><span className="text-slate-300">CID:</span> {result.ipfsCid}</p>}
            {result.hash && <p className="break-all"><span className="text-slate-300">SHA-256:</span> {result.hash}</p>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!pipeline ? (
          <button
            onClick={handleUpload}
            disabled={!file}
            className="flex-1 py-3 rounded-xl gradient-btn text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Lock className="w-4 h-4" />
            Encrypt & Upload
          </button>
        ) : pipeline === "done" ? (
          <button onClick={reset} className="flex-1 py-3 rounded-xl glass border border-slate-700 hover:border-slate-600 text-sm text-slate-300 hover:text-slate-100 transition-all">
            Upload Another File
          </button>
        ) : null}

        {file && !pipeline && (
          <button onClick={reset} className="p-3 rounded-xl glass border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
