"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">🌍 지수다</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/scraps" className="hover:text-blue-600">스크랩</Link>
          <Link href="/calendar" className="hover:text-blue-600">달력</Link>
          <Link href="/board" className="hover:text-blue-600">게시판</Link>
          {isAdmin && <Link href="/admin" className="hover:text-blue-600 font-medium">관리</Link>}
          {session ? (
            <button onClick={() => signOut()} className="text-gray-500 hover:text-gray-700">
              {session.user?.name} 로그아웃
            </button>
          ) : (
            <Link href="/auth" className="text-blue-600 hover:text-blue-700">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  );
}