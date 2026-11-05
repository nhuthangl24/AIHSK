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

    // Clean up
    assessmentStore.deleteSupportTicket(sampleTicket.id);
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

    // Test individual ticket lookup by ID
    const singleLookup = assessmentStore.getSupportTicket(sampleTicket.id);
    expect(singleLookup).not.toBeNull();
    expect(singleLookup?.id).toBe(sampleTicket.id);
    expect(singleLookup?.status).toBe("RESOLVED");

    // Clean up
    assessmentStore.deleteSupportTicket(sampleTicket.id);
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

  it("should ensure seeded tickets are loaded so admin desk reflects learner tickets", () => {
    const allTickets = assessmentStore.getAllSupportTickets();
    expect(allTickets.length).toBeGreaterThanOrEqual(1);

    const realTicket = allTickets.find((t) => t.id === "TK-MW2DBMZY-FN1A");
    expect(realTicket).toBeDefined();
    expect(realTicket?.title).toContain("Test lỗi mic");
  });

  it("should self-heal and update a ticket with fallbackTicket when not in local lambda memory", () => {
    const syntheticId = `TK-SYNTH-${Date.now()}`;
    const fallbackTicket: StoredSupportTicket = {
      id: syntheticId,
      userId: "user_synth_1",
      userEmail: "synth@example.com",
      userName: "Synthetic User",
      category: "BUG",
      priority: "HIGH",
      title: "Phòng thi bị đứng hình",
      description: "Đang thi thì trình duyệt bị treo màn hình xám.",
      status: "OPEN",
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update with fallbackTicket
    const updated = assessmentStore.updateSupportTicket(
      syntheticId,
      { status: "RESOLVED", adminResponse: "Đã khắc phục xong lỗi treo." },
      fallbackTicket
    );

    expect(updated).not.toBeNull();
    expect(updated?.id).toBe(syntheticId);
    expect(updated?.status).toBe("RESOLVED");
    expect(updated?.adminResponse).toBe("Đã khắc phục xong lỗi treo.");

    // And verify it is now stored
    const retrieved = assessmentStore.getSupportTicket(syntheticId);
    expect(retrieved?.status).toBe("RESOLVED");

    // Clean up
    assessmentStore.deleteSupportTicket(syntheticId);
  });

  it("should bulk upsert tickets for multi-instance lambda synchronization", () => {
    const ticketA: StoredSupportTicket = {
      id: `TK-BULK-A-${Date.now()}`,
      userId: "bulk_user_1",
      userEmail: "bulk1@example.com",
      userName: "Bulk Student 1",
      category: "AI_FEEDBACK",
      priority: "MEDIUM",
      title: "Góp ý câu hỏi",
      description: "Chi tiết câu hỏi cần rõ ràng hơn.",
      status: "OPEN",
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ticketB: StoredSupportTicket = {
      id: `TK-BULK-B-${Date.now()}`,
      userId: "bulk_user_2",
      userEmail: "bulk2@example.com",
      userName: "Bulk Student 2",
      category: "FEATURE",
      priority: "LOW",
      title: "Đề xuất thêm tính năng",
      description: "Thêm chế độ tối tự động theo giờ hệ thống.",
      status: "RESOLVED",
      adminResponse: "Đã có trong lộ trình phát triển.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.bulkUpsertTickets([ticketA, ticketB]);

    expect(assessmentStore.getSupportTicket(ticketA.id)).toBeDefined();
    expect(assessmentStore.getSupportTicket(ticketB.id)).toBeDefined();
    expect(assessmentStore.getSupportTicket(ticketB.id)?.status).toBe("RESOLVED");

    // Clean up
    assessmentStore.deleteSupportTicket(ticketA.id);
    assessmentStore.deleteSupportTicket(ticketB.id);
  });
});
