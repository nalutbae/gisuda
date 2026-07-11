import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const db = getDb();
    const posts = db.prepare(`
      SELECT p.*, u.name as user_name
      FROM posts p JOIN users u ON p.user_id = u.id
      ORDER BY p.is_notice DESC, p.is_pinned DESC, p.created_at DESC
    `).all();
    return NextResponse.json({ success: true, data: posts });
  } catch (err) {
    console.error("[Posts GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const body = await req.json();
    const { title, content, is_notice } = body;
    if (!title || !content) return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    const db = getDb();
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";
    const id = uuid();
    db.prepare("INSERT INTO posts (id, user_id, title, content, is_notice, is_pinned) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, userId, title, content, isAdmin && is_notice ? 1 : 0, 0);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[Posts POST]", err);
    return NextResponse.json({ error: "생성 실패" }, { status: 500 });
  }
}