import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  Upload, Lock, CheckCircle2, Share2, Download,
  Trash2, Shield, Clock
} from "lucide-react";

const ACTION_MAP = {
  UPLOADED:                  { label: "File Uploaded",              color: "bg-cyan-500",    icon: "📤" },
  ENCRYPTED_AND_IPFS_PINNED: { label: "Encrypted & IPFS Pinned",   color: "bg-emerald-500", icon: "🔐" },
  INTEGRITY_VERIFIED:        { label: "Integrity Verified",         color: "bg-teal-500",    icon: "✅" },
  SHARED:                    { label: "Share Link Generated",       color: "bg-purple-500",  icon: "🔗" },
  DOWNLOADED:                { label: "File Downloaded",            color: "bg-amber-500",   icon: "📥" },
  BLOCKCHAIN_REGISTERED:     { label: "Blockchain Registered",      color: "bg-orange-500",  icon: "⛓️" },
  PERMANENTLY_DELETED:       { label: "Permanently Deleted",        color: "bg-rose-500",    icon: "🗑️" },
};

export default function FileTimelineDrawer({ fileId, fileName, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileId) return;
    const fetch = async () => {
      try {
        const res = await API.get(`/files/${fileId}/timeline`);
        setTimeline(res.data.timeline || []);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetch();
  }, [fileId]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass border-l border-slate-800 animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100">Activity Timeline</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{fileName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            ✕
          </button>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-2 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No timeline events yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-slate-700 to-transparent" />

              <div className="space-y-6 pl-12">
                {timeline.map((event, idx) => {
                  const meta = ACTION_MAP[event.action] || { label: event.action, color: "bg-slate-500", icon: "📌" };
                  return (
                    <div key={event._id || idx} className="relative group">
                      {/* Dot */}
                      <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${meta.color}`}>
                        <span className="text-[8px]">{meta.icon}</span>
                      </div>

                      <div className="glass rounded-xl p-4 border border-slate-800 group-hover:border-slate-700 transition-colors space-y-1">
                        <p className="text-sm font-semibold text-slate-200">{meta.label}</p>
                        {event.actor && (
                          <p className="text-xs text-slate-400">by <span className="text-cyan-400">{event.actor}</span></p>
                        )}
                        {event.details && Object.keys(event.details).length > 0 && (
                          <div className="text-[11px] font-mono text-slate-500 break-all mt-1">
                            {Object.entries(event.details).map(([k, v]) => (
                              <span key={k} className="block">
                                <span className="text-slate-400">{k}:</span> {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-600 font-mono">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
