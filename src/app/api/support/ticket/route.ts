import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore, StoredSupportTicket } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  // Attempt to merge from Firestore if any cloud tickets exist for this user
  try {
    const fbTickets = await FirebaseDb.getTicketsByUser(user.userId, user.email);
    if (Array.isArray(fbTickets) && fbTickets.length > 0) {
      assessmentStore.bulkUpsertTickets(fbTickets as StoredSupportTicket[]);
    }
  } catch {}

  const tickets = assessmentStore.getSupportTicketsByUser(user.userId, user.email);
  return NextResponse.json({ tickets }, { headers: NO_CACHE_HEADERS });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 1. Check if this is a client sync request
    if (body.action === "sync" || Array.isArray(body.localTickets)) {
      if (Array.isArray(body.localTickets) && body.localTickets.length > 0) {
        // Only accept tickets belonging to this user
        const userLocalTickets = body.localTickets.filter(
          (t: StoredSupportTicket) =>
            t.userId === user.userId ||
            (user.email && t.userEmail?.toLowerCase() === user.email.toLowerCase())
        );
        assessmentStore.bulkUpsertTickets(userLocalTickets);
      }
      const refreshedTickets = assessmentStore.getSupportTicketsByUser(user.userId, user.email);
      return NextResponse.json({ success: true, tickets: refreshedTickets }, { headers: NO_CACHE_HEADERS });
    }

    // 2. Otherwise create a new ticket
    const { category, priority, title, description, relatedSessionId, deviceInfo } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Vui lòng nhập tiêu đề yêu cầu rõ ràng (tối thiểu 3 ký tự)." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 8) {
      return NextResponse.json(
        { error: "Vui lòng mô tả chi tiết vấn đề hoặc góp ý (tối thiểu 8 ký tự)." },
        { status: 400 }
      );
    }

    const validCategories = ["BUG", "AI_FEEDBACK", "FEATURE", "ACCOUNT", "OTHER"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    const cleanCategory = validCategories.includes(category) ? category : "BUG";
    const cleanPriority = validPriorities.includes(priority) ? priority : "MEDIUM";

    const timestamp = Date.now();
    const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketId = `TK-${timestamp.toString(36).toUpperCase()}-${shortCode}`;

    const newTicket: StoredSupportTicket = {
      id: ticketId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name || "Học Viên",
      category: cleanCategory,
      priority: cleanPriority,
      title: title.trim(),
      description: description.trim(),
      relatedSessionId: relatedSessionId?.trim() || null,
      deviceInfo: deviceInfo?.trim() || null,
      status: "OPEN",
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveSupportTicket(newTicket);

    // Background cloud sync
    try {
      FirebaseDb.saveTicket(newTicket);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Đã tiếp nhận yêu cầu hỗ trợ mã #${ticketId}. Đội ngũ kỹ thuật Classnia AI sẽ phản hồi sớm nhất!`,
      ticket: newTicket,
    });
  } catch (err: any) {
    console.error("Support ticket error:", err);
    return NextResponse.json(
      { error: err.message || "Không thể tạo yêu cầu hỗ trợ" },
      { status: 500 }
    );
  }
}
