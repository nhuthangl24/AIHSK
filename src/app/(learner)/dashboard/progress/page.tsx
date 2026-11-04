import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser, getUserProfileCookie } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { assessmentStore } from "@/lib/db/assessment-store";
import { ProgressClient } from "@/components/progress/progress-client";

export const dynamic = "force-dynamic";

export default async function LearningProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [sessions, profile] = await Promise.all([
    (async () => {
      try {
        const list = await AssessmentService.getUserSessions(user.userId, user.email);
        return (list || []).filter((s: any) => s && (s.result || s.status === "COMPLETED"));
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        const cookieStore = await cookies();
        const profileCookie = getUserProfileCookie(cookieStore);
        if (profileCookie) {
          return {
            targetLevel: profileCookie.targetLevel || "HSK 3",
            name: profileCookie.name || user.name,
            email: user.email,
          };
        }
      } catch {
        // cookies read safe fallback
      }

      try {
        const stored = assessmentStore.getProfile(user.userId) || assessmentStore.getProfile(user.email);
        if (stored) {
          return {
            targetLevel: stored.targetLevel || "HSK 3",
            name: stored.name || user.name,
            email: user.email,
          };
        }
      } catch {
        // assessmentStore safe fallback
      }

      try {
        const { FirebaseDb } = await import("@/lib/firebase-db");
        const fb =
          (await FirebaseDb.findUserById(user.userId)) ||
          (await FirebaseDb.findUserByEmail(user.email));
        if (fb) {
          return {
            targetLevel: fb.targetLevel || "HSK 3",
            name: fb.name,
            email: fb.email,
          };
        }
      } catch {
        // ignore
      }
      return null;
    })(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tiến Độ Khẩu Ngữ Tiếng Trung
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Theo dõi mức độ cải thiện điểm số thực tế theo thời gian, sự chuẩn hóa thanh điệu và vốn từ vựng tích lũy qua các kỳ khảo thí.
        </p>
      </div>

      <ProgressClient initialSessions={sessions} initialProfile={profile} />
    </div>
  );
}
