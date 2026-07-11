"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Scrap { id: string; scrap_date: string; news_date: string; title: string; link: string; newspaper: string; region: string; keywords: string; summary: string; translation: string; commentary: string; image_url: string; user_name: string }

function truncate(text: string, max: number) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
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

export default function ScrapsPage() {
  const [groups, setGroups] = useState<Record<string, Scrap[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scraps").then(r => r.json()).then(d => {
      if (d.success) {
        const g: Record<string, Scrap[]> = {};
        for (const s of d.data) { if (!g[s.scrap_date]) g[s.scrap_date] = []; g[s.scrap_date].push(s); }
        setGroups(g);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div>
      {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📰 뉴스 스크랩</h1>
        <Link href="/scraps/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ 스크랩 추가</Link>
      </div>
      {Object.entries(groups).length === 0 && <p className="text-gray-500 text-center py-12">아직 스크랩이 없습니다.</p>}
      {Object.entries(groups).map(([date, items]) => (
        <div key={date} className="scrap-group mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">📅 {date}</h2>
          {items.map((s) => (
            <Link key={s.id} href={`/scraps/${s.id}`} className="scrap-card block">
              <div className="flex items-start gap-3">
                {s.image_url && (
                  <img src={s.image_url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0 cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalImage(s.image_url); }} />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{s.title}</h3>
                  <div className="flex flex-wrap gap-1 text-sm text-gray-500 mt-1">
                    {s.region && <span>🌍 {s.region} ·</span>}
                    {s.newspaper && <span>{s.newspaper} ·</span>}
                    <span>{s.news_date}</span>
                  </div>
                  {s.keywords && <div className="mt-1">{s.keywords.split(",").map((kw) => <span key={kw} className="keyword-tag">{kw.trim()}</span>)}</div>}
                  {s.summary && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{truncate(s.summary, 150)}</p>}
                </div>
                <span className="text-blue-600 ml-4 text-sm flex-shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}