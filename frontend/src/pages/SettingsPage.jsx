import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Settings, Shield, User, Key, Wallet, Bell, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { user, walletAddress, connectWallet } = useContext(AuthContext);
  const [autoIpfs, setAutoIpfs] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 page-enter max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <Settings className="w-7 h-7 text-cyan-400" /> Account & System Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage profile, cryptographic keys, and security preferences.</p>
      </div>

      {saved && (
        <div className="alert-success">
          <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> User Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Username</label>
              <input readOnly value={user?.username || ""} className="input-base cursor-not-allowed opacity-75" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <input readOnly value={user?.email || ""} className="input-base cursor-not-allowed opacity-75" />
            </div>
          </div>
        </div>

        {/* Web3 Wallet Card */}
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" /> Web3 Crypto Wallet
          </h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Ethereum Wallet Connection</p>
              <p className="text-[11px] font-mono text-slate-500">{walletAddress || "No wallet connected"}</p>
            </div>
            <button type="button" onClick={connectWallet} className="gradient-btn-sm text-xs">
              {walletAddress ? "Reconnect" : "Connect Metamask"}
            </button>
          </div>
        </div>

        {/* Security Options */}
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Security Preferences
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-200">Auto-Pin to IPFS Network</p>
                <p className="text-[11px] text-slate-500">Automatically pin encrypted file chunks to IPFS nodes upon upload.</p>
              </div>
              <input type="checkbox" checked={autoIpfs} onChange={(e) => setAutoIpfs(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-200">In-App Security Notifications</p>
                <p className="text-[11px] text-slate-500">Receive alerts when new IDS threats or share link downloads occur.</p>
              </div>
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            </label>
          </div>
        </div>

        <button type="submit" className="gradient-btn px-6 py-3 rounded-xl text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>
    </div>
  );
}
