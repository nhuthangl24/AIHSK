import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ORG_ADMIN) {
    redirect("/admin");
  }

  redirect("/dashboard");
}
