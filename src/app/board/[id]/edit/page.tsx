"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Post { id: string; user_id: string; title: string; content: string }

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Post>({ id: "", user_id: "", title: "", content: "" });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`).then(r => r.json()).then(d => {
      if (d.success) setForm(d.data);
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, content: form.content })
    });
    setSaving(false);
    if (res.ok) {
      router.push(`/board/${id}`);
    } else {
      const data = await res.json();
      alert(data.error || "수정 실패");
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4"><Link href={`/board/${id}`} className="text-blue-600 text-sm hover:underline">← 게시글 상세</Link></div>
      <h1 className="text-2xl font-bold mb-6">✏️ 글 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="제목" required />
        <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={8} placeholder="내용" required />
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "저장 중..." : "저장"}</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </form>
    </div>
  );
}