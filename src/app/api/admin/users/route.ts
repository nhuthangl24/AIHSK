import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@/types/database";
import { assessmentStore, StoredUserProfile } from "@/lib/db/assessment-store";

function isAuthorizedAdmin(user: any): boolean {
  if (!user) return false;
  return (
    user.role === UserRole.ADMIN ||
    user.role === "ADMIN" ||
    ADMIN_EMAILS.includes(user.email?.toLowerCase().trim())
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const profiles = assessmentStore.getAllProfiles();
  const allSessions = assessmentStore.getAllSessions();

  const enrichedUsers = profiles.map((p) => {
    const email = p.email?.toLowerCase().trim() || "";
    const isAdmin = ADMIN_EMAILS.includes(email);
    
    // Find all sessions belonging to this user
    const userSessions = allSessions.filter(
      (s) =>
        s.userId === p.userId ||
        (email && s.userEmail?.toLowerCase().trim() === email)
    );

    const completed = userSessions.filter((s) => s.status === "COMPLETED");
    const totalScore = completed.reduce((sum, s) => sum + (s.result?.overallScore || 0), 0);
    const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : null;

    return {
      userId: p.userId,
      name: p.name || email.split("@")[0] || "Học Viên",
      email: p.email || "",
      role: isAdmin ? "ADMIN" : "USER",
      targetLevel: p.targetLevel || "HSK 3",
      nativeLanguage: p.nativeLanguage || "vi",
      studyHoursWeekly: p.studyHoursWeekly || 5,
      totalSessions: userSessions.length,
      completedSessions: completed.length,
      avgScore,
      lastActive: p.updatedAt || userSessions[0]?.startedAt || new Date().toISOString(),
    };
  });

  return NextResponse.json({ users: enrichedUsers });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, targetLevel, name } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId là bắt buộc." }, { status: 400 });
    }

    const existing = assessmentStore.getProfile(userId);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng." }, { status: 404 });
    }

    const updated: StoredUserProfile = {
      ...existing,
      ...(targetLevel ? { targetLevel } : {}),
      ...(name ? { name: name.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveProfile(updated);

    return NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ học viên thành công!",
      profile: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi cập nhật người dùng" }, { status: 500 });
  }
}
