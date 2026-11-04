import { assessmentStore } from "@/lib/db/assessment-store";
import { TemplatesClient } from "./templates-client";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const templates = assessmentStore.getAllTemplates();

  return <TemplatesClient initialTemplates={templates} />;
}
