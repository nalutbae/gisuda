import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const db = getDb();
    const scrap = db.prepare("SELECT s.*, u.name as user_name FROM scraps s JOIN users u ON s.user_id = u.id WHERE s.id = ?").get(id);
    if (!scrap) return NextResponse.json({ error: "스크랩 없음" }, { status: 404 });
    return NextResponse.json({ success: true, data: scrap });
  } catch (err) {
    console.error("[Scrap GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const db = getDb();
    const role = session.user?.role;
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      db.prepare("DELETE FROM scraps WHERE id = ?").run(id);
    } else {
      db.prepare("DELETE FROM scraps WHERE id = ? AND user_id = ?").run(id, session.user?.id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Scrap DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}