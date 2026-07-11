"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewScrapPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    scrap_date: new Date().toISOString().slice(0, 10),
    news_date: new Date().toISOString().slice(0, 10),
    title: "", link: "", newspaper: "", region: "",
    keywords: "", summary: "", translation: "", commentary: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/scraps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) router.push("/scraps");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">📰 스크랩 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">회의 날짜 (스크랩 날짜)</label><input type="date" value={form.scrap_date} onChange={(e) => setForm({...form, scrap_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" required /></div>
        <div><label className="block text-sm font-medium mb-1">뉴스 날짜</label><input type="date" value={form.news_date} onChange={(e) => setForm({...form, news_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" required /></div>
        <div><label className="block text-sm font-medium mb-1">뉴스 제목</label><input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" required /></div>
        <div><label className="block text-sm font-medium mb-1">링크</label><input type="url" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} className="w-full border rounded-lg px-3 py-2" required /></div>
        <div><label className="block text-sm font-medium mb-1">신문사</label><input type="text" value={form.newspaper} onChange={(e) => setForm({...form, newspaper: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">🌍 지역</label><input type="text" value={form.region} onChange={(e) => setForm({...form, region: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="예: 중동, 유럽, 아시아" /></div>
        <div><label className="block text-sm font-medium mb-1">키워드 (쉼표로 구분)</label><input type="text" value={form.keywords} onChange={(e) => setForm({...form, keywords: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="국제, 정치, 경제" /></div>
        <div><label className="block text-sm font-medium mb-1">📝 요약</label><textarea value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={4} /></div>
        <div><label className="block text-sm font-medium mb-1">🌐 번역</label><textarea value={form.translation} onChange={(e) => setForm({...form, translation: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={4} /></div>
        <div><label className="block text-sm font-medium mb-1">💬 한줄논평</label><input type="text" value={form.commentary} onChange={(e) => setForm({...form, commentary: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="한줄 논평을 입력하세요" /></div>
        <div className="flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">저장</button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </form>
    </div>
  );
}