"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  content: string;
  is_notice: number;
  is_active: number;
  is_pinned: number;
  user_name: string;
  created_at: string;
}

export default function AdminNoticesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notices, setNotices] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN" || (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (session && !isAdmin) {
      router.push("/auth");
      return;
    }
    if (session) {
      fetch("/api/posts").then(r => r.json()).then(d => {
        if (d.success) {
          // Filter to show only notice posts (관리자는 모든 공지를 볼 수 있음)
          setNotices(d.data.filter((p: Post) => p.is_notice === 1));
        }
        setLoading(false);
      });
    }
  }, [session, isAdmin, router]);

  async function toggleActive(id: string, currentActive: number) {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: currentActive ? 0 : 1 }),
    });
    if (res.ok) {
      setNotices(prev => prev.map(n => n.id === id ? { ...n, is_active: currentActive ? 0 : 1 } : n));
    } else {
      const data = await res.json();
      alert(data.error || "변경 실패");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotices(prev => prev.filter(n => n.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "삭제 실패");
    }
  }

  if (!session || !isAdmin) return <div className="text-center py-12">접근 권한이 없습니다.</div>;
  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📢 게시판 공지 관리</h1>
        <Link href="/admin/notices/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ 공지 추가</Link>
      </div>

      {notices.length === 0 ? (
        <p className="text-gray-500 text-center py-12">공지가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className={`border rounded-lg p-4 ${!n.is_active ? "opacity-50 bg-gray-50" : "bg-white"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">📢 공지</span>
                    {n.is_active ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">활성</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-600">비활성</span>
                    )}
                  </div>
                  <h3 className="font-medium truncate">{n.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{n.user_name} · {new Date(n.created_at).toLocaleDateString("ko-KR")}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(n.id, n.is_active)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium ${n.is_active ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                  >
                    {n.is_active ? "비활성화" : "활성화"}
                  </button>
                  <Link href={`/admin/notices/${n.id}/edit`} className="px-3 py-1.5 text-xs rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium">수정</Link>
                  <button onClick={() => handleDelete(n.id)} className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-800 hover:bg-red-200 font-medium">삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin" className="text-blue-600 text-sm hover:underline">← 관리자 페이지로</Link>
      </div>
    </div>
  );
}