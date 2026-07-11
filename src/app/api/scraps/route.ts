import { NextResponse } from "next/server";
import { query, run, now } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const scraps = await query(`
      SELECT s.id, s.scrap_date, s.news_date, s.title, s.link, s.newspaper, s.region, s.keywords, s.summary, s.translation, s.commentary, s.user_id, u.name as user_name
      FROM scraps s JOIN users u ON s.user_id = u.id
      WHERE s.deleted_at IS NULL
      ORDER BY s.scrap_date DESC, s.created_at DESC
    `);
    return NextResponse.json({ success: true, data: scraps });
  } catch (err) {
    console.error("[Scraps GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const body = await req.json();
    const { scrap_date, news_date, title, link, newspaper, region, keywords, summary, translation, commentary } = body;
    if (!scrap_date || !news_date || !title || !link) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }
    const userId = session.user?.id;
    const id = crypto.randomUUID();
    await run(`
      INSERT INTO scraps (id, user_id, scrap_date, news_date, title, link, newspaper, region, keywords, summary, translation, commentary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, userId, scrap_date, news_date, title, link, newspaper || null, region || null, keywords || null, summary || null, translation || null, commentary || null]);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[Scraps POST]", err);
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
      await run("UPDATE scraps SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL", [ts, id]);
    } else {
      await run("UPDATE scraps SET deleted_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL", [ts, id, userId]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Scraps DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}