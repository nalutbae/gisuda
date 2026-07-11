import { NextResponse } from "next/server";
import { get, run, now } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const scrap = await get("SELECT s.*, u.name as user_name FROM scraps s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.deleted_at IS NULL", [id]);
    if (!scrap) return NextResponse.json({ error: "스크랩 없음" }, { status: 404 });
    return NextResponse.json({ success: true, data: scrap });
  } catch (err) {
    console.error("[Scrap GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const role = session.user?.role;
    const userId = session.user?.id;

    // Check ownership or admin
    const scrap = await get("SELECT user_id FROM scraps WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!scrap) return NextResponse.json({ error: "스크랩 없음" }, { status: 404 });
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && scrap.user_id !== userId) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const body = await req.json();
    const { scrap_date, news_date, title, link, newspaper, region, keywords, summary, translation, commentary } = body;
    if (!scrap_date || !news_date || !title || !link) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const ts = now();
    await run(`
      UPDATE scraps SET
        scrap_date = ?, news_date = ?, title = ?, link = ?,
        newspaper = ?, region = ?, keywords = ?,
        summary = ?, translation = ?, commentary = ?,
        updated_at = ?
      WHERE id = ?
    `, [scrap_date, news_date, title, link, newspaper || null, region || null, keywords || null, summary || null, translation || null, commentary || null, ts, id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Scrap PUT]", err);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const role = session.user?.role;
    const userId = session.user?.id;

    // Check ownership or admin
    const scrap = await get("SELECT user_id FROM scraps WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!scrap) return NextResponse.json({ error: "스크랩 없음" }, { status: 404 });
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && scrap.user_id !== userId) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const ts = now();
    await run("UPDATE scraps SET deleted_at = ? WHERE id = ?", [ts, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Scrap DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}