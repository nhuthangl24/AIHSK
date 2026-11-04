import { NextRequest, NextResponse } from "next/server";
import { HskkService, HSKK_TEMPLATES } from "@/lib/ai/hskk-service";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser().catch(() => null);

    let session = HskkService.getSession(id, user?.userId, user?.email, user?.name);
    if (!session) {
      session = HskkService.selfHealSession(id, user?.userId, user?.email, user?.name);
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: "HSKK session not found" },
        { status: 404 }
      );
    }
    const template = HskkService.getTemplateById(session.templateId) || HSKK_TEMPLATES[1];
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
