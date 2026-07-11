"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Post { id: string; title: string; content: string; is_notice: number; is_pinned: number; user_name: string; created_at: string }

function truncate(text: string, max: number) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(d => { if (d.success) setPosts(d.data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📌 게시판</h1>
        <Link href="/board/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">글쓰기</Link>
      </div>
      <div className="space-y-2">
        {posts.map((p) => (
          <Link key={p.id} href={`/board/${p.id}`} className={`block border rounded-lg p-4 hover:bg-gray-50 transition ${p.is_notice ? "border-red-200 bg-red-50" : ""}`}>
            <div className="flex items-center gap-2">{p.is_notice && <span className="notice-badge">공지</span>}{p.is_pinned && <span className="text-yellow-600 text-sm">📌</span>}<span className="font-medium">{p.title}</span></div>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{truncate(p.content, 150)}</p>
            <div className="text-sm text-gray-400 mt-1">{p.user_name} · {new Date(p.created_at).toLocaleDateString("ko-KR")}</div>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-gray-500 text-center py-12">게시글이 없습니다.</p>}
      </div>
    </div>
  );
}