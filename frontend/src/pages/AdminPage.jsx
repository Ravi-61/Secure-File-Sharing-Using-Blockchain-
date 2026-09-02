import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardSkeleton } from "../components/SkeletonLoaders";
import { Users, UserX, UserCheck, Shield, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    API.get("/admin/users").then((r) => setUsers(r.data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (id, isBlocked) => {
    const endpoint = isBlocked ? `/admin/users/${id}/unblock` : `/admin/users/${id}/block`;
    await API.patch(endpoint).catch(() => {});
    fetchUsers();
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <Users className="w-7 h-7 text-purple-400" /> Admin User Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage user accounts, roles, access permissions, and account bans.</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table-base">
          <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th className="text-right">Action</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="font-semibold text-slate-200">{u.username}</td>
                <td className="text-slate-400 text-xs">{u.email}</td>
                <td><span className={`badge text-[10px] ${u.role === "Admin" ? "role-admin" : "role-user"}`}>{u.role}</span></td>
                <td className="text-xs font-mono text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="text-right">
                  <button onClick={() => toggleBlock(u._id, u.isBlocked)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto ${
                      u.isBlocked ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                    }`}
                  >
                    {u.isBlocked ? <><UserCheck className="w-3.5 h-3.5" /> Unblock</> : <><UserX className="w-3.5 h-3.5" /> Block</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
