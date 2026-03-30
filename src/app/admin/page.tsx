"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  rank: string;
  banned: boolean;
  postCount: number;
  credits: number;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [session, status]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  async function userAction(userId: string, action: string, role?: string) {
    setActionLoading(userId + action);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role }),
    });
    await fetchUsers();
    setActionLoading(null);
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-sm text-gray-500">{users.length} members registered</p>
        </div>
        <span className="text-xs bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-1 rounded-full font-bold">
          ADMIN
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Members</p>
        </div>
        <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {users.filter((u) => u.banned).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Banned</p>
        </div>
        <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#6366f1]">
            {users.filter((u) => u.role === "MODERATOR" || u.role === "ADMIN").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Staff</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-white">Members</h2>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#6366f1] rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none w-48"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e] text-xs text-gray-600 uppercase tracking-wide">
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Rank</th>
                <th className="text-left px-4 py-2 hidden md:table-cell">Posts</th>
                <th className="text-left px-4 py-2 hidden md:table-cell">Credits</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-[#1a1a1a] hover:bg-[#161616] transition ${
                    user.banned ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-[10px] text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{user.rank}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">
                    {user.postCount}
                  </td>
                  <td className="px-4 py-3 text-xs text-yellow-500 hidden md:table-cell">
                    {user.credits}
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded font-bold">
                        BANNED
                      </span>
                    ) : (
                      <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {/* Role buttons */}
                      {user.role !== "ADMIN" && (
                        <>
                          {user.role !== "MODERATOR" ? (
                            <button
                              onClick={() => userAction(user.id, "setRole", "MODERATOR")}
                              disabled={actionLoading === user.id + "setRole"}
                              className="text-[10px] bg-[#6366f1]/20 hover:bg-[#6366f1]/40 text-[#6366f1] px-2 py-1 rounded transition"
                            >
                              +Mod
                            </button>
                          ) : (
                            <button
                              onClick={() => userAction(user.id, "setRole", "USER")}
                              disabled={actionLoading === user.id + "setRole"}
                              className="text-[10px] bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 px-2 py-1 rounded transition"
                            >
                              -Mod
                            </button>
                          )}
                          {/* Ban/Unban */}
                          {!user.banned ? (
                            <button
                              onClick={() => userAction(user.id, "ban")}
                              disabled={actionLoading === user.id + "ban"}
                              className="text-[10px] bg-red-900/20 hover:bg-red-900/40 text-red-400 px-2 py-1 rounded transition"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => userAction(user.id, "unban")}
                              disabled={actionLoading === user.id + "unban"}
                              className="text-[10px] bg-green-900/20 hover:bg-green-900/40 text-green-400 px-2 py-1 rounded transition"
                            >
                              Unban
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-600 text-sm py-8">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-red-900/30 text-red-400 border-red-900/50",
    MODERATOR: "bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30",
    USER: "bg-gray-800/50 text-gray-500 border-gray-700/50",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles[role] ?? styles.USER}`}
    >
      {role}
    </span>
  );
}
