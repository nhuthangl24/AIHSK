import { NextRequest, NextResponse } from "next/server";
import { HskkService } from "@/lib/ai/hskk-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = HskkService.getSession(id);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "HSKK session not found" },
        { status: 404 }
      );
    }
    const template = HskkService.getTemplateById(session.templateId);
    return NextResponse.json({ success: true, session, template });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { questionId, answer } = body;
    if (!questionId || !answer) {
      return NextResponse.json(
        { success: false, error: "Missing questionId or answer data" },
        { status: 400 }
      );
    }

    const updated = HskkService.saveAnswer(id, questionId, answer);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "HSKK session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save answer" },
      { status: 500 }
    );
  }
}
