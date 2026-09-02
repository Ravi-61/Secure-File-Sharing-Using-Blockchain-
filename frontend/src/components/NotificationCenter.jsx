import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const ICON_MAP = {
  info:    <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  error:   <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
};

export default function NotificationCenter() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch (_) {}
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read/all");
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl glass border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 glass border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                Notifications
                {unread > 0 && <span className="badge-error text-[10px] px-1.5 py-0.5">{unread}</span>}
              </h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto custom-scroll divide-y divide-slate-800/50">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-900/40 transition-colors ${!n.isRead ? "bg-cyan-500/5" : ""}`}
                  >
                    {ICON_MAP[n.type]}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${!n.isRead ? "text-slate-100" : "text-slate-300"}`}>{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1 font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
