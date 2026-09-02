import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, Shield, Database, Activity, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([
        API.get('/dashboard/admin'),
        API.get('/admin/users'),
      ]);
      setData(dashRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await API.patch(`/admin/users/${userId}`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userStats = data?.userStats || {};
  const storageStats = data?.storageStats || {};

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-purple-300">Admin Control Center</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">System-wide Role Management & Infrastructure Controls</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono">
          System Admin Privileges
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            Total Registered Users
          </div>
          <p className="text-2xl font-extrabold font-mono text-purple-300">{userStats.totalUsers || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-400" />
            Total Files Stored
          </div>
          <p className="text-2xl font-extrabold font-mono text-cyan-300">{storageStats.totalFiles || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Total System Storage
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-300">{storageStats.totalSizeFormatted || '0 MB'}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            IDS Security Alerts
          </div>
          <p className="text-2xl font-extrabold font-mono text-rose-300">{data?.securityStats?.totalThreatsLogged || 0}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          User Account & Role Management
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-200">{u.username}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-cyan-300"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleUpdateStatus(u._id, u.status === 'suspended' ? 'active' : 'suspended')}
                      className={`px-3 py-1 rounded text-xs ${
                        u.status === 'suspended' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
