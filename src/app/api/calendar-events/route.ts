import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const events = await query(`
      SELECT e.*, u.name as created_by_name
      FROM calendar_events e JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC
    `);
    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    console.error("[CalendarEvents GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "관리자만 공지를 추가할 수 있습니다" }, { status: 403 });
    }
    const body = await req.json();
    const { date, title, content } = body;
    if (!date || !title) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }
    const userId = session.user?.id;
    const id = uuid();
    await run(`
      INSERT INTO calendar_events (id, date, title, content, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [id, date, title, content || "", userId]);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[CalendarEvents POST]", err);
    return NextResponse.json({ error: "생성 실패" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "관리자만 삭제할 수 있습니다" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
    await run("DELETE FROM calendar_events WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CalendarEvents DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}