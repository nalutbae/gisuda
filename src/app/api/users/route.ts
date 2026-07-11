import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const role = session.user?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "관리자만 접근 가능" }, { status: 403 });
    }
    const db = getDb();
    const users = db.prepare("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC").all();
    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    console.error("[Users GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    if (session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "슈퍼관리자만 역할 변경 가능" }, { status: 403 });
    }
    const { userId, role } = await req.json();
    if (!userId || !role || !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json({ error: "유효하지 않은 요청" }, { status: 400 });
    }
    const db = getDb();
    db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Users PATCH]", err);
    return NextResponse.json({ error: "변경 실패" }, { status: 500 });
  }
}