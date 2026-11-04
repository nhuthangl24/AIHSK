import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { ScoringWorker } from "@/lib/queue/scoring-worker";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let session = await AssessmentService.getSessionWithReport(id, user.userId);

  if (!session) {
    return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  }

  // Auto-recovery: If session is in PROCESSING status and has no result yet, guarantee scoring completion
  if (session.status === "PROCESSING" && !session.result) {
    try {
      await ScoringWorker.ensureSessionScored(id);
      const scoredSession = await AssessmentService.getSessionWithReport(id, user.userId);
      if (scoredSession) {
        session = scoredSession;
      }
    } catch (err) {
      console.error("Auto-recovery scoring error:", err);
    }
  }

  return NextResponse.json({ session });
}

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
    const body = await req.json();
    const sessionData = body.session || body.sessionSnapshot || body;
    if (sessionData && (sessionData.id === id || !sessionData.id)) {
      sessionData.id = id;
      await AssessmentService.restoreOrSyncSession(sessionData, user.userId);
      // Ensure scoring is completed and result is populated
      await ScoringWorker.ensureSessionScored(id);
      const session = await AssessmentService.getSessionWithReport(id, user.userId);
      return NextResponse.json({ success: true, session });
    }
    return NextResponse.json({ error: "Invalid session sync payload" }, { status: 400 });
  } catch (err: any) {
    console.error("Session sync error:", err);
    return NextResponse.json({ error: err.message || "Failed to sync session" }, { status: 500 });
  }
}
