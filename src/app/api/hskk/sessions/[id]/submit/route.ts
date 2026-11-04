import { NextRequest, NextResponse } from "next/server";
import { HskkService } from "@/lib/ai/hskk-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const answers = body?.answers;

    const result = await HskkService.evaluateSession(id, answers);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Session not found or evaluation failed" },
        { status: 404 }
      );
    }
    const session = HskkService.getSession(id);
    return NextResponse.json({ success: true, result, session });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to evaluate HSKK session" },
      { status: 500 }
    );
  }
}
