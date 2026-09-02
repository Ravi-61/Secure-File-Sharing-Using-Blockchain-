import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldAlert, ShieldCheck, Cpu } from 'lucide-react';

export default function AISecurityMeter({ password }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await API.post('/ai/analyze-password', { password });
        setAnalysis(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [password]);

  if (!password || !analysis) return null;

  const getMeterColor = (score) => {
    if (score >= 80) return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-cyan-500 text-cyan-400 border-cyan-500/30';
    if (score >= 40) return 'bg-amber-500 text-amber-400 border-amber-500/30';
    return 'bg-rose-500 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-purple-400" />
          AI Security Password Meter
        </span>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getMeterColor(analysis.score)}`}>
          {analysis.rating} ({analysis.score}/100)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getMeterColor(analysis.score).split(' ')[0]}`}
          style={{ width: `${analysis.score}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Entropy: {analysis.entropyBits} bits</span>
        <span>AI Risk Assessment Passed</span>
      </div>

      {analysis.feedback && analysis.feedback.length > 0 && (
        <ul className="text-xs space-y-1 text-slate-400 border-t border-slate-800/80 pt-2">
          {analysis.feedback.map((tip, idx) => (
            <li key={idx} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
