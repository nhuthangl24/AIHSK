import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import SupportClient from "./support-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Yêu Cầu & Hỗ Trợ | Classnia AI HSK",
  description: "Trung tâm tiếp nhận báo lỗi, phản hồi kỹ thuật và góp ý chất lượng Giám khảo AI.",
};

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const initialTickets = assessmentStore.getSupportTicketsByUser(user.userId, user.email);

  return (
    <SupportClient
      user={{
        id: user.userId,
        name: user.name || "Học Viên",
        email: user.email,
        role: user.role,
      }}
      initialTickets={initialTickets}
    />
  );
}
