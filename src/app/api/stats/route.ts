import { NextResponse } from "next/server";
import { get } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "관리자만 접근 가능" }, { status: 403 });
    }
    const users = await get("SELECT COUNT(*) as count FROM users");
    const scraps = await get("SELECT COUNT(*) as count FROM scraps WHERE deleted_at IS NULL");
    const posts = await get("SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL");
    const events = await get("SELECT COUNT(*) as count FROM calendar_events");
    return NextResponse.json({
      success: true,
      users: (users as any)?.count ?? 0,
      scraps: (scraps as any)?.count ?? 0,
      posts: (posts as any)?.count ?? 0,
      events: (events as any)?.count ?? 0,
    });
  } catch (err) {
    console.error("[Stats GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}