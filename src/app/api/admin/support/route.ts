import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAuthorizedAdmin } from "@/lib/auth/session";
import { assessmentStore, StoredSupportTicket } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  // Attempt to merge from Firestore if cloud tickets exist
  try {
    const fbTickets = await FirebaseDb.getAllTickets();
    if (Array.isArray(fbTickets) && fbTickets.length > 0) {
      assessmentStore.bulkUpsertTickets(fbTickets as StoredSupportTicket[]);
    }
  } catch {}

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

  const allTickets = assessmentStore.getAllSupportTickets();
  const stats = {
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === "OPEN").length,
    inProgress: allTickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: allTickets.filter((t) => t.status === "RESOLVED").length,
    closed: allTickets.filter((t) => t.status === "CLOSED").length,
  };

  return NextResponse.json({ tickets, stats }, { headers: NO_CACHE_HEADERS });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const { tickets: incomingTickets } = body;

    if (Array.isArray(incomingTickets) && incomingTickets.length > 0) {
      assessmentStore.bulkUpsertTickets(incomingTickets);
    }

    const all = assessmentStore.getAllSupportTickets();
    return NextResponse.json({ success: true, tickets: all }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi đồng bộ danh sách yêu cầu" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const { id: rawId, ticketId, status, adminResponse, priority, fallbackTicket } = body;
    // Accept both "id" and "ticketId" for backward compat with older client
    const id = rawId || ticketId;

    if (!id) {
      return NextResponse.json({ error: "Mã yêu cầu (id) là bắt buộc." }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (typeof adminResponse === "string") updates.adminResponse = adminResponse.trim();
    if (priority) updates.priority = priority;

    const updated = assessmentStore.updateSupportTicket(id, updates, fallbackTicket);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu hỗ trợ tương ứng." }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Background cloud sync
    try {
      FirebaseDb.updateTicket(id, { ...updates, updatedAt: updated.updatedAt });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: `Đã cập nhật yêu cầu #${id} thành công!`,
        ticket: updated,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi cập nhật yêu cầu" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAuthorizedAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mã yêu cầu là bắt buộc." }, { status: 400, headers: NO_CACHE_HEADERS });
  }

  const deleted = assessmentStore.deleteSupportTicket(id);
  if (!deleted) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu để xóa." }, { status: 404, headers: NO_CACHE_HEADERS });
  }

  return NextResponse.json({ success: true, message: `Đã xóa yêu cầu #${id}.` }, { headers: NO_CACHE_HEADERS });
}
