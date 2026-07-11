"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Scrap { id: string; scrap_date: string; news_date: string; title: string; link: string; newspaper: string; region: string; keywords: string; summary: string; translation: string; commentary: string; user_name: string }
interface CalendarEvent { id: string; date: string; title: string; content: string }

function truncate(text: string, max: number) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scrapCounts, setScrapCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/scraps").then(r => r.json()).then(d => {
      if (d.success) {
        setScraps(d.data);
        const counts: Record<string, number> = {};
        for (const s of d.data) { counts[s.scrap_date] = (counts[s.scrap_date] || 0) + 1; }
        setScrapCounts(counts);
      }
    });
    fetch("/api/calendar-events").then(r => r.json()).then(d => { if (d.success) setEvents(d.data); });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const dayEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];
  const dayScraps = selectedDate ? scraps.filter(s => s.scrap_date === selectedDate) : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1 rounded hover:bg-gray-100">◀</button>
        <h1 className="text-xl font-bold">{year}년 {month + 1}월</h1>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1 rounded hover:bg-gray-100">▶</button>
      </div>
      <div className="calendar-grid rounded-lg overflow-hidden border">
        {["일", "월", "화", "수", "목", "금", "토"].map(d => <div key={d} className="text-center text-sm font-medium py-2 bg-gray-50">{d}</div>)}
        {days.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="calendar-cell bg-gray-50" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = scrapCounts[dateStr] || 0;
          const hasEvents = events.some(e => e.date === dateStr);
          return (
            <div key={dateStr} className={`calendar-cell ${selectedDate === dateStr ? "selected" : ""} ${dateStr === today ? "today" : ""}`} onClick={() => setSelectedDate(dateStr)}>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${dateStr === today ? "font-bold text-blue-600" : ""}`}>{day}</span>
                <div className="flex gap-1 items-center">
                  {hasEvents && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  {count > 0 && <span className="scrap-count-badge">{count}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">📌 {selectedDate}</h2>
          {dayEvents.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-red-600 mb-2">📢 공지</h3>
              {dayEvents.map(e => <div key={e.id} className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2"><p className="font-medium">{e.title}</p>{e.content && <p className="text-sm text-gray-600 mt-1">{e.content}</p>}</div>)}
            </div>
          )}
          {dayScraps.length > 0 ? (
            <div>
              <h3 className="font-medium text-blue-600 mb-2">📰 스크랩 ({dayScraps.length}개)</h3>
              {dayScraps.map(s => (
                <Link key={s.id} href={`/scraps/${s.id}`} className="scrap-card block">
                  <div className="flex justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-gray-500">{s.newspaper}{s.region ? ` · 🌍 ${s.region}` : ""} · {s.news_date}</p>
                      {s.keywords && <div className="mt-1">{s.keywords.split(",").map(kw => <span key={kw} className="keyword-tag">{kw.trim()}</span>)}</div>}
                      {s.summary && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{truncate(s.summary, 150)}</p>}
                    </div>
                    <span className="text-blue-600 ml-4 text-sm flex-shrink-0">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="text-gray-400">이 날짜의 스크랩이 없습니다.</p>}
          <div className="mt-4"><Link href="/scraps/new" className="text-blue-600 text-sm hover:underline">+ 스크랩 추가</Link></div>
        </div>
      )}
    </div>
  );
}