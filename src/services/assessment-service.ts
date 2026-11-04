import { ExaminerService, STAGES_CONFIG } from "@/lib/ai/examiner-service";
import { ScoringWorker } from "@/lib/queue/scoring-worker";
import { ConversationTurnItem } from "@/lib/ai/types";
import { assessmentStore, StoredSession, StoredTurn } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";

export class AssessmentService {
  /**
   * Compatibility probe - always returns false as PostgreSQL/Prisma is removed.
   */
  static async canUsePrisma(): Promise<boolean> {
    return false;
  }

  /**
   * Retrieves all active assessment templates from the store.
   */
  static async getTemplates() {
    return assessmentStore.getTemplates();
  }

  /**
   * Retrieves assessment sessions for a specific user (merging Firebase UID, email, and local store).
   */
  static async getUserSessions(userId: string, email?: string) {
    const candidateUserIds = new Set<string>();
    if (userId) candidateUserIds.add(userId);
    if (email) {
      const normEmail = email.toLowerCase().trim();
      candidateUserIds.add(normEmail);
      candidateUserIds.add(`firebase_${normEmail.replace(/[^a-z0-9]/g, "_")}`);
      candidateUserIds.add(`classnia_${normEmail.replace(/[^a-z0-9]/g, "_")}`);
    }

    // If userId itself looks like an email
    if (userId && userId.includes("@")) {
      const norm = userId.toLowerCase().trim();
      candidateUserIds.add(norm);
      candidateUserIds.add(`firebase_${norm.replace(/[^a-z0-9]/g, "_")}`);
      candidateUserIds.add(`classnia_${norm.replace(/[^a-z0-9]/g, "_")}`);
    }

    // Try resolving user from Firebase Firestore (find by UID or email)
    let resolvedEmail = email;
    try {
      const targetLookup = email || (userId && userId.includes("@") ? userId : null);
      const fbUser =
        (userId ? await FirebaseDb.findUserById(userId) : null) ||
        (targetLookup ? await FirebaseDb.findUserByEmail(targetLookup) : null);

      if (fbUser) {
        if (fbUser.id) candidateUserIds.add(fbUser.id);
        if (fbUser.email) {
          resolvedEmail = resolvedEmail || fbUser.email;
          const norm = fbUser.email.toLowerCase().trim();
          candidateUserIds.add(norm);
          candidateUserIds.add(`firebase_${norm.replace(/[^a-z0-9]/g, "_")}`);
          candidateUserIds.add(`classnia_${norm.replace(/[^a-z0-9]/g, "_")}`);
        }
      }
    } catch {
      // Firebase lookup optional
    }

    // Also check profiles in assessmentStore
    try {
      const allProfiles = Object.values((assessmentStore as any).data?.profiles || {});
      for (const prof of allProfiles) {
        if (prof && typeof prof === "object") {
          const p = prof as any;
          if (
            (resolvedEmail && p.email?.toLowerCase().trim() === resolvedEmail.toLowerCase().trim()) ||
            candidateUserIds.has(p.userId)
          ) {
            if (p.userId) candidateUserIds.add(p.userId);
            if (p.email) candidateUserIds.add(p.email.toLowerCase().trim());
          }
        }
      }
    } catch {
      // ignore
    }

    // Retrieve sessions from assessmentStore
    const storeSessions = assessmentStore.getAllSessions().filter((s) => {
      if (candidateUserIds.has(s.userId)) return true;
      if (resolvedEmail || email) {
        const target = (resolvedEmail || email)!.toLowerCase().trim();
        const prefix = target.split("@")[0];
        if (s.userId?.toLowerCase() === target || s.userId?.toLowerCase().includes(prefix)) {
          return true;
        }
      }
      return false;
    });

    storeSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Normalize each session
    return storeSessions.map((s) => ({
      ...s,
      template: s.template || {
        title: "Bài khảo thí khẩu ngữ",
        description: "Đánh giá khẩu ngữ HSK",
        targetLevel: "HSK 3",
      },
      result: s.result
        ? {
            ...s.result,
            overallScore: s.result.overallScore,
            hskEstimate: s.result.hskEstimate || s.result.hskLevel || s.template?.targetLevel || "HSK",
            cefrEstimate: s.result.cefrEstimate || s.result.cefrLevel || "A2",
            performanceSummary: s.result.performanceSummary || s.result.feedbackSummary || s.template?.description,
            scoreDimensions: s.result.scoreDimensions || [],
            recommendations: s.result.recommendations || [],
          }
        : null,
    }));
  }

  /**
   * Creates a dynamic custom assessment template based on user input.
   */
  static async createCustomTemplate(topicName: string, level = "HSK 3", userId: string) {
    const slug = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const templateId = `tpl_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const templateData = {
      id: templateId,
      title: topicName,
      slug,
      description: `Đề thi khảo thí tùy chỉnh tạo bởi học viên về chủ đề: "${topicName}" (${level}).`,
      category: "CUSTOM",
      targetLevel: level,
      estimatedDurationMinutes: 15,
      maxTurns: 20,
      stagesConfig: STAGES_CONFIG,
      examinerPrompt: `You are an official HSK oral examiner conducting an interactive speaking exam on the custom candidate-chosen topic: "${topicName}". Target proficiency: ${level}.`,
      rubricId: "rubric-standard-v1",
      isActive: true,
      isPublic: false,
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveTemplate(templateData);
    return templateData;
  }

  /**
   * Starts a new assessment session and generates the examiner's initial greeting turn.
   */
  static async startSession(userId: string, templateId: string, assignmentId?: string) {
    let template = assessmentStore.getTemplate(templateId);

    if (!template) {
      // Fallback to default HSK 3 template if requested ID does not exist
      template = assessmentStore.getTemplate("tpl-hsk3") || assessmentStore.getTemplates()[0];
    }

    if (!template) {
      throw new Error("Assessment template not found or inactive.");
    }

    // Generate initial greeting turn from AI Examiner
    const initialTurn = await ExaminerService.generateNextTurn(
      [],
      template.targetLevel,
      template.title
    );

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const initialTurnItem: StoredTurn = {
      id: `turn_${Date.now()}_0`,
      sessionId,
      turnIndex: 0,
      stage: initialTurn.stage,
      speaker: "EXAMINER",
      textContent: initialTurn.examinerResponse,
      pinyinContent: initialTurn.pinyin,
      createdAt: new Date().toISOString(),
    };

    const storedSession: StoredSession = {
      id: sessionId,
      assignmentId: assignmentId || null,
      templateId: template.id,
      rubricId: template.rubricId || null,
      userId,
      status: "IN_PROGRESS",
      currentStage: 1,
      currentTurn: 0,
      totalTurns: Math.max(template.maxTurns || 20, 20),
      totalDurationSeconds: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      failureReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template,
      turns: [initialTurnItem],
      result: null,
    };

    assessmentStore.saveSession(storedSession);
    return storedSession;
  }

  /**
   * Restores or syncs a session from a client-provided snapshot into the persistent store.
   */
  static async restoreOrSyncSession(sessionSnapshot: any, userId?: string): Promise<StoredSession> {
    if (!sessionSnapshot || !sessionSnapshot.id) {
      throw new Error("Invalid session snapshot");
    }

    const sessionId = sessionSnapshot.id;
    const existing = assessmentStore.getSession(sessionId);

    const existingTurns = existing?.turns || [];
    const snapshotTurns = Array.isArray(sessionSnapshot.turns) ? sessionSnapshot.turns : [];

    const turnsMap = new Map<number, StoredTurn>();
    for (const t of existingTurns) {
      turnsMap.set(t.turnIndex, t);
    }
    for (const t of snapshotTurns) {
      turnsMap.set(t.turnIndex, {
        id: t.id || `turn_${Date.now()}_${t.turnIndex}`,
        sessionId,
        turnIndex: t.turnIndex,
        stage: t.stage || 1,
        speaker: t.speaker || "LEARNER",
        textContent: t.textContent || "",
        pinyinContent: t.pinyinContent || null,
        audioUrl: t.audioUrl || null,
        durationMs: t.durationMs || 0,
        createdAt: t.createdAt || new Date().toISOString(),
      });
    }
    const mergedTurns = Array.from(turnsMap.values()).sort((a, b) => a.turnIndex - b.turnIndex);

    const mergedSession: StoredSession = {
      id: sessionId,
      assignmentId: sessionSnapshot.assignmentId || existing?.assignmentId || null,
      templateId: sessionSnapshot.templateId || existing?.templateId || "tpl-hsk3",
      rubricId: sessionSnapshot.rubricId || existing?.rubricId || null,
      userId: sessionSnapshot.userId || existing?.userId || userId || "user_guest",
      status: sessionSnapshot.status || existing?.status || "IN_PROGRESS",
      currentStage: Math.max(sessionSnapshot.currentStage || 1, existing?.currentStage || 1),
      currentTurn: Math.max(sessionSnapshot.currentTurn || 0, existing?.currentTurn || 0, mergedTurns.length),
      totalTurns: Math.max(sessionSnapshot.totalTurns || 20, existing?.totalTurns || 20, 20),
      totalDurationSeconds: Math.max(sessionSnapshot.totalDurationSeconds || 0, existing?.totalDurationSeconds || 0),
      startedAt: sessionSnapshot.startedAt || existing?.startedAt || new Date().toISOString(),
      completedAt: sessionSnapshot.completedAt || existing?.completedAt || null,
      failureReason: sessionSnapshot.failureReason || existing?.failureReason || null,
      createdAt: sessionSnapshot.createdAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: sessionSnapshot.template || existing?.template || {
        id: sessionSnapshot.templateId || "tpl-hsk3",
        title: sessionSnapshot.template?.title || "Khảo thí khẩu ngữ HSK",
        slug: sessionSnapshot.template?.slug || "hsk-speaking",
        description: sessionSnapshot.template?.description || "Bài khảo thí khẩu ngữ",
        category: "GENERAL",
        targetLevel: sessionSnapshot.template?.targetLevel || "HSK 3",
        estimatedDurationMinutes: 15,
        maxTurns: 20,
        stagesConfig: STAGES_CONFIG,
        examinerPrompt: "",
        rubricId: null,
        isActive: true,
        isPublic: true,
        createdById: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      turns: mergedTurns,
      result: sessionSnapshot.result || existing?.result || null,
    };

    assessmentStore.saveSession(mergedSession);
    return mergedSession;
  }

  /**
   * Submits a learner's spoken turn and gets the examiner's next response.
   */
  static async submitLearnerTurn(
    sessionId: string,
    userId: string,
    learnerText: string,
    audioUrl?: string,
    durationMs?: number,
    sessionSnapshot?: any
  ) {
    let storedSession = assessmentStore.getSession(sessionId);

    if (!storedSession && sessionSnapshot) {
      try {
        storedSession = await this.restoreOrSyncSession(sessionSnapshot, userId);
      } catch (recoverErr) {
        console.warn("Failed to recover session from client snapshot:", recoverErr);
      }
    }

    if (!storedSession) {
      console.warn(`Session ${sessionId} not found, generating self-healing container`);
      storedSession = await this.restoreOrSyncSession(
        {
          id: sessionId,
          userId,
          currentStage: 3,
          turns: [],
          template: {
            id: "tpl-hsk3",
            title: "Khảo thí khẩu ngữ HSK",
            targetLevel: "HSK 3",
          },
        },
        userId
      );
    }

    if (storedSession.status !== "IN_PROGRESS") {
      if (storedSession.status === "PROCESSING" || storedSession.status === "COMPLETED") {
        if (storedSession.status === "PROCESSING") {
          ScoringWorker.ensureSessionScored(sessionId).catch((e) =>
            console.error("Duplicate submit scoring error:", e)
          );
        }
        return {
          learnerTurn: storedSession.turns[storedSession.turns.length - 1] || null,
          examinerTurn: null,
          isCompleted: true,
          stage: 5,
        };
      }
      throw new Error(`Cannot submit turn. Session status is ${storedSession.status}`);
    }

    const nextTurnIndex = storedSession.turns.length;

    const learnerTurn: StoredTurn = {
      id: `turn_${Date.now()}_${nextTurnIndex}`,
      sessionId,
      turnIndex: nextTurnIndex,
      stage: storedSession.currentStage,
      speaker: "LEARNER",
      textContent: learnerText,
      audioUrl,
      durationMs: durationMs || 0,
      createdAt: new Date().toISOString(),
    };
    assessmentStore.addTurn(sessionId, learnerTurn);

    const turnItems: ConversationTurnItem[] = [
      ...storedSession.turns.map((t) => ({
        turnIndex: t.turnIndex,
        stage: t.stage,
        speaker: t.speaker,
        textContent: t.textContent,
        pinyinContent: t.pinyinContent || undefined,
        audioUrl: t.audioUrl || undefined,
      })),
      {
        turnIndex: nextTurnIndex,
        stage: storedSession.currentStage,
        speaker: "LEARNER",
        textContent: learnerText,
      },
    ];

    const examinerReply = await ExaminerService.generateNextTurn(
      turnItems,
      storedSession.template?.targetLevel || "HSK 3",
      storedSession.template?.title || "Khảo Thí Khẩu Ngữ"
    );

    const examinerTurnIndex = nextTurnIndex + 1;

    const examinerTurn: StoredTurn = {
      id: `turn_${Date.now()}_${examinerTurnIndex}`,
      sessionId,
      turnIndex: examinerTurnIndex,
      stage: examinerReply.stage,
      speaker: "EXAMINER",
      textContent: examinerReply.examinerResponse,
      pinyinContent: examinerReply.pinyin,
      createdAt: new Date().toISOString(),
    };
    assessmentStore.addTurn(sessionId, examinerTurn);

    const storedLearnerCount = (storedSession.turns || []).filter((t) => t.speaker === "LEARNER").length + 1;
    const isCompleted =
      (examinerReply.isCompleted && storedLearnerCount >= 9) ||
      (examinerTurnIndex >= storedSession.totalTurns - 1 && examinerReply.stage >= 5 && storedLearnerCount >= 9);

    if (isCompleted) {
      assessmentStore.updateSession(sessionId, {
        status: "PROCESSING",
        currentStage: 5,
        currentTurn: examinerTurnIndex,
      });
      await ScoringWorker.enqueueScoringJob(sessionId);
    } else {
      assessmentStore.updateSession(sessionId, {
        currentStage: examinerReply.stage,
        currentTurn: examinerTurnIndex,
      });
    }

    return {
      learnerTurn,
      examinerTurn,
      isCompleted,
      stage: examinerReply.stage,
    };
  }

  /**
   * Fetches full assessment details including report, scores, recommendations, and turns.
   */
  static async getSessionWithReport(sessionId: string, userId?: string) {
    let session: any = assessmentStore.getSession(sessionId);

    // If not found in local store, query Firestore!
    if (!session) {
      try {
        session = await FirebaseDb.getSession(sessionId);
        if (session) {
          assessmentStore.saveSession(session);
        }
      } catch (e) {
        console.warn("Firestore session fetch note:", e);
      }
    }

    if (!session) return null;

    // Auto-fill template if missing
    if (!session.template && session.templateId) {
      session.template = assessmentStore.getTemplate(session.templateId) || {
        id: session.templateId,
        title: "Khảo thí khẩu ngữ HSK",
        description: "Đánh giá khẩu ngữ",
        targetLevel: "HSK 3",
      };
    }
    if (!session.template) {
      session.template = {
        title: "Khảo thí khẩu ngữ HSK",
        description: "Đánh giá khẩu ngữ",
        targetLevel: "HSK 3",
      };
    }

    // Auto-fill user if missing
    if (!session.user) {
      let userName = "Học viên";
      if (session.userId) {
        try {
          const fbUser = await FirebaseDb.findUserById(session.userId);
          if (fbUser?.name) userName = fbUser.name;
        } catch {
          // ignore
        }
      }
      session.user = {
        name: userName,
        email: session.userId || "",
      };
    }

    session.turns = Array.isArray(session.turns) ? session.turns : [];

    // Normalize result if exists
    if (session.result) {
      const res = session.result;
      const overallScore = typeof res.overallScore === "number" ? res.overallScore : 0;
      const hskEstimate =
        res.hskEstimate || res.hskLevel || session.template?.targetLevel || "HSK 3";
      const cefrEstimate = res.cefrEstimate || res.cefrLevel || "B1";
      const performanceSummary =
        res.performanceSummary ||
        res.feedbackSummary ||
        res.summary ||
        "Buổi đánh giá khẩu ngữ hoàn thành tốt.";
      const confidenceLevel =
        typeof res.confidenceLevel === "number" ? res.confidenceLevel : 0.95;
      const isAcousticAided = res.isAcousticAided ?? true;

      const rawDimensions = Array.isArray(res.scoreDimensions) ? res.scoreDimensions : [];
      const scoreDimensions = rawDimensions.map((dim: any, idx: number) => {
        const maxScore = dim.maxScore || (dim.score <= 20 ? 20 : 100);
        const score = typeof dim.score === "number" ? dim.score : 0;
        const percent = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));

        return {
          id: dim.id || `dim_${idx}`,
          dimensionKey: dim.dimensionKey || `dimension_${idx}`,
          dimensionName: dim.dimensionName || "Thang đo khẩu ngữ",
          score,
          maxScore,
          weight: typeof dim.weight === "number" ? dim.weight : 0.15,
          performanceLevel:
            dim.performanceLevel || (percent >= 80 ? "Mastery" : percent >= 60 ? "Proficient" : "Developing"),
          evidenceQuotesJson: Array.isArray(dim.evidenceQuotesJson) ? dim.evidenceQuotesJson : [],
          rationale: dim.rationale || dim.feedback || "",
          feedback: dim.feedback || dim.rationale || "",
          suggestionsJson: Array.isArray(dim.suggestionsJson) ? dim.suggestionsJson : [],
        };
      });

      const rawRecs = Array.isArray(res.recommendations) ? res.recommendations : [];
      const recommendations = rawRecs.map((rec: any, idx: number) => ({
        id: rec.id || `rec_${idx}`,
        category: rec.category || "GENERAL",
        originalPhrase: rec.originalPhrase || null,
        correctedPhrase: rec.correctedPhrase || rec.recommendation || "",
        explanation: rec.explanation || "",
        exampleSentence: rec.exampleSentence || null,
        priority: typeof rec.priority === "number" ? rec.priority : 1,
        recommendation: rec.recommendation || rec.correctedPhrase || "",
        actionableExercise: rec.actionableExercise || "",
      }));

      session.result = {
        ...res,
        overallScore,
        hskEstimate,
        cefrEstimate,
        performanceSummary,
        confidenceLevel,
        isAcousticAided,
        strengthsJson: Array.isArray(res.strengthsJson) ? res.strengthsJson : [],
        weaknessesJson: Array.isArray(res.weaknessesJson) ? res.weaknessesJson : [],
        priorityAreasJson: Array.isArray(res.priorityAreasJson) ? res.priorityAreasJson : [],
        improvementPlanJson: Array.isArray(res.improvementPlanJson) ? res.improvementPlanJson : [],
        scoreDimensions,
        recommendations,
      };
    }

    return session;
  }
}
