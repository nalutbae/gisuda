"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Scrap { id: string; scrap_date: string; news_date: string; title: string; link: string; newspaper: string; region: string; keywords: string; summary: string; translation: string; commentary: string; user_name: string }

export default function ScrapDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [scrap, setScrap] = useState<Scrap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/scraps/${id}`).then(r => r.json()).then(d => { if (d.success) setScrap(d.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;
  if (!scrap) return <div className="text-center py-12 text-gray-500">스크랩을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4"><Link href="/scraps" className="text-blue-600 text-sm hover:underline">← 스크랩 목록</Link></div>
      <div className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-3">{scrap.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
          <span>📅 회의: {scrap.scrap_date}</span>
          <span>·</span>
          <span>📰 뉴스: {scrap.news_date}</span>
          {scrap.newspaper && <><span>·</span><span>{scrap.newspaper}</span></>}
          {scrap.region && <><span>·</span><span>🌍 {scrap.region}</span></>}
        </div>
        {scrap.keywords && (
          <div className="mb-4">{scrap.keywords.split(",").map(kw => <span key={kw} className="keyword-tag">{kw.trim()}</span>)}</div>
        )}
        {scrap.summary && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">📝 요약</h3>
            <div className="text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{scrap.summary}</div>
          </div>
        )}
        {scrap.translation && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">🌐 번역</h3>
            <div className="text-gray-600 whitespace-pre-wrap bg-blue-50 rounded-lg p-4">{scrap.translation}</div>
          </div>
        )}
        {scrap.commentary && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">💬 한줄논평</h3>
            <div className="text-gray-700 italic bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">{scrap.commentary}</div>
          </div>
        )}
        <div className="mt-4">
          <a href={scrap.link} target="_blank" rel="noopener" className="text-blue-600 hover:underline">🔗 원문 보기</a>
        </div>
        <div className="text-sm text-gray-400 mt-2">작성자: {scrap.user_name}</div>
      </div>
    </div>
  );
}