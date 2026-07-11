"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, scraps: 0, posts: 0, events: 0 });
  const [users, setUsers] = useState<any[]>([]);

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!session || !((session.user as any)?.role === "SUPER_ADMIN" || (session.user as any)?.role === "ADMIN")) {
      router.push("/auth");
      return;
    }
    fetch("/api/users").then(r => r.json()).then(d => { if (d.success) setUsers(d.data); });
    fetch("/api/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); });
  }, [session, router]);

  async function changeRole(userId: string, newRole: string) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  }

  if (!session || !((session.user as any)?.role === "SUPER_ADMIN" || (session.user as any)?.role === "ADMIN")) {
    return <div className="text-center py-12">접근 권한이 없습니다.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👑 관리자</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.users}</div><div className="text-sm text-gray-600">사용자</div></div>
        <div className="bg-green-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.scraps}</div><div className="text-sm text-gray-600">스크랩</div></div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{stats.posts}</div><div className="text-sm text-gray-600">게시글</div></div>
        <div className="bg-red-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-red-600">{stats.events}</div><div className="text-sm text-gray-600">캘린더 공지</div></div>
      </div>
      <h2 className="text-lg font-semibold mb-3">사용자 목록</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2 text-left">이름</th><th className="px-4 py-2 text-left">이메일</th><th className="px-4 py-2">역할</th>{isSuperAdmin && <th className="px-4 py-2">역할 변경</th>}</tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 text-center">
                  <span className={u.role === "SUPER_ADMIN" ? "text-red-600 font-medium" : u.role === "ADMIN" ? "text-orange-600 font-medium" : ""}>
                    {u.role === "SUPER_ADMIN" ? "👑 슈퍼관리자" : u.role === "ADMIN" ? "🛡️ 관리자" : "일반"}
                  </span>
                </td>
                {isSuperAdmin && u.role !== "SUPER_ADMIN" && (
                  <td className="px-4 py-2 text-center">
                    {u.role === "USER" ? (
                      <button onClick={() => changeRole(u.id, "ADMIN")} className="text-blue-600 text-xs hover:underline">관리자 승격</button>
                    ) : u.role === "ADMIN" ? (
                      <button onClick={() => changeRole(u.id, "USER")} className="text-red-600 text-xs hover:underline">관리자 해제</button>
                    ) : null}
                  </td>
                )}
                {isSuperAdmin && u.role === "SUPER_ADMIN" && <td className="px-4 py-2 text-center text-gray-400 text-xs">—</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8"><Link href="/admin/events/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ 공지 추가</Link></div>
    </div>
  );
}