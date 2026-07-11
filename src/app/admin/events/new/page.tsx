"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), title: "", content: "" });
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/calendar-events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) router.push("/calendar");
  }
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">📢 공지 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">날짜</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full border rounded-lg px-3 py-2" required /></div>
        <div><label className="block text-sm font-medium mb-1">제목</label><input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" required /></div>
        <div><label className="block text-sm font-medium mb-1">내용</label><textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={4} /></div>
        <div className="flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">저장</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </form>
    </div>
  );
}
