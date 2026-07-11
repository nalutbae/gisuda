"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Post { id: string; user_id: string; title: string; content: string; image_url: string }

export default function EditNoticePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Post>({ id: "", user_id: "", title: "", content: "", image_url: "" });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`).then(r => r.json()).then(d => {
      if (d.success) {
        setForm({ id: d.data.id, user_id: d.data.user_id, title: d.data.title, content: d.data.content, image_url: d.data.image_url || "" });
      }
      setLoading(false);
    });
  }, [id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || "이미지 업로드 실패");
      }
    } catch {
      alert("이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, content: form.content, image_url: form.image_url || null })
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/notices");
    } else {
      const data = await res.json();
      alert(data.error || "수정 실패");
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4"><Link href="/admin/notices" className="text-blue-600 text-sm hover:underline">← 공지 관리로</Link></div>
      <h1 className="text-2xl font-bold mb-6">✏️ 공지 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">내용</label>
          <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={8} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">이미지 첨부</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" disabled={uploading} />
          {uploading && <p className="text-sm text-gray-500 mt-1">업로드 중...</p>}
          {form.image_url && (
            <div className="mt-2 relative">
              <img src={form.image_url} alt="preview" className="max-h-48 rounded-lg border" />
              <button type="button" onClick={() => setForm({...form, image_url: ""})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600">✕</button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "저장 중..." : "저장"}</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </form>
    </div>
  );
}