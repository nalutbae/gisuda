import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "지원하지 않는 이미지 형식입니다" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "이미지는 5MB 이하만 업로드 가능합니다" }, { status: 400 });
    }

    const isVercel = !!process.env.VERCEL;

    if (isVercel) {
      // Production: use Vercel Blob
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(file.name, file, { access: "public" });
        return NextResponse.json({ success: true, url: blob.url });
      } catch {
        return NextResponse.json({ error: "Vercel Blob 업로드 실패" }, { status: 500 });
      }
    } else {
      // Development: save to public/uploads/
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    }
  } catch (err) {
    console.error("[Upload POST]", err);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}