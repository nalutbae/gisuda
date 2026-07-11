import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !name || !password) {
      return NextResponse.json({ error: "모든 항목을 입력해주세요" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다" }, { status: 400 });
    }

    const db = getDb();

    // Check if email already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다" }, { status: 409 });
    }

    const id = uuid();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)").run(
      id, email, name, hash, "USER"
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Register POST]", err);
    return NextResponse.json({ error: "회원가입 실패" }, { status: 500 });
  }
}