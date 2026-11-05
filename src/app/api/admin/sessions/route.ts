import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAuthorizedAdmin } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const level = searchParams.get("level");
  const search = searchParams.get("search")?.toLowerCase().trim();

  let sessions = assessmentStore.getAllSessions();

  if (status && status !== "ALL") {
    sessions = sessions.filter((s) => s.status === status);
  }

  if (level && level !== "ALL") {
    sessions = sessions.filter(
      (s) => s.template?.targetLevel === level || s.result?.hskLevel === level
    );
  }

  if (search) {
    sessions = sessions.filter(
      (s) =>
        s.id.toLowerCase().includes(search) ||
        (s.userEmail && s.userEmail.toLowerCase().includes(search)) ||
        (s.userId && s.userId.toLowerCase().includes(search)) ||
        (s.template?.title && s.template.title.toLowerCase().includes(search))
    );
  }

  // Sort newest first
  sessions.sort(
    (a, b) =>
      new Date(b.createdAt || b.startedAt || 0).getTime() -
      new Date(a.createdAt || a.startedAt || 0).getTime()
  );

  const completed = sessions.filter((s) => s.status === "COMPLETED");
  const totalScore = completed.reduce((sum, s) => sum + (s.result?.overallScore || 0), 0);
  const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
  const passedCount = completed.filter((s) => s.result?.passingStatus !== false).length;

  const stats = {
    total: sessions.length,
    completed: completed.length,
    inProgress: sessions.filter((s) => s.status === "IN_PROGRESS").length,
    avgScore,
    passRate: completed.length > 0 ? Math.round((passedCount / completed.length) * 100) : 0,
  };

  return NextResponse.json({ sessions, stats });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mã phiên khảo thí là bắt buộc." }, { status: 400 });
  }

  const deleted = assessmentStore.deleteSession(id);
  if (!deleted) {
    return NextResponse.json({ error: "Không tìm thấy phiên khảo thí để xóa." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Đã xóa phiên khảo thí #${id}.` });
}
