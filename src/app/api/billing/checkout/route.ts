import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planSlug } = await req.json();

    const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

    if (isStripeConfigured) {
      return NextResponse.json({
        url: `https://checkout.stripe.com/pay/mock_${planSlug || "pro"}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã nâng cấp gói ${planSlug || "Pro"} thành công.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
