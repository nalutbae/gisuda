"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  title: string;
  content: string;
  is_notice: number;
  is_pinned: number;
  user_name: string;
  created_at: string;
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        if (d.success) setPost(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/board");
    } else {
      alert("삭제 실패");
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;
  if (!post) return <div className="text-center py-12"><p>게시글을 찾을 수 없습니다.</p><Link href="/board" className="text-blue-600 hover:underline">← 게시판으로</Link></div>;

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isOwner = (session?.user as any)?.id === post.user_name; // Note: server sends user_name, not user_id for display

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4"><Link href="/board" className="text-blue-600 text-sm hover:underline">← 게시판</Link></div>
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          {post.is_notice && <span className="notice-badge">공지</span>}
          {post.is_pinned && <span>📌</span>}
          <h1 className="text-2xl font-bold">{post.title}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">{post.user_name} · {new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
      {(isAdmin) && (
        <div className="mt-4 text-right">
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">삭제</button>
        </div>
      )}
    </div>
  );
}