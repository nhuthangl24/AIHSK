import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { ScoringWorker } from "@/lib/queue/scoring-worker";
import { ReportRecovery } from "@/components/reports/report-recovery";
import { AssessmentReportView } from "@/components/reports/assessment-report-view";

export const dynamic = "force-dynamic";

export default async function AssessmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  let session: any = null;
  try {
    session = await AssessmentService.getSessionWithReport(id, user?.userId || "");
  } catch {
    session = null;
  }

  // Auto-recovery: If session exists but has no result yet, guarantee scoring completion
  if (session && !session.result) {
    try {
      await ScoringWorker.ensureSessionScored(id);
      session = await AssessmentService.getSessionWithReport(id, user?.userId || "");
    } catch (err) {
      console.error("Auto-recovery scoring error:", err);
    }
  }

  // If session is missing or still has no result on the server, delegate to ReportRecovery
  // ReportRecovery will check localStorage, sync with API, and display the report in-place
  if (!session || !session.result) {
    return <ReportRecovery sessionId={id} />;
  }

  return <AssessmentReportView session={session} user={user} />;
}
