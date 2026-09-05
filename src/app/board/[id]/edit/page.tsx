"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_notice: number;
  image_url: string;
  calendar_date: string | null;
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;
  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN" || (session?.user as any)?.role === "ADMIN";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Post>({ id: "", user_id: "", title: "", content: "", is_notice: 0, image_url: "", calendar_date: null });
  const [calendarDate, setCalendarDate] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`).then(r => r.json()).then(d => {
      if (d.success) {
        setForm({
          id: d.data.id,
          user_id: d.data.user_id,
          title: d.data.title,
          content: d.data.content,
          is_notice: d.data.is_notice,
          image_url: d.data.image_url || "",
          calendar_date: d.data.calendar_date || null,
        });
        setCalendarDate(d.data.calendar_date || "");
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
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        image_url: form.image_url || null,
        calendar_date: form.is_notice ? calendarDate || null : null,
      })
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
        {isAdmin && form.is_notice === 1 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <label className="block text-sm font-medium mb-1">📅 달력 표시 날짜</label>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">날짜를 변경하면 달력의 공지 표시 위치가 업데이트됩니다.</p>
          </div>
        )}
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