import { NextRequest, NextResponse } from "next/server";
import { HskkService } from "@/lib/ai/hskk-service";
import { HskkQuestion } from "@/types/hskk";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { audioBase64, targetText, maxScore = 5 } = body;

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp dữ liệu ghi âm (audioBase64)." },
        { status: 400 }
      );
    }

    const mockQuestion: HskkQuestion = {
      id: "quick_test_q1",
      partNumber: 1,
      questionIndex: 1,
      type: "LISTEN_AND_REPEAT",
      title: "Kiểm tra phát âm nhanh",
      audioPrompt: targetText || "我想去图书馆借一本书。",
      pinyinPrompt: "Wǒ xiǎng qù túshūguǎn jiè yī běn shū.",
      prepTimeSeconds: 0,
      speakingTimeSeconds: 10,
      maxScore: Number(maxScore) || 5,
    };

    const evaluation = await HskkService.evaluateQuestionAudioWithGemini(
      mockQuestion,
      audioBase64
    );

    if (!evaluation) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể đánh giá âm thanh qua Gemini 3.6 Flash. Vui lòng kiểm tra API Key hoặc mic.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation,
      modelUsed: "gemini-3.6-flash (HHTECH.API)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Lỗi xử lý file ghi âm." },
      { status: 500 }
    );
  }
}
