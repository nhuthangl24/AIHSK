import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FreeTalkService } from "@/lib/ai/free-talk-service";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, level, personaId } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Danh sách tin nhắn hợp lệ là bắt buộc." },
        { status: 400 }
      );
    }

    const result = await FreeTalkService.generateReply({
      messages,
      level: level || "Tự do",
      personaId: personaId || "friendly_peer",
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("Free Talk API error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể xử lý lượt trò chuyện tự do." },
      { status: 500 }
    );
  }
}
