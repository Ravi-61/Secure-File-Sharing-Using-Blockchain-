import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router, Routes, Route, Navigate, Outlet
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import NotificationCenter from "./components/NotificationCenter";
import AIChatAssistant from "./components/AIChatAssistant";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";

// App Pages
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FilesPage from "./pages/FilesPage";
import BlockchainExplorer from "./pages/BlockchainExplorer";
import AISecurityPage from "./pages/AISecurityPage";

// Lazy stubs for remaining pages (can be built out later)
const SharePage      = React.lazy(() => import("./pages/SharePage"));
const AnalyticsPage  = React.lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage   = React.lazy(() => import("./pages/SettingsPage"));
const SecurityPage   = React.lazy(() => import("./pages/SecurityPage"));
const IPFSPage       = React.lazy(() => import("./pages/IPFSPage"));
const AdminPage      = React.lazy(() => import("./pages/AdminPage"));

// ===========================
// Protected Route HOC
// ===========================
function ProtectedRoute({ roles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Authenticating…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// ===========================
// App Shell (Sidebar + Header)
// ===========================
function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-60"} flex flex-col min-h-screen`}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 glass border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile spacer for hamburger */}
            <div className="w-10 lg:hidden" />
            <div>
              <h2 className="text-sm font-bold text-slate-200 hidden sm:block">
                {user?.role === "Admin" ? "Admin Control Center" :
                 user?.role === "Auditor" ? "Security Audit Suite" :
                 "SecureVault Dashboard"}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono hidden sm:block">AES-256 · IPFS · Ethereum · AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-slate-950 font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <React.Suspense fallback={<div className="text-slate-400 text-sm text-center py-20">Loading…</div>}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <AIChatAssistant />
    </div>
  );
}

// ===========================
// Role-Based Dashboard Router
// ===========================
function DashboardRouter() {
  const { user } = useContext(AuthContext);
  if (user?.role === "Admin") return <AdminDashboard />;
  return <UserDashboard />;
}

// ===========================
// App Root
// ===========================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard"   element={<DashboardRouter />} />
            <Route path="/files"       element={<FilesPage />} />
            <Route path="/blockchain"  element={<BlockchainExplorer />} />
            <Route path="/ai-security" element={<AISecurityPage />} />
            <Route path="/share"       element={<SharePage />} />
            <Route path="/analytics"   element={<AnalyticsPage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="/ipfs"        element={<IPFSPage />} />

            {/* Admin + Auditor Only */}
            <Route element={<ProtectedRoute roles={["Admin","Auditor"]} />}>
              <Route path="/security" element={<SecurityPage />} />
            </Route>

            {/* Admin Only */}
            <Route element={<ProtectedRoute roles={["Admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
