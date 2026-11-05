import { redirect } from "next/navigation";
import { getCurrentUser, isAuthorizedAdmin } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import AdminSupportClient from "./admin-support-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Yêu Cầu & Báo Lỗi Học Viên | Admin Classnia",
};

export default async function AdminSupportPage() {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    redirect("/login");
  }

  const tickets = assessmentStore.getAllSupportTickets();

  return (
    <AdminSupportClient
      initialTickets={tickets}
      user={{
        name: user!.name || "Admin",
        email: user!.email,
        role: user!.role,
      }}
    />
  );
}
