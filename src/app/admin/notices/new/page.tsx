"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNoticePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", image_url: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_notice: true }),
      });
      if (res.ok) {
        router.push("/admin/notices");
      } else {
        const data = await res.json();
        setError(data.error || "생성 실패");
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">📢 게시판 공지 추가</h1>
      {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4">{error}</div>}
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
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? "저장 중..." : "저장"}</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </form>
    </div>
  );
}