import { NextResponse } from "next/server";
import { get } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자만 접근 가능" }, { status: 403 });
    }
    const users = (await get("SELECT COUNT(*) as count FROM users")) as any;
    const scraps = (await get("SELECT COUNT(*) as count FROM scraps")) as any;
    const posts = (await get("SELECT COUNT(*) as count FROM posts")) as any;
    const events = (await get("SELECT COUNT(*) as count FROM calendar_events")) as any;
    return NextResponse.json({ success: true, users: users.count, scraps: scraps.count, posts: posts.count, events: events.count });
  } catch (err) {
    console.error("[Stats GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}