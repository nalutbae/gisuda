import { NextResponse } from "next/server";
import { query, run, now } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const posts = await query(`
      SELECT p.id, p.user_id, p.title, p.content, p.is_notice, p.is_pinned, p.created_at, p.updated_at, u.name as user_name
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.is_notice DESC, p.is_pinned DESC, p.created_at DESC
    `);
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
    const userId = session.user?.id;
    const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN";
    const id = uuid();
    await run("INSERT INTO posts (id, user_id, title, content, is_notice, is_pinned) VALUES (?, ?, ?, ?, ?, ?)", [
      id, userId, title, content, isAdmin && is_notice ? 1 : 0, 0
    ]);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[Posts POST]", err);
    return NextResponse.json({ error: "생성 실패" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
    const role = session.user?.role;
    const userId = session.user?.id;
    const ts = now();

    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      await run("UPDATE posts SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL", [ts, id]);
    } else {
      await run("UPDATE posts SET deleted_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL", [ts, id, userId]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Posts DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}