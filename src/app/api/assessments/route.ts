import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [templates, sessions] = await Promise.all([
    prisma.assessmentTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assessmentSession.findMany({
      where: { userId: user.userId },
      include: {
        template: true,
        result: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ templates, sessions });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { templateId, assignmentId } = await req.json();
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    const session = await AssessmentService.startSession(user.userId, templateId, assignmentId);
    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    console.error("Start assessment error:", err);
    return NextResponse.json({ error: err.message || "Failed to start assessment" }, { status: 500 });
  }
}
