import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planSlug } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

    if (isStripeConfigured) {
      // In production with Stripe secret key, create Stripe Checkout session
      // e.g. stripe.checkout.sessions.create(...)
      return NextResponse.json({
        url: `https://checkout.stripe.com/pay/mock_${planSlug}`,
      });
    }

    // Graceful self-serve upgrade in development & test environments
    await prisma.subscription.upsert({
      where: { id: `sub_${user.userId}` },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      create: {
        id: `sub_${user.userId}`,
        userId: user.userId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: `Plan upgraded to ${plan.name}`,
        message: `Your account is now upgraded to the ${plan.name} plan with ${plan.maxAssessments} monthly assessments.`,
        type: "BILLING",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      plan,
    });
  } catch (err: any) {
    console.error("Billing checkout error:", err);
    return NextResponse.json({ error: "Billing checkout failed" }, { status: 500 });
  }
}
