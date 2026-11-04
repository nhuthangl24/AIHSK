import { assessmentStore } from "@/lib/db/assessment-store";
import { SupportTicketsClient } from "./support-tickets-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSupportPage() {
  const tickets = assessmentStore.getAllSupportTickets();

  return <SupportTicketsClient initialTickets={tickets} />;
}
