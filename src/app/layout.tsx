import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "지수다 — 지구촌 수다방",
  description: "지구촌 뉴스를 공유하는 소모임",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        <AuthProvider>
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}