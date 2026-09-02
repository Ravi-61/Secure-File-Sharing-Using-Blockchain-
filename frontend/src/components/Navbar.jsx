import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Wallet, LogOut, User, Lock, Activity, Cpu } from 'lucide-react';

export default function Navbar() {
  const { user, walletAddress, connectWallet, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider gradient-text">SECURESHARE</span>
            <span className="block text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest">AES-256 • IPFS • EVM</span>
          </div>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Dashboard
            </Link>
            <Link to="/blockchain" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Blockchain
            </Link>
            <Link to="/ai-security" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              AI Security
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Wallet Button */}
              <button
                onClick={handleConnectWallet}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 'Connect Web3'}
              </button>

              {/* Role Badge */}
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                user.role === 'Auditor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {user.role || 'User'}
              </span>

              {/* User Dropdown / Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="gradient-btn px-4 py-2 rounded-xl text-sm shadow-md">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
