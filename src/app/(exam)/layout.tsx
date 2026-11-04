import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 m-0 p-0 fixed inset-0">
      {children}
    </div>
  );
}
