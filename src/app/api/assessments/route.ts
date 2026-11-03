import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { STAGES_CONFIG } from "@/lib/ai/examiner-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [templates, sessions] = await Promise.all([
    prisma.assessmentTemplate.findMany({
      where: { isActive: true, isPublic: true },
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
    const { templateId, assignmentId, customTopic, targetLevel } = await req.json();

    // Custom / Free Topic Creation
    if (customTopic && typeof customTopic === "string" && customTopic.trim().length > 0) {
      const topicName = customTopic.trim();
      const level = targetLevel || "HSK 3";
      const slug = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Create a dynamic template for this custom topic
      const customTemplate = await prisma.assessmentTemplate.create({
        data: {
          title: topicName,
          slug,
          description: `Bài khảo thí khẩu ngữ chủ đề tự do: ${topicName}`,
          category: "GENERAL",
          targetLevel: level,
          estimatedDurationMinutes: 15,
          maxTurns: 10,
          stagesConfig: STAGES_CONFIG as any,
          examinerPrompt: `Conduct a 5-stage adaptive oral examination focused on the custom topic: ${topicName}`,
          isActive: true,
          isPublic: false,
          createdById: user.userId,
        },
      });

      const session = await AssessmentService.startSession(user.userId, customTemplate.id, assignmentId);
      return NextResponse.json({ success: true, session });
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Vui lòng chọn bài thi mẫu hoặc nhập chủ đề tự chọn (templateId or customTopic required)" },
        { status: 400 }
      );
    }

    const session = await AssessmentService.startSession(user.userId, templateId, assignmentId);
    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    console.error("Start assessment error:", err);
    return NextResponse.json({ error: err.message || "Failed to start assessment" }, { status: 500 });
  }
}
