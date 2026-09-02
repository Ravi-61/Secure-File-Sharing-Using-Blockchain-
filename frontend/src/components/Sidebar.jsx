import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Shield, LayoutDashboard, FolderLock, Share2, Link2,
  Lock, Cpu, Activity, Users, FileSearch, Settings,
  LogOut, ChevronLeft, ChevronRight, Wallet, Menu, X,
  Database, BarChart3, Bell, ShieldAlert
} from "lucide-react";

const NAV = {
  User: [
    { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { to: "/files",       icon: FolderLock,      label: "My Files" },
    { to: "/share",       icon: Share2,           label: "Shared Files" },
    { to: "/blockchain",  icon: Link2,            label: "Blockchain" },
    { to: "/ipfs",        icon: Database,         label: "IPFS Explorer" },
    { to: "/ai-security", icon: Cpu,              label: "AI Security" },
    { to: "/analytics",   icon: BarChart3,        label: "Analytics" },
  ],
  Admin: [
    { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { to: "/files",       icon: FolderLock,      label: "File Manager" },
    { to: "/admin",       icon: Users,           label: "User Control" },
    { to: "/blockchain",  icon: Link2,           label: "Blockchain" },
    { to: "/ipfs",        icon: Database,        label: "IPFS Monitor" },
    { to: "/analytics",   icon: BarChart3,       label: "Analytics" },
    { to: "/ai-security", icon: Cpu,             label: "AI Security" },
    { to: "/security",    icon: ShieldAlert,     label: "Security Center" },
  ],
  Auditor: [
    { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { to: "/security",    icon: ShieldAlert,     label: "Security Center" },
    { to: "/analytics",   icon: BarChart3,       label: "Analytics" },
    { to: "/blockchain",  icon: Link2,           label: "Blockchain" },
    { to: "/ai-security", icon: Cpu,             label: "AI Security" },
  ],
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, walletAddress, connectWallet, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = NAV[user?.role] || NAV.User;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/80 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 shrink-0 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-extrabold text-base tracking-wider gradient-text leading-none">SECUREVAULT</p>
            <p className="text-[9px] font-mono text-slate-500 tracking-widest mt-0.5">AES-256 · IPFS · EVM</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scroll">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: "18px", height: "18px" }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-800/80 p-3 space-y-2">
        {/* Wallet */}
        <button
          onClick={connectWallet}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-cyan-400 bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Connect Wallet" : undefined}
        >
          <Wallet className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Connect Web3"}
            </span>
          )}
        </button>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4.5 h-4.5 shrink-0" style={{ width: "18px", height: "18px" }} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            <span className={`badge text-[10px] ${user.role === "Admin" ? "badge-purple" : user.role === "Auditor" ? "badge-warn" : "badge-info"}`}>
              {user.role}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full sidebar-link text-rose-400 hover:bg-rose-500/10 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" style={{ width: "18px", height: "18px" }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-slate-800/80 lg:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 glass border-r border-slate-800/80 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full glass border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors shadow-lg"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
