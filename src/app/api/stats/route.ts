import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자만 접근 가능" }, { status: 403 });
    }
    const db = getDb();
    const users = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
    const scraps = (db.prepare("SELECT COUNT(*) as count FROM scraps").get() as any).count;
    const posts = (db.prepare("SELECT COUNT(*) as count FROM posts").get() as any).count;
    const events = (db.prepare("SELECT COUNT(*) as count FROM calendar_events").get() as any).count;
    return NextResponse.json({ success: true, users, scraps, posts, events });
  } catch (err) {
    console.error("[Stats GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
