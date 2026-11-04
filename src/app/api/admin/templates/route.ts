import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@/types/database";
import { assessmentStore, StoredTemplate } from "@/lib/db/assessment-store";
import { STAGES_CONFIG } from "@/lib/ai/examiner-service";

function isAuthorizedAdmin(user: any): boolean {
  if (!user) return false;
  return (
    user.role === UserRole.ADMIN ||
    user.role === "ADMIN" ||
    ADMIN_EMAILS.includes(user.email?.toLowerCase().trim())
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const templates = assessmentStore.getAllTemplates();
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      targetLevel,
      category = "HSK_ORIENTED",
      estimatedDurationMinutes = 15,
      maxTurns = 18,
      examinerPrompt,
      isActive = true,
      isPublic = true,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ error: "Tiêu đề mẫu đề tối thiểu 3 ký tự." }, { status: 400 });
    }

    const id = `tpl-${Date.now().toString(36)}`;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newTemplate: StoredTemplate = {
      id,
      title: title.trim(),
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      description: description?.trim() || "Bài thi khảo thí khẩu ngữ tiếng Trung chuẩn HSKK.",
      category: category || "HSK_ORIENTED",
      targetLevel: targetLevel || "HSK 3",
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 15,
      maxTurns: Number(maxTurns) || 18,
      stagesConfig: STAGES_CONFIG,
      examinerPrompt: examinerPrompt?.trim() || `Conduct a professional HSKK oral assessment for ${targetLevel} candidates.`,
      rubricId: "rubric-standard-v1",
      isActive: Boolean(isActive),
      isPublic: Boolean(isPublic),
      createdById: user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveTemplate(newTemplate);

    return NextResponse.json({
      success: true,
      message: `Đã tạo mẫu đề "${newTemplate.title}" thành công!`,
      template: newTemplate,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Không thể tạo mẫu đề" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, title, description, targetLevel, category, estimatedDurationMinutes, maxTurns, examinerPrompt, isActive, isPublic } = body;

    if (!id) {
      return NextResponse.json({ error: "Mã mẫu đề (id) là bắt buộc." }, { status: 400 });
    }

    const existing = assessmentStore.getTemplate(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy mẫu đề." }, { status: 404 });
    }

    const updated: StoredTemplate = {
      ...existing,
      ...(title ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(targetLevel ? { targetLevel } : {}),
      ...(category ? { category } : {}),
      ...(estimatedDurationMinutes ? { estimatedDurationMinutes: Number(estimatedDurationMinutes) } : {}),
      ...(maxTurns ? { maxTurns: Number(maxTurns) } : {}),
      ...(examinerPrompt !== undefined ? { examinerPrompt: examinerPrompt.trim() } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      ...(isPublic !== undefined ? { isPublic: Boolean(isPublic) } : {}),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveTemplate(updated);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật mẫu đề "${updated.title}" thành công!`,
      template: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Không thể cập nhật mẫu đề" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mã mẫu đề là bắt buộc." }, { status: 400 });
  }

  const deleted = assessmentStore.deleteTemplate(id);
  if (!deleted) {
    return NextResponse.json({ error: "Không thể xóa mẫu đề." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Đã xóa mẫu đề #${id}.` });
}
