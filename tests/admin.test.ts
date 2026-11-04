import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { assessmentStore, StoredSupportTicket, StoredTemplate } from "@/lib/db/assessment-store";
import * as sessionModule from "@/lib/auth/session";
import { GET as SUPPORT_GET, PATCH as SUPPORT_PATCH } from "@/app/api/admin/support/route";
import { GET as SESSIONS_GET } from "@/app/api/admin/sessions/route";
import { GET as TEMPLATES_GET, POST as TEMPLATES_POST, PUT as TEMPLATES_PUT } from "@/app/api/admin/templates/route";
import { GET as USERS_GET } from "@/app/api/admin/users/route";
import { GET as JOBS_GET } from "@/app/api/admin/jobs/route";

describe("Admin Portal API Suite", () => {
  beforeEach(() => {
    vi.spyOn(sessionModule, "getCurrentUser").mockResolvedValue({
      userId: "admin_test_123",
      email: "superadmin@aihsk.com",
      role: "ADMIN",
      name: "Super Admin",
    });
  });

  it("should fetch all support tickets and allow admin to update ticket status", async () => {
    const ticketId = `TK-ADM-${Date.now()}`;
    const testTicket: StoredSupportTicket = {
      id: ticketId,
      userId: "user_test_99",
      userEmail: "test99@example.com",
      userName: "Học viên Test",
      category: "BUG",
      priority: "URGENT",
      title: "Lỗi âm thanh bài thi HSK 4",
      description: "Âm thanh không phản hồi khi nói vào micro.",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assessmentStore.saveSupportTicket(testTicket);

    // Test GET /api/admin/support
    const getReq = new NextRequest("http://localhost:3000/api/admin/support");
    const getRes = await SUPPORT_GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.tickets).toBeDefined();
    expect(getData.stats).toBeDefined();

    // Test PATCH /api/admin/support
    const patchReq = new NextRequest("http://localhost:3000/api/admin/support", {
      method: "PATCH",
      body: JSON.stringify({
        id: ticketId,
        status: "RESOLVED",
        adminResponse: "Đã xử lý cấu hình âm thanh cho tài khoản của bạn.",
      }),
    });
    const patchRes = await SUPPORT_PATCH(patchReq);
    expect(patchRes.status).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.ticket.status).toBe("RESOLVED");
    expect(patchData.ticket.adminResponse).toContain("Đã xử lý");
  });

  it("should fetch exam sessions and calculate metrics", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/sessions");
    const res = await SESSIONS_GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.sessions)).toBe(true);
    expect(data.stats).toBeDefined();
    expect(typeof data.stats.total).toBe("number");
  });

  it("should manage exam templates (GET, POST, PUT)", async () => {
    // 1. GET templates
    const getRes = await TEMPLATES_GET();
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.templates.length).toBeGreaterThan(0);

    // 2. POST create new template
    const postReq = new NextRequest("http://localhost:3000/api/admin/templates", {
      method: "POST",
      body: JSON.stringify({
        title: `Đề Thi Khảo Thí Test ${Date.now()}`,
        targetLevel: "HSK 4",
        description: "Mô tả đề thi khảo thí thử nghiệm",
        estimatedDurationMinutes: 15,
        maxTurns: 16,
        examinerPrompt: "Test examiner prompt",
      }),
    });
    const postRes = await TEMPLATES_POST(postReq);
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.template.id).toBeDefined();

    // 3. PUT update template
    const putReq = new NextRequest("http://localhost:3000/api/admin/templates", {
      method: "PUT",
      body: JSON.stringify({
        id: postData.template.id,
        title: "Đề Thi Khảo Thí Đã Sửa",
        isActive: false,
      }),
    });
    const putRes = await TEMPLATES_PUT(putReq);
    expect(putRes.status).toBe(200);
    const putData = await putRes.json();
    expect(putData.template.title).toBe("Đề Thi Khảo Thí Đã Sửa");
    expect(putData.template.isActive).toBe(false);
  });

  it("should fetch users list with enriched session statistics", async () => {
    const res = await USERS_GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.users)).toBe(true);
  });

  it("should return system diagnostics and jobs status", async () => {
    const res = await JOBS_GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.health).toBeDefined();
    expect(data.health.memory).toBeDefined();
    expect(data.health.storage).toBeDefined();
    expect(Array.isArray(data.jobs)).toBe(true);
  });
});
