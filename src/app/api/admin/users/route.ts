import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAuthorizedAdmin } from "@/lib/auth/session";
import { AdminService } from "@/lib/admin/admin-service";
import { assessmentStore, StoredUserProfile } from "@/lib/db/assessment-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const enrichedUsers = await AdminService.getEnrichedUsers();
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

    const existing = assessmentStore.getProfile(userId) || {
      userId,
      targetLevel: "HSK 3",
      nativeLanguage: "Tiếng Việt",
      studyHoursWeekly: 3,
      updatedAt: new Date().toISOString(),
    };

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
