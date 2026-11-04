import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [templates, sessions] = await Promise.all([
      AssessmentService.getTemplates(),
      AssessmentService.getUserSessions(user.userId),
    ]);

    return NextResponse.json({ templates, sessions });
  } catch (err: any) {
    console.error("GET /api/assessments error:", err);
    return NextResponse.json({ templates: [], sessions: [] });
  }
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

      const customTemplate = await AssessmentService.createCustomTemplate(
        topicName,
        level,
        user.userId
      );

      const session = await AssessmentService.startSession(
        user.userId,
        customTemplate.id,
        assignmentId
      );

      return NextResponse.json({ success: true, session });
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Vui lòng chọn bài thi mẫu hoặc nhập chủ đề tự chọn (templateId or customTopic required)" },
        { status: 400 }
      );
    }

    const session = await AssessmentService.startSession(
      user.userId,
      templateId,
      assignmentId
    );

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    console.error("Start assessment error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to start assessment" },
      { status: 500 }
    );
  }
}
