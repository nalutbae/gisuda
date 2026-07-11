"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isLogin) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error || "회원가입 실패"); return; }
    }
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("이메일 또는 비밀번호가 틀렸습니다."); return; }
    router.push("/");
  }

  return (
    <div className="max-w-sm mx-auto py-20">
      <h1 className="text-2xl font-bold text-center mb-8">{isLogin ? "🔐 로그인" : "📝 회원가입"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-4 py-2" required />}
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">{isLogin ? "로그인" : "회원가입"}</button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
        <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-blue-600 ml-1">{isLogin ? "회원가입" : "로그인"}</button>
      </p>
    </div>
  );
}
