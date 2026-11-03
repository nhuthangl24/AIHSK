import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
      <a
        href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
        className="flex items-center gap-2.5 mb-8 group hover:opacity-90 transition-opacity"
        title="Về Classnia.id.vn"
      >
        <BrandLogo size={42} />
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Classnia <span className="text-rose-600">AI</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 tracking-wider -mt-1">
            华语考官 · 口语智能评测
          </span>
        </div>
      </a>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
