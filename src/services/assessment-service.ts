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
   * Retrieves assessment sessions for a specific user.
   */
  static async getUserSessions(userId: string) {
    if (await this.canUsePrisma()) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        return await prisma.assessmentSession.findMany({
          where: { userId },
          include: {
            template: true,
            result: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
      } catch (err) {
        console.warn("Prisma getUserSessions failed, falling back to assessment store:", err);
      }
    }
    return assessmentStore.getSessionsByUserId(userId);
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
   * Submits a learner's spoken turn and gets the examiner's next response.
   */
  static async submitLearnerTurn(
    sessionId: string,
    userId: string,
    learnerText: string,
    audioUrl?: string,
    durationMs?: number
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

    // Fallback: manage turns via assessmentStore
    const storedSession = assessmentStore.getSession(sessionId);
    if (!storedSession) {
      throw new Error(`Session ${sessionId} not found`);
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
  static async getSessionWithReport(sessionId: string, userId: string) {
    if (await this.canUsePrisma()) {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        const session = await prisma.assessmentSession.findUnique({
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

        if (session) {
          if (!session.user) {
            session.user = { name: "Học viên", email: "" };
          }
          return session;
        }
      } catch (err) {
        console.warn("Prisma getSessionWithReport failed, falling back to assessment store:", err);
      }
    }

    const stored = assessmentStore.getSession(sessionId);
    if (!stored) return null;

    // Ensure session object shape matches report expectations
    return {
      ...stored,
      user: {
        name: "Học viên",
        email: stored.userId,
      },
    };
  }
}
