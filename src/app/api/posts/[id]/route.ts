import { NextResponse } from "next/server";
import { get, run, now } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const post = await get(`
      SELECT p.id, p.user_id, p.title, p.content, p.is_notice, p.is_pinned, p.is_active, p.image_url, p.calendar_date, p.created_at, p.updated_at, u.name as user_name
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `, [id]);
    if (!post) return NextResponse.json({ error: "게시글 없음" }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    console.error("[Post GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const role = session.user?.role;
    const userId = session.user?.id;

    // Check ownership or admin
    const post = await get("SELECT user_id, calendar_date FROM posts WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!post) return NextResponse.json({ error: "게시글 없음" }, { status: 404 });
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && post.user_id !== userId) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, image_url, calendar_date } = body;
    if (!title || !content) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const ts = now();
    await run(`
      UPDATE posts SET title = ?, content = ?, image_url = ?, calendar_date = ?, updated_at = ?
      WHERE id = ?
    `, [title, content, image_url || null, calendar_date || null, ts, id]);

    // calendar_events 동기화: 기존 이벤트 삭제 후 재생성 (title/content가 바뀔 수 있으므로)
    // 기존 calendar_date로 등록된 이벤트가 있으면 삭제
    if (post.calendar_date) {
      await run("DELETE FROM calendar_events WHERE date = ? AND created_by = ?", [post.calendar_date, userId]);
    }
    // 새 calendar_date가 있으면 생성
    if (calendar_date) {
      const eventId = uuid();
      await run(
        "INSERT INTO calendar_events (id, date, title, content, created_by) VALUES (?, ?, ?, ?, ?)",
        [eventId, calendar_date, title, content || "", userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Post PUT]", err);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const role = session.user?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한 필요" }, { status: 403 });
    }

    const body = await req.json();
    const { is_active } = body;
    if (typeof is_active !== "number" && typeof is_active !== "boolean") {
      return NextResponse.json({ error: "is_active 필요" }, { status: 400 });
    }

    const activeValue = Number(is_active);
    const ts = now();
    await run("UPDATE posts SET is_active = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL", [activeValue, ts, id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Post PATCH]", err);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const role = session.user?.role;
    const userId = session.user?.id;

    // Check ownership or admin
    const post = await get("SELECT user_id, calendar_date FROM posts WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!post) return NextResponse.json({ error: "게시글 없음" }, { status: 404 });
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && post.user_id !== userId) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const ts = now();
    await run("UPDATE posts SET deleted_at = ? WHERE id = ?", [ts, id]);

    // 연결된 calendar_events도 삭제
    if (post.calendar_date) {
      await run("DELETE FROM calendar_events WHERE date = ? AND created_by = ?", [post.calendar_date, post.user_id]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Post DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}