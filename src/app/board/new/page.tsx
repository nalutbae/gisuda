"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN" || (session?.user as any)?.role === "ADMIN";
  const [form, setForm] = useState({ title: "", content: "", is_notice: false, image_url: "", calendar_date: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSubmitting(false);
    if (res.ok) router.push("/board");
    else {
      const data = await res.json();
      alert(data.error || "생성 실패");
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">✏️ 글쓰기</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="제목" required />
        <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={8} placeholder="내용" required />
        {isAdmin && (
          <>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_notice} onChange={(e) => setForm({...form, is_notice: e.target.checked, calendar_date: e.target.checked ? form.calendar_date || todayStr : ""})} className="w-4 h-4" />
              <span className="text-sm">📢 공지로 등록</span>
            </label>
            {form.is_notice && (
              <div className="ml-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="block text-sm font-medium mb-1">📅 달력 표시 날짜</label>
                <input
                  type="date"
                  value={form.calendar_date}
                  onChange={(e) => setForm({...form, calendar_date: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required={form.is_notice}
                />
                <p className="text-xs text-gray-500 mt-1">선택한 날짜에 달력에 공지가 표시됩니다.</p>
              </div>
            )}
          </>
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
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? "저장 중..." : "저장"}</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </form>
    </div>
  );
}