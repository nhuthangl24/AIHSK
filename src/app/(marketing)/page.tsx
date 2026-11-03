import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (user.role === "TEACHER") {
    redirect("/teacher");
  }

  if (user.role === "ORG_ADMIN") {
    redirect("/organization");
  }

  redirect("/dashboard");
}
