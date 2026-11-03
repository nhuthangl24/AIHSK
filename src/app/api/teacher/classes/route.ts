import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== UserRole.TEACHER && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ORG_ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const classes = await prisma.class.findMany({
    where: user.role === UserRole.SUPER_ADMIN ? {} : { teacherId: user.userId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, createdAt: true },
          },
        },
      },
      assignments: {
        include: {
          template: true,
          sessions: {
            include: { user: true, result: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ classes });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== UserRole.TEACHER && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ORG_ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, description, level } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    const code = `ZH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newClass = await prisma.class.create({
      data: {
        teacherId: user.userId,
        name,
        code,
        description,
        level: level || "Intermediate",
      },
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (err: any) {
    console.error("Create class error:", err);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
