import { ExaminerService, STAGES_CONFIG } from "@/lib/ai/examiner-service";
import { ScoringWorker } from "@/lib/queue/scoring-worker";
import { ConversationTurnItem } from "@/lib/ai/types";
import { assessmentStore, StoredSession, StoredTurn } from "@/lib/db/assessment-store";

export class AssessmentService {
  private static prismaStatus: boolean | null = null;
  private static lastCheck: number = 0;

  /**
   * Quick non-blocking probe to verify if PostgreSQL/Prisma is operational.
   */
  static async canUsePrisma(): Promise<boolean> {
    try {
      const { isPrismaAvailable } = await import("@/lib/db/prisma");
      return await isPrismaAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Retrieves all active assessment templates.
   */
  static async getTemplates() {
    if (await this.canUsePrisma()) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        const list = await prisma.assessmentTemplate.findMany({
          where: { isActive: true, isPublic: true },
          orderBy: { createdAt: "desc" },
        });
        if (list && list.length > 0) return list;
      } catch (err) {
        console.warn("Prisma getTemplates failed, falling back to assessment store:", err);
      }
    }
    return assessmentStore.getTemplates();
  }

  /**
   * Retrieves assessment sessions for a specific user (merging Prisma & local store resiliently).
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
      const { FirebaseDb } = await import("@/lib/firebase-db");
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
      // Firebase optional
    }

    let prismaSessions: any[] = [];
    if (await this.canUsePrisma()) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        const lookupEmail = (resolvedEmail || email || (userId?.includes("@") ? userId : ""))
          .toLowerCase()
          .trim();

        const userRecords = await prisma.user.findMany({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(lookupEmail ? [{ email: lookupEmail }] : []),
            ],
          },
          select: { id: true, email: true },
        });

        for (const u of userRecords) {
          candidateUserIds.add(u.id);
          if (u.email) {
            const norm = u.email.toLowerCase().trim();
            candidateUserIds.add(norm);
            candidateUserIds.add(`firebase_${norm.replace(/[^a-z0-9]/g, "_")}`);
            candidateUserIds.add(`classnia_${norm.replace(/[^a-z0-9]/g, "_")}`);
          }
        }

        prismaSessions = await prisma.assessmentSession.findMany({
          where: { userId: { in: Array.from(candidateUserIds) } },
          include: {
            template: true,
            result: true,
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        });
      } catch (err) {
        console.warn("Prisma getUserSessions failed, falling back to assessment store:", err);
      }
    }

    // Also get from assessment store
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

    // Merge and deduplicate by id
    const map = new Map<string, any>();
    for (const s of prismaSessions) {
      map.set(s.id, s);
    }
    for (const s of storeSessions) {
      if (!map.has(s.id)) {
        map.set(s.id, s);
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Normalize each session
    return merged.map((s) => ({
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
      description: `Bài khảo thí khẩu ngữ chủ đề tự do: ${topicName}`,
      category: "GENERAL",
      targetLevel: level,
      estimatedDurationMinutes: 15,
      maxTurns: 20,
      stagesConfig: STAGES_CONFIG as any,
      examinerPrompt: `Conduct a 5-stage adaptive oral examination focused on the custom topic: ${topicName}`,
      rubricId: null,
      isActive: true,
      isPublic: false,
      createdById: userId,
    };

    if (await this.canUsePrisma()) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        return await prisma.assessmentTemplate.create({
          data: {
            ...templateData,
            category: "GENERAL" as any,
          },
        });
      } catch (err) {
        console.warn("Prisma createCustomTemplate failed, using assessment store:", err);
      }
    }

    return assessmentStore.saveTemplate({
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Starts a new assessment session for a user and template.
   */
  static async startSession(userId: string, templateId: string, assignmentId?: string) {
    let template: any = null;
    const usePrisma = await this.canUsePrisma();

    if (usePrisma) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        template = await prisma.assessmentTemplate.findUnique({
          where: { id: templateId },
        });
      } catch (err) {
        console.warn("Prisma findUnique template failed, checking assessment store:", err);
      }
    }

    if (!template) {
      template = assessmentStore.getTemplate(templateId);
    }

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

    // Try creating session in Prisma if operational
    if (usePrisma) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        const { SessionStatus, SpeakerType } = await import("@prisma/client");

        // Verify user exists to satisfy foreign key constraint
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        let effectiveUserId = userId;
        if (!existingUser) {
          const placeholderUser = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
              id: userId,
              email: `${userId.replace(/[^a-zA-Z0-9]/g, "_")}@autogen.classnia.local`,
              name: "Học viên",
              passwordHash: "",
              role: "USER" as any,
              emailVerified: true,
              profile: {
                create: {
                  targetLevel: template.targetLevel || "HSK 3",
                  nativeLanguage: "Tiếng Việt",
                },
              },
            },
          });
          effectiveUserId = placeholderUser.id;
        }

        // Ensure template exists in Prisma database
        let dbTemplate = await prisma.assessmentTemplate.findUnique({ where: { id: template.id } });
        if (!dbTemplate) {
          dbTemplate = await prisma.assessmentTemplate.create({
            data: {
              id: template.id,
              title: template.title,
              slug: template.slug || `slug-${Date.now()}`,
              description: template.description || "",
              targetLevel: template.targetLevel || "HSK 3",
              category: "GENERAL" as any,
              stagesConfig: template.stagesConfig || STAGES_CONFIG,
              examinerPrompt: template.examinerPrompt || "",
              isActive: true,
              isPublic: template.isPublic ?? true,
            },
          });
        }

        const session = await prisma.assessmentSession.create({
          data: {
            userId: effectiveUserId,
            templateId: dbTemplate.id,
            assignmentId: assignmentId || null,
            rubricId: dbTemplate.rubricId || null,
            status: SessionStatus.IN_PROGRESS,
            currentStage: 1,
            currentTurn: 0,
            totalTurns: Math.max(template.maxTurns || 20, 20),
            startedAt: new Date(),
          },
        });

        await prisma.conversationTurn.create({
          data: {
            sessionId: session.id,
            turnIndex: 0,
            stage: initialTurn.stage,
            speaker: SpeakerType.EXAMINER,
            textContent: initialTurn.examinerResponse,
            pinyinContent: initialTurn.pinyin,
          },
        });

        return session;
      } catch (prismaErr) {
        console.warn("Prisma session start failed, falling back to assessment store:", prismaErr);
      }
    }

    // Fallback: create and store session in assessment store
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
   * Provides rock-solid resiliency against serverless container recycling, cold starts, and multi-worker isolation.
   */
  static async restoreOrSyncSession(sessionSnapshot: any, userId?: string): Promise<StoredSession> {
    if (!sessionSnapshot || !sessionSnapshot.id) {
      throw new Error("Invalid session snapshot");
    }

    const sessionId = sessionSnapshot.id;
    const existing = assessmentStore.getSession(sessionId);

    // Merge turns so we never lose turns across client / server boundaries
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
    const usePrisma = await this.canUsePrisma();

    if (usePrisma) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        const { SessionStatus, SpeakerType } = await import("@prisma/client");

        const session = await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: {
            turns: { orderBy: { turnIndex: "asc" } },
            template: true,
          },
        });

        if (session) {
          if (session.userId !== userId) {
            console.warn(`User mismatch: session userId ${session.userId} vs current ${userId}`);
          }

          if (session.status !== SessionStatus.IN_PROGRESS) {
            if (session.status === SessionStatus.PROCESSING || session.status === SessionStatus.COMPLETED) {
              if (session.status === SessionStatus.PROCESSING) {
                ScoringWorker.ensureSessionScored(sessionId).catch((e) =>
                  console.error("Duplicate submit scoring error:", e)
                );
              }
              return {
                learnerTurn: session.turns[session.turns.length - 1] || null,
                examinerTurn: null,
                isCompleted: true,
                stage: 5,
              };
            }
          }

          const nextTurnIndex = session.turns.length;

          const learnerTurn = await prisma.conversationTurn.create({
            data: {
              sessionId: session.id,
              turnIndex: nextTurnIndex,
              stage: session.currentStage,
              speaker: SpeakerType.LEARNER,
              textContent: learnerText,
              audioUrl,
              durationMs: durationMs || 0,
            },
          });

          if (audioUrl) {
            await prisma.audioRecording.create({
              data: {
                sessionId: session.id,
                turnId: learnerTurn.id,
                storageKey: audioUrl,
                url: audioUrl,
                durationMs: durationMs || 0,
              },
            }).catch(() => null);
          }

          const turnItems: ConversationTurnItem[] = [
            ...session.turns.map((t) => ({
              turnIndex: t.turnIndex,
              stage: t.stage,
              speaker: t.speaker as "EXAMINER" | "LEARNER",
              textContent: t.textContent,
              pinyinContent: t.pinyinContent || undefined,
              audioUrl: t.audioUrl || undefined,
            })),
            {
              turnIndex: nextTurnIndex,
              stage: session.currentStage,
              speaker: "LEARNER",
              textContent: learnerText,
            },
          ];

          const examinerReply = await ExaminerService.generateNextTurn(
            turnItems,
            session.template.targetLevel,
            session.template.title
          );

          const examinerTurnIndex = nextTurnIndex + 1;

          const examinerTurn = await prisma.conversationTurn.create({
            data: {
              sessionId: session.id,
              turnIndex: examinerTurnIndex,
              stage: examinerReply.stage,
              speaker: SpeakerType.EXAMINER,
              textContent: examinerReply.examinerResponse,
              pinyinContent: examinerReply.pinyin,
            },
          });

          const learnerTurnCount = turnItems.filter((t) => t.speaker === "LEARNER").length;
          const isCompleted =
            (examinerReply.isCompleted && learnerTurnCount >= 9) ||
            (examinerTurnIndex >= session.totalTurns - 1 && examinerReply.stage >= 5 && learnerTurnCount >= 9);

          if (isCompleted) {
            await prisma.assessmentSession.update({
              where: { id: sessionId },
              data: {
                status: SessionStatus.PROCESSING,
                currentStage: 5,
                currentTurn: examinerTurnIndex,
              },
            });
            await ScoringWorker.enqueueScoringJob(sessionId);
          } else {
            await prisma.assessmentSession.update({
              where: { id: sessionId },
              data: {
                currentStage: examinerReply.stage,
                currentTurn: examinerTurnIndex,
              },
            });
          }

          return {
            learnerTurn,
            examinerTurn,
            isCompleted,
            stage: examinerReply.stage,
          };
        }
      } catch (prismaErr) {
        console.warn("Prisma turn submission failed, checking assessment store:", prismaErr);
      }
    }

    // Fallback: manage turns via assessmentStore with automatic self-healing
    let storedSession = assessmentStore.getSession(sessionId);

    // If session is missing in local process store (e.g., serverless lambda cold-start / new container),
    // restore it immediately from the client's sessionSnapshot!
    if (!storedSession && sessionSnapshot) {
      try {
        storedSession = await this.restoreOrSyncSession(sessionSnapshot, userId);
      } catch (recoverErr) {
        console.warn("Failed to recover session from client snapshot:", recoverErr);
      }
    }

    if (!storedSession) {
      // Last-ditch self-healing: construct active session container so the exam NEVER halts
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
    let session: any = null;

    if (await this.canUsePrisma()) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        session = await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: {
            template: true,
            turns: {
              orderBy: { turnIndex: "asc" },
              include: { recording: true },
            },
            result: {
              include: {
                scoreDimensions: { orderBy: { weight: "desc" } },
                recommendations: { orderBy: { priority: "asc" } },
              },
            },
            user: { select: { name: true, email: true } },
          },
        });
      } catch (err) {
        console.warn("Prisma getSessionWithReport failed, falling back to assessment store:", err);
      }
    }

    if (!session) {
      session = assessmentStore.getSession(sessionId);
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
      session.user = {
        name: "Học viên",
        email: session.userId || "",
      };
    }

    // Ensure turns is an array
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

      // Normalize scoreDimensions
      const rawDimensions = Array.isArray(res.scoreDimensions) ? res.scoreDimensions : [];
      const scoreDimensions = rawDimensions.map((dim: any, idx: number) => {
        const maxScore = dim.maxScore || (dim.score <= 20 ? 20 : 100);
        const score = typeof dim.score === "number" ? dim.score : 0;
        const percent = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
        const quotes = Array.isArray(dim.evidenceQuotesJson)
          ? dim.evidenceQuotesJson
          : Array.isArray(dim.evidenceQuotes)
          ? dim.evidenceQuotes
          : [];
        const rationale = dim.rationale || dim.feedback || "Đạt chuẩn năng lực giao tiếp yêu cầu.";
        const performanceLevel =
          dim.performanceLevel ||
          (percent >= 80 ? "Mastery" : percent >= 60 ? "Proficient" : "Developing");

        return {
          ...dim,
          id: dim.id || `dim_${idx}`,
          dimensionName: dim.dimensionName || dim.name || `Kỹ năng ${idx + 1}`,
          score,
          maxScore,
          percent,
          performanceLevel,
          rationale,
          quotes,
          weight: typeof dim.weight === "number" ? dim.weight : 0.2,
        };
      });

      // Normalize recommendations
      const rawRecs = Array.isArray(res.recommendations) ? res.recommendations : [];
      const recommendations = rawRecs.map((r: any, idx: number) => {
        const category = (r.category || "GENERAL").toUpperCase();
        const originalPhrase =
          r.originalPhrase ||
          r.original ||
          (r.recommendation?.includes('Thay vì nói "') ? r.recommendation.split('"')[1] : null) ||
          "";
        const correctedPhrase =
          r.correctedPhrase ||
          r.corrected ||
          r.correction ||
          (r.recommendation?.includes('bạn nên dùng: "')
            ? r.recommendation.split('bạn nên dùng: "')[1]?.replace(/"$/, "")
            : r.recommendation) ||
          "";
        const explanation =
          r.explanation || r.actionableExercise || r.reason || "Gợi ý diễn đạt chuẩn bản xứ hơn.";
        const exampleSentence = r.exampleSentence || r.example || null;

        return {
          ...r,
          id: r.id || `rec_${idx}`,
          category,
          originalPhrase,
          correctedPhrase,
          explanation,
          exampleSentence,
        };
      });

      // Normalize strengths, weaknesses, priorityAreas, improvementPlan
      const strengthsJson = Array.isArray(res.strengthsJson)
        ? res.strengthsJson
        : Array.isArray(res.strengths)
        ? res.strengths
        : res.scoringRationale
        ? [res.scoringRationale]
        : ["Phản xạ chủ động và tự tin khi giao tiếp."];

      const weaknessesJson = Array.isArray(res.weaknessesJson)
        ? res.weaknessesJson
        : Array.isArray(res.weaknesses)
        ? res.weaknesses
        : Array.isArray(res.improvements)
        ? res.improvements
        : ["Cần chú ý luyện thêm ngữ điệu và mở rộng vốn từ vựng chuyên sâu."];

      const priorityAreasJson = Array.isArray(res.priorityAreasJson)
        ? res.priorityAreasJson
        : Array.isArray(res.improvements)
        ? res.improvements
        : [];

      const improvementPlanJson = Array.isArray(res.improvementPlanJson)
        ? res.improvementPlanJson
        : [];

      session.result = {
        ...res,
        overallScore,
        hskEstimate,
        cefrEstimate,
        performanceSummary,
        confidenceLevel,
        isAcousticAided,
        scoreDimensions,
        recommendations,
        strengthsJson,
        weaknessesJson,
        priorityAreasJson,
        improvementPlanJson,
      };
    }

    return session;
  }
}
