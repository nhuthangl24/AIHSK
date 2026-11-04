import { assessmentStore } from "@/lib/db/assessment-store";
import { ADMIN_EMAILS } from "@/lib/auth/session";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const profiles = assessmentStore.getAllProfiles();
  const allSessions = assessmentStore.getAllSessions();

  const enrichedUsers = profiles.map((p) => {
    const email = p.email?.toLowerCase().trim() || "";
    const isAdmin = ADMIN_EMAILS.includes(email);

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
      role: (isAdmin ? "ADMIN" : "USER") as "ADMIN" | "USER",
      targetLevel: p.targetLevel || "HSK 3",
      nativeLanguage: p.nativeLanguage || "vi",
      studyHoursWeekly: p.studyHoursWeekly || 5,
      totalSessions: userSessions.length,
      completedSessions: completed.length,
      avgScore,
      lastActive: p.updatedAt || userSessions[0]?.startedAt || new Date().toISOString(),
    };
  });

  return <UsersClient initialUsers={enrichedUsers} />;
}
