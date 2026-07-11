import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    const { id } = await params;
    const post = await get(`
      SELECT p.*, u.name as user_name
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);
    if (!post) return NextResponse.json({ error: "게시글 없음" }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    console.error("[Post GET]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
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
    const isAdmin = session.user?.role === "ADMIN";
    if (isAdmin) {
      await run("DELETE FROM posts WHERE id = ?", [id]);
    } else {
      const userId = session.user?.id;
      await run("DELETE FROM posts WHERE id = ? AND user_id = ?", [id, userId]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Post DELETE]", err);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}