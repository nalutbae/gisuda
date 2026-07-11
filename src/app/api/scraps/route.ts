import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const db = getDb();
    const scraps = db.prepare(`
      SELECT s.id, s.scrap_date, s.news_date, s.title, s.link, s.newspaper, s.region, s.keywords, s.summary, s.translation, s.commentary, s.user_id, u.name as user_name
      FROM scraps s JOIN users u ON s.user_id = u.id
      ORDER BY s.scrap_date DESC, s.created_at DESC
    `).all();
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
    const db = getDb();
    const userId = session.user?.id;
    const id = uuid();
    db.prepare(`
      INSERT INTO scraps (id, user_id, scrap_date, news_date, title, link, newspaper, region, keywords, summary, translation, commentary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, scrap_date, news_date, title, link, newspaper || null, region || null, keywords || null, summary || null, translation || null, commentary || null);
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
    const db = getDb();
    const role = session.user?.role;
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      db.prepare("DELETE FROM scraps WHERE id = ?").run(id);
    } else {
      const userId = session.user?.id;
      db.prepare("DELETE FROM scraps WHERE id = ? AND user_id = ?").run(id, userId);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Scraps DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}