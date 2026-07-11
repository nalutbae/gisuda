"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_notice: number;
  is_pinned: number;
  is_active: number;
  image_url: string;
  user_name: string;
  created_at: string;
}

function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh]">
        <button onClick={onClose} className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-gray-700 hover:bg-gray-100 text-lg font-bold">×</button>
        <img src={src} alt="full" className="max-w-full max-h-[85vh] rounded-lg" onClick={e => e.stopPropagation()} />
      </div>
    </div>
  );
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);

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
      const data = await res.json();
      alert(data.error || "삭제 실패");
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;
  if (!post) return <div className="text-center py-12"><p>게시글을 찾을 수 없습니다.</p><Link href="/board" className="text-blue-600 hover:underline">← 게시판으로</Link></div>;

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id === post.user_id;
  const canModify = isOwner || isAdmin;

  return (
    <div className="max-w-2xl mx-auto">
      {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}
      <div className="mb-4"><Link href="/board" className="text-blue-600 text-sm hover:underline">← 게시판</Link></div>
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          {post.is_notice && <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">📢 공지</span>}
          {post.is_pinned && <span>📌</span>}
          <h1 className="text-2xl font-bold">{post.title}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">{post.user_name} · {new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
        {post.image_url && (
          <div className="mb-4">
            <img src={post.image_url} alt="첨부 이미지" className="max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition" onClick={() => setModalImage(post.image_url)} />
          </div>
        )}
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
      {canModify && (
        <div className="mt-4 flex gap-3 justify-end">
          <Link href={`/board/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">수정</Link>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">삭제</button>
        </div>
      )}
    </div>
  );
}