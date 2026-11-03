import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { OrgSidebar } from "@/components/layout/org-sidebar";

export const dynamic = "force-dynamic";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== UserRole.ORG_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-slate-50/60 dark:bg-slate-950">
      <OrgSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
