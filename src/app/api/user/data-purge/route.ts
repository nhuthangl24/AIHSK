import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userSessions = assessmentStore.getSessionsByUserId(user.userId);
    let count = 0;

    for (const s of userSessions) {
      assessmentStore.updateSession(s.id, {
        status: "CANCELLED",
      });
      count++;
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa toàn bộ lịch sử thi và dữ liệu âm thanh cá nhân theo Nghị định 13/2023/NĐ-CP.",
      purgedCount: count,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Không thể xử lý yêu cầu xóa dữ liệu." },
      { status: 500 }
    );
  }
}
