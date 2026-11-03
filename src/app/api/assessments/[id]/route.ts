import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const session = await AssessmentService.getSessionWithReport(id, user.userId);

  if (!session) {
    return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
