import { NextResponse } from "next/server";
import { query, get, run, now } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const role = session.user?.role;
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    let posts;
    if (isAdmin) {
      // 관리자는 모든 공지(비활성 포함) 조회 가능
      posts = await query(`
        SELECT p.id, p.user_id, p.title, p.content, p.is_notice, p.is_pinned, p.is_active, p.image_url, p.created_at, p.updated_at, u.name as user_name
        FROM posts p JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL
        ORDER BY p.is_notice DESC, p.is_pinned DESC, p.created_at DESC
      `);
    } else {
      // 일반 사용자는 활성 공지만 조회
      posts = await query(`
        SELECT p.id, p.user_id, p.title, p.content, p.is_notice, p.is_pinned, p.is_active, p.image_url, p.created_at, p.updated_at, u.name as user_name
        FROM posts p JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL AND (p.is_notice = 0 OR (p.is_notice = 1 AND p.is_active = 1))
        ORDER BY p.is_notice DESC, p.is_pinned DESC, p.created_at DESC
      `);
    }
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
    const { title, content, is_notice, image_url } = body;
    if (!title || !content) return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    const userId = session.user?.id;
    const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN";
    const id = uuid();
    await run("INSERT INTO posts (id, user_id, title, content, is_notice, is_pinned, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      id, userId, title, content, isAdmin && is_notice ? 1 : 0, 0, image_url || null
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