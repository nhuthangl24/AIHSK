import { describe, it, expect, beforeEach } from "vitest";
import { HskkService, HSKK_TEMPLATES } from "@/lib/ai/hskk-service";
import { assessmentStore } from "@/lib/db/assessment-store";

describe("HSKK (汉语水平口语考试) Exam System Unit Tests", () => {
  beforeEach(() => {
    assessmentStore.init();
  });

  describe("HSKK Template Specifications & Rubrics", () => {
    it("should provide official templates for all 3 levels (Sơ cấp, Trung cấp, Cao cấp)", () => {
      const templates = HskkService.getTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(3);

      const levels = templates.map((t) => t.level);
      expect(levels).toContain("HSKK_PRIMARY");
      expect(levels).toContain("HSKK_INTERMEDIATE");
      expect(levels).toContain("HSKK_ADVANCED");
    });

    it("should strictly adhere to HSKK Primary (Sơ cấp) structure (27 questions, 100 max score)", () => {
      const pri = HskkService.getTemplateById("hskk-primary-std-1");
      expect(pri).toBeDefined();
      expect(pri?.totalQuestions).toBe(27);
      expect(pri?.parts.length).toBe(3);

      // Part 1: 15 questions, Part 2: 10 questions, Part 3: 2 questions
      expect(pri?.parts[0].questionCount).toBe(15);
      expect(pri?.parts[1].questionCount).toBe(10);
      expect(pri?.parts[2].questionCount).toBe(2);

      const totalPartScore = pri?.parts.reduce((acc, p) => acc + p.maxScore, 0);
      expect(totalPartScore).toBe(100);
    });

    it("should strictly adhere to HSKK Intermediate (Trung cấp) structure (14 questions, 2 pictures, 100 max score)", () => {
      const mid = HskkService.getTemplateById("hskk-intermediate-std-1");
      expect(mid).toBeDefined();
      expect(mid?.totalQuestions).toBe(14);
      expect(mid?.parts.length).toBe(3);

      // Part 1: 10 questions (30 pts)
      expect(mid?.parts[0].questionCount).toBe(10);
      expect(mid?.parts[0].maxScore).toBe(30);

      // Part 2: 2 pictures (40 pts)
      expect(mid?.parts[1].questionCount).toBe(2);
      expect(mid?.parts[1].maxScore).toBe(40);
      const p2Questions = mid?.questions.filter((q) => q.partNumber === 2);
      expect(p2Questions?.length).toBe(2);
      expect(p2Questions?.[0].type).toBe("PICTURE_DESCRIPTION");
      expect(p2Questions?.[0].imageUrl).toBeDefined();
      expect(p2Questions?.[1].type).toBe("PICTURE_DESCRIPTION");
      expect(p2Questions?.[1].imageUrl).toBeDefined();

      // Part 3: 2 questions (30 pts)
      expect(mid?.parts[2].questionCount).toBe(2);
      expect(mid?.parts[2].maxScore).toBe(30);

      const totalScore = mid?.parts.reduce((acc, p) => acc + p.maxScore, 0);
      expect(totalScore).toBe(100);
    });

    it("should strictly adhere to HSKK Advanced (Cao cấp) structure (6 questions, reading passage, 100 max score)", () => {
      const adv = HskkService.getTemplateById("hskk-advanced-std-1");
      expect(adv).toBeDefined();
      expect(adv?.totalQuestions).toBe(6);
      expect(adv?.parts.length).toBe(3);

      // Part 1: 3 retold passages (40 pts)
      expect(adv?.parts[0].questionCount).toBe(3);
      expect(adv?.parts[0].maxScore).toBe(40);

      // Part 2: 1 reading passage (20 pts)
      expect(adv?.parts[1].questionCount).toBe(1);
      expect(adv?.parts[1].maxScore).toBe(20);
      const readingQ = adv?.questions.find((q) => q.type === "READ_PASSAGE");
      expect(readingQ).toBeDefined();
      expect(readingQ?.readingText).toBeDefined();

      // Part 3: 2 argumentative questions (40 pts)
      expect(adv?.parts[2].questionCount).toBe(2);
      expect(adv?.parts[2].maxScore).toBe(40);

      const totalScore = adv?.parts.reduce((acc, p) => acc + p.maxScore, 0);
      expect(totalScore).toBe(100);
    });
  });

  describe("HSKK Virtual Exam Room Session Lifecycle", () => {
    it("should create a valid HSKK exam session with unique roll number (准考证号)", () => {
      const session = HskkService.createSession({
        userId: "learner_test_88",
        userEmail: "learner88@example.com",
        userName: "Nguyễn Văn A",
        templateId: "hskk-intermediate-std-1",
        mode: "OFFICIAL",
      });

      expect(session.id).toBeDefined();
      expect(session.candidateNumber).toMatch(/^ZK\d{6,10}$/);
      expect(session.level).toBe("HSKK_INTERMEDIATE");
      expect(session.status).toBe("IN_PROGRESS");
      expect(session.userName).toBe("Nguyễn Văn A");

      const fetched = HskkService.getSession(session.id);
      expect(fetched).toBeDefined();
      expect(fetched?.candidateNumber).toBe(session.candidateNumber);
    });

    it("should record candidate's spoken answers for questions", () => {
      const session = HskkService.createSession({
        userId: "learner_test_88",
        userEmail: "learner88@example.com",
        userName: "Nguyễn Văn A",
        templateId: "hskk-intermediate-std-1",
      });

      const updated = HskkService.saveAnswer(session.id, "int_p1_q1", {
        questionId: "int_p1_q1",
        partNumber: 1,
        questionIndex: 1,
        transcript: "随着现代科技的发展，人们的交流变得越来越便利。",
        durationSeconds: 7,
      });

      expect(updated).not.toBeNull();
      expect(updated?.answers["int_p1_q1"]).toBeDefined();
      expect(updated?.answers["int_p1_q1"].transcript).toContain("随着现代科技");
    });

    it("should evaluate a complete exam and produce official pass/fail scorecard adhering to CTI standards", async () => {
      const session = HskkService.createSession({
        userId: "learner_eval_1",
        userEmail: "eval1@example.com",
        userName: "Trần Thị B",
        templateId: "hskk-intermediate-std-1",
      });

      // Populate candidate answers
      HskkService.saveAnswer(session.id, "int_p1_q1", {
        questionId: "int_p1_q1",
        partNumber: 1,
        questionIndex: 1,
        transcript: "随着现代科技的快速发展，人们的交流方式变得越来越便利。",
        durationSeconds: 8,
      });

      HskkService.saveAnswer(session.id, "int_p2_q1", {
        questionId: "int_p2_q1",
        partNumber: 2,
        questionIndex: 11,
        transcript: "在这幅图中，我们看到一家人正在开开心心地吃年夜饭。桌子上有丰盛的菜肴，爷爷奶奶和爸爸妈妈坐在一起聊天，气氛非常温馨祥和。",
        durationSeconds: 45,
      });

      HskkService.saveAnswer(session.id, "int_p3_q1", {
        questionId: "int_p3_q1",
        partNumber: 3,
        questionIndex: 13,
        transcript: "我认为智能手机确实给生活带来了极大的便利，比如移动支付和在线学习。但是如果我们过度沉迷于手机，就会减少与家人面对面的交流。",
        durationSeconds: 50,
      });

      const result = await HskkService.evaluateSession(session.id);
      expect(result).not.toBeNull();
      if (!result) return;

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(typeof result.isPassed).toBe("boolean");
      expect(result.certificateCode).toContain("HSKK-CTI-");
      expect(result.detailedQuestions.length).toBe(14);
      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.improvements.length).toBeGreaterThan(0);

      // Verify that the completed session was persisted to assessmentStore
      const inStore = assessmentStore.getSession(session.id);
      expect(inStore).toBeDefined();
      expect(inStore?.status).toBe("COMPLETED");
      expect(inStore?.result?.overallScore).toBe(result.overallScore);

      // Clean up test session
      delete (assessmentStore as any).data.sessions[session.id];
    });

    it("should self-heal an HSKK session from cold-start or multi-instance serverless without failing with 404", () => {
      // Simulate a session ID that is NOT in in-memory map or disk
      const coldStartSessionId = `hskk_sess_hskk-intermediate-std-1__OFFICIAL__1730761234567__test99`;
      const healed = HskkService.getSession(coldStartSessionId, "user_healed", "healed@test.com", "Học Viên Tự Hồi Phục");

      expect(healed).toBeDefined();
      expect(healed?.id).toBe(coldStartSessionId);
      expect(healed?.templateId).toBe("hskk-intermediate-std-1");
      expect(healed?.mode).toBe("OFFICIAL");
      expect(healed?.candidateNumber).toMatch(/^ZK\d{6,10}$/);

      // Verify that saving answers works on the healed session
      const saved = HskkService.saveAnswer(coldStartSessionId, "int_p1_q1", {
        questionId: "int_p1_q1",
        partNumber: 1,
        questionIndex: 1,
        transcript: "科技让生活更美好。",
        durationSeconds: 5,
      });
      expect(saved).not.toBeNull();
      expect(saved?.answers["int_p1_q1"].transcript).toBe("科技让生活更美好。");
    });
  });
});
