import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { TeacherSidebar } from "@/components/layout/teacher-sidebar";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== UserRole.TEACHER &&
    user.role !== UserRole.SUPER_ADMIN &&
    user.role !== UserRole.ORG_ADMIN
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-slate-50/60 dark:bg-slate-950">
      <TeacherSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
