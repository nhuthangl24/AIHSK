import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@/types/database";
import { assessmentStore } from "@/lib/db/assessment-store";

function isAuthorizedAdmin(user: any): boolean {
  if (!user) return false;
  return (
    user.role === UserRole.ADMIN ||
    user.role === "ADMIN" ||
    ADMIN_EMAILS.includes(user.email?.toLowerCase().trim())
  );
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase().trim();

  let tickets = assessmentStore.getAllSupportTickets();

  if (status && status !== "ALL") {
    tickets = tickets.filter((t) => t.status === status);
  }

  if (category && category !== "ALL") {
    tickets = tickets.filter((t) => t.category === category);
  }

  if (search) {
    tickets = tickets.filter(
      (t) =>
        t.id.toLowerCase().includes(search) ||
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.userEmail.toLowerCase().includes(search) ||
        t.userName.toLowerCase().includes(search) ||
        (t.relatedSessionId && t.relatedSessionId.toLowerCase().includes(search))
    );
  }

  const stats = {
    total: assessmentStore.getAllSupportTickets().length,
    open: assessmentStore.getAllSupportTickets().filter((t) => t.status === "OPEN").length,
    inProgress: assessmentStore.getAllSupportTickets().filter((t) => t.status === "IN_PROGRESS").length,
    resolved: assessmentStore.getAllSupportTickets().filter((t) => t.status === "RESOLVED").length,
    closed: assessmentStore.getAllSupportTickets().filter((t) => t.status === "CLOSED").length,
  };

  return NextResponse.json({ tickets, stats });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, adminResponse } = body;

    if (!id) {
      return NextResponse.json({ error: "Mã yêu cầu (id) là bắt buộc." }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (typeof adminResponse === "string") updates.adminResponse = adminResponse.trim();

    const updated = assessmentStore.updateSupportTicket(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu hỗ trợ tương ứng." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật yêu cầu #${id} thành công!`,
      ticket: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi cập nhật yêu cầu" }, { status: 500 });
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
    return NextResponse.json({ error: "Mã yêu cầu là bắt buộc." }, { status: 400 });
  }

  const deleted = assessmentStore.deleteSupportTicket(id);
  if (!deleted) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu để xóa." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Đã xóa yêu cầu #${id}.` });
}
