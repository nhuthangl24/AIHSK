import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== UserRole.TEACHER && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ORG_ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { classId, templateId, title, instructions, dueDate } = await req.json();

    if (!classId || !templateId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assignment = await prisma.assessmentAssignment.create({
      data: {
        classId,
        templateId,
        assignedById: user.userId,
        title,
        instructions,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Notify all enrolled students
    const members = await prisma.classMember.findMany({
      where: { classId },
    });

    for (const m of members) {
      await prisma.notification.create({
        data: {
          userId: m.userId,
          title: `New Oral Assessment: ${title}`,
          message: instructions || "A new oral assessment has been assigned to your class.",
          type: "ASSIGNMENT",
          linkUrl: "/dashboard",
        },
      });
    }

    return NextResponse.json({ success: true, assignment });
  } catch (err: any) {
    console.error("Assignment create error:", err);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
