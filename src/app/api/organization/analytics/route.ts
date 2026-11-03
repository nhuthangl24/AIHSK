import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find user's organization
  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.userId },
    include: { organization: true },
  });

  if (!membership && user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ error: "No organization found for user" }, { status: 404 });
  }

  const orgId = membership?.organizationId;

  const [members, classes, totalAssessments, results] = await Promise.all([
    prisma.organizationMember.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
      },
    }),
    prisma.class.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: {
        members: true,
        teacher: { select: { name: true, email: true } },
      },
    }),
    prisma.assessmentSession.count({
      where: { status: "COMPLETED" },
    }),
    prisma.assessmentResult.findMany({
      select: { overallScore: true },
      take: 100,
    }),
  ]);

  const avgScore =
    results.length > 0
      ? results.reduce((acc, r) => acc + r.overallScore, 0) / results.length
      : 80.0;

  return NextResponse.json({
    organization: membership?.organization || {
      name: "Global Platform Tenant",
      maxSeats: 500,
      maxAssessmentsPerMonth: 2500,
    },
    stats: {
      totalMembers: members.length,
      totalClasses: classes.length,
      totalAssessmentsCompleted: totalAssessments,
      averageScore: Math.round(avgScore * 10) / 10,
      seatsUsed: members.length,
      seatsLimit: membership?.organization.maxSeats || 250,
    },
    members,
    classes,
  });
}
