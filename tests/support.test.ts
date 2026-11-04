import { describe, it, expect, vi } from "vitest";
import { assessmentStore, StoredSupportTicket } from "@/lib/db/assessment-store";
import { POST as PURGE_POST } from "@/app/api/user/data-purge/route";
import * as sessionModule from "@/lib/auth/session";

describe("Support Ticket System Unit Tests", () => {
  it("should create and retrieve a support ticket by userId and email", () => {
    const testUserId = `user_test_${Date.now()}`;
    const testEmail = `student_${Date.now()}@classnia.id.vn`;

    const sampleTicket: StoredSupportTicket = {
      id: `TK-TEST-${Date.now()}`,
      userId: testUserId,
      userEmail: testEmail,
      userName: "Nguyễn Văn A",
      category: "BUG",
      priority: "HIGH",
      title: "Micro không nhận giọng nói trong phòng thi",
      description: "Tôi bấm nói tiếng Trung nhưng màn hình vẫn hiện đang chờ âm thanh.",
      relatedSessionId: "session_12345",
      deviceInfo: "macOS Chrome 120",
      status: "OPEN",
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveSupportTicket(sampleTicket);

    // Retrieve by userId
    const byUserId = assessmentStore.getSupportTicketsByUser(testUserId);
    expect(byUserId.length).toBeGreaterThanOrEqual(1);
    expect(byUserId[0].id).toBe(sampleTicket.id);
    expect(byUserId[0].category).toBe("BUG");
    expect(byUserId[0].priority).toBe("HIGH");

    // Retrieve by email
    const byEmail = assessmentStore.getSupportTicketsByUser("different_id", testEmail);
    expect(byEmail.length).toBeGreaterThanOrEqual(1);
    expect(byEmail[0].id).toBe(sampleTicket.id);
  });

  it("should update a support ticket status and admin response", () => {
    const testUserId = `user_update_${Date.now()}`;
    const sampleTicket: StoredSupportTicket = {
      id: `TK-UPDATE-${Date.now()}`,
      userId: testUserId,
      userEmail: "learner@test.com",
      userName: "Trần Thị B",
      category: "AI_FEEDBACK",
      priority: "MEDIUM",
      title: "Góp ý câu hỏi Chặng 3",
      description: "Câu hỏi này nên có thêm pinyin cho từ chuyên ngành.",
      status: "OPEN",
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveSupportTicket(sampleTicket);

    // Now update ticket with admin response and resolved status
    const updatedTicket: StoredSupportTicket = {
      ...sampleTicket,
      status: "RESOLVED",
      adminResponse: "Cảm ơn bạn! Chúng tôi đã cập nhật thêm chú âm Pinyin.",
      updatedAt: new Date().toISOString(),
    };
    assessmentStore.saveSupportTicket(updatedTicket);

    const userTickets = assessmentStore.getSupportTicketsByUser(testUserId);
    expect(userTickets[0].status).toBe("RESOLVED");
    expect(userTickets[0].adminResponse).toContain("Cảm ơn bạn!");
  });

  it("should process user data purge request conforming to Decree 13 and GDPR Right to be Forgotten", async () => {
    const purgeUserId = `purge_user_${Date.now()}`;
    vi.spyOn(sessionModule, "getCurrentUser").mockResolvedValueOnce({
      userId: purgeUserId,
      name: "Purge Student",
      email: "purge@classnia.id.vn",
      role: "USER" as any,
    });

    const res = await PURGE_POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("Nghị định 13/2023/NĐ-CP");
  });
});
