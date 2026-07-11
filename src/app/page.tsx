"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">🌍 지수다</h1>
      <p className="text-xl text-gray-600 mb-2">지구촌 수다방</p>
      <p className="text-gray-500 mb-8">지구촌 여러 곳의 뉴스를 공유하는 소모임</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Link
          href="/scraps"
          className="block p-6 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition"
        >
          <div className="text-3xl mb-2">📰</div>
          <h2 className="font-semibold text-lg">뉴스 스크랩</h2>
          <p className="text-sm text-gray-500 mt-1">스크랩 날짜별 뉴스 모음</p>
        </Link>
        <Link
          href="/calendar"
          className="block p-6 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition"
        >
          <div className="text-3xl mb-2">📅</div>
          <h2 className="font-semibold text-lg">달력 보기</h2>
          <p className="text-sm text-gray-500 mt-1">풀 캘린더로 한눈에</p>
        </Link>
        <Link
          href="/board"
          className="block p-6 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition"
        >
          <div className="text-3xl mb-2">📌</div>
          <h2 className="font-semibold text-lg">게시판</h2>
          <p className="text-sm text-gray-500 mt-1">자유 게시글 & 공지사항</p>
        </Link>
      </div>

      {!session && (
        <div className="mt-10">
          <Link
            href="/auth"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition text-lg"
          >
            로그인 하기
          </Link>
        </div>
      )}

      {session && (session.user as any)?.role === "ADMIN" && (
        <div className="mt-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:underline text-sm"
          >
            👑 관리자 화면
          </Link>
        </div>
      )}
    </div>
  );
}