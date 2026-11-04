import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
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

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <MarketingHeader
        initialUser={
          user
            ? {
                id: user.userId,
                name: user.name || "Học Viên",
                email: user.email,
                role: user.role,
              }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
