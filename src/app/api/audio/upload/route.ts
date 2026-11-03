import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { StorageService } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await StorageService.uploadAudio(
      buffer,
      file.name || "recording.webm",
      file.type || "audio/webm"
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      byteSize: uploadResult.byteSize,
    });
  } catch (err: any) {
    console.error("Audio upload error:", err);
    return NextResponse.json({ error: "Audio upload failed" }, { status: 500 });
  }
}
