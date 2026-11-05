import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAuthorizedAdmin } from "@/lib/auth/session";
import { ExaminerService } from "@/lib/ai/examiner-service";
import { ConversationTurnItem } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const { message, targetLevel, topic } = await req.json();

    const turns: ConversationTurnItem[] = [
      {
        turnIndex: 0,
        stage: 1,
        speaker: "EXAMINER",
        textContent: "你好！欢迎参加今天的华语口语评估。请先用中文简单介绍一下你自己吧。",
      },
      {
        turnIndex: 1,
        stage: 1,
        speaker: "LEARNER",
        textContent: message || "老师好，我叫李明，来自越南，平时很喜欢学习中文和看中国电影。",
      },
    ];

    const result = await ExaminerService.generateNextTurn(
      turns,
      targetLevel || "HSK 4",
      topic || "Daily Life & Cultural Experience"
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Simulation failed",
      },
      { status: 500 }
    );
  }
}
