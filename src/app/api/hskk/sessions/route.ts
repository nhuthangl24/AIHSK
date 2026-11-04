import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { HskkService } from "@/lib/ai/hskk-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));

    const userId = user?.userId || body.userId || `guest_${Date.now()}`;
    const userEmail = user?.email || body.userEmail || "learner@aihsk.com";
    const userName = user?.name || body.userName || "Học Viên HSKK";
    const templateId = body.templateId || "hskk-intermediate-std-1";
    const mode = body.mode || "OFFICIAL";

    const session = HskkService.createSession({
      userId,
      userEmail,
      userName,
      templateId,
      mode,
    });

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create HSKK session" },
      { status: 500 }
    );
  }
}
