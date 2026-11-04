import { assessmentStore } from "@/lib/db/assessment-store";
import { SessionsClient } from "./sessions-client";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = assessmentStore.getAllSessions();

  return <SessionsClient initialSessions={sessions} />;
}
