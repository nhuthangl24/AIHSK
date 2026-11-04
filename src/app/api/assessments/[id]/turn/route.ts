import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { text, audioUrl, durationMs, sessionSnapshot } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Spoken or transcribed Chinese text is required." },
        { status: 400 }
      );
    }

    const result = await AssessmentService.submitLearnerTurn(
      id,
      user.userId,
      text.trim(),
      audioUrl,
      durationMs,
      sessionSnapshot
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Turn submission error:", err);
    return NextResponse.json({ error: err.message || "Failed to process conversation turn" }, { status: 500 });
  }
}
