import { ScoringEngine } from "@/lib/ai/scoring-engine";
import { ConversationTurnItem } from "@/lib/ai/types";
import { assessmentStore } from "@/lib/db/assessment-store";

export class ScoringWorker {
  /**
   * Enqueues a scoring job for a completed assessment session
   */
  static async enqueueScoringJob(sessionId: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        const { JobStatus } = await import("@prisma/client");
        const job = await prisma.backgroundJob.create({
          data: {
            jobType: "SCORING_PIPELINE",
            status: JobStatus.PENDING,
            payloadJson: { sessionId },
          },
        });
        setTimeout(() => {
          this.processJob(job.id).catch((err) => {
            console.error(`Error processing background job ${job.id}:`, err);
          });
        }, 50);
        return job.id;
      }
    } catch {
      // Prisma offline, run directly in background
    }
    setTimeout(() => {
      this.processSession(sessionId).catch((err) => {
        console.error(`Error processing fallback scoring for session ${sessionId}:`, err);
      });
    }, 50);
    return jobId;
  }

  /**
   * Ensures that a session in PROCESSING status has its scoring pipeline completed.
   */
  static async ensureSessionScored(sessionId: string): Promise<void> {
    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        const { SessionStatus } = await import("@prisma/client");
        const session = await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: { result: true },
        });
        if (session && session.status === SessionStatus.COMPLETED && session.result) {
          return;
        }
      }
    } catch {
      // Prisma offline, proceed to check store
    }

    const stored = assessmentStore.getSession(sessionId);
    if (stored && stored.status === "COMPLETED" && stored.result) {
      return;
    }

    await this.processSession(sessionId);
  }

  /**
   * Processes a scoring job by Job ID
   */
  static async processJob(jobId: string): Promise<void> {
    try {
      const { default: prisma } = await import("@/lib/db/prisma");
      const { JobStatus } = await import("@prisma/client");
      const job = await prisma.backgroundJob.findUnique({
        where: { id: jobId },
      });

      if (!job || job.status === JobStatus.COMPLETED) return;

      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: { status: JobStatus.RUNNING, retries: { increment: 1 } },
      });

      const payload = job.payloadJson as { sessionId: string };
      const sessionId = payload?.sessionId;

      if (!sessionId) {
        await prisma.backgroundJob.update({
          where: { id: jobId },
          data: { status: JobStatus.FAILED, lastError: "Missing sessionId in payload" },
        });
        return;
      }

      await this.processSession(sessionId, jobId);
    } catch (e) {
      console.warn("Prisma processJob error, falling back to direct scoring:", e);
    }
  }

  /**
   * Directly processes and finalizes scoring for an assessment session
   */
  static async processSession(sessionId: string, jobId?: string): Promise<void> {
    // 1. Try Prisma first if reachable
    let prismaSession: any = null;
    try {
      const { default: prisma } = await import("@/lib/db/prisma");
      const { SessionStatus, JobStatus, RecommendationCategory } = await import("@prisma/client");

      prismaSession = await prisma.assessmentSession.findUnique({
        where: { id: sessionId },
        include: {
          turns: {
            orderBy: { turnIndex: "asc" },
            include: { transcription: true, recording: true },
          },
          template: true,
          user: true,
          result: true,
        },
      });

      if (prismaSession) {
        if (prismaSession.status === SessionStatus.COMPLETED && prismaSession.result) {
          if (jobId) {
            await prisma.backgroundJob.update({
              where: { id: jobId },
              data: { status: JobStatus.COMPLETED, processedAt: new Date() },
            });
          }
          return;
        }

        const turnItems: ConversationTurnItem[] = prismaSession.turns.map((t: any) => ({
          turnIndex: t.turnIndex,
          stage: t.stage,
          speaker: t.speaker as "EXAMINER" | "LEARNER",
          textContent: t.transcription?.rawText || t.textContent,
          pinyinContent: t.pinyinContent || undefined,
          audioUrl: t.audioUrl || undefined,
          durationMs: t.durationMs || undefined,
          createdAt: t.createdAt,
        }));

        const report = await ScoringEngine.evaluateConversation(
          turnItems,
          prismaSession.template.targetLevel
        );

        await prisma.$transaction(async (tx) => {
          await tx.assessmentResult.deleteMany({ where: { sessionId } });

          const assessmentResult = await tx.assessmentResult.create({
            data: {
              sessionId,
              rubricVersion: "1.0",
              overallScore: report.overallScore,
              cefrEstimate: report.cefrEstimate,
              hskEstimate: report.hskEstimate,
              performanceSummary: report.performanceSummary,
              confidenceLevel: report.confidenceLevel,
              isAcousticAided: report.isAcousticAided,
              strengthsJson: report.strengths,
              weaknessesJson: report.weaknesses,
              priorityAreasJson: report.priorityAreas,
              improvementPlanJson: report.improvementPlan,
              status: "COMPLETED",
            },
          });

          for (const dim of report.dimensions) {
            await tx.scoreDimension.create({
              data: {
                resultId: assessmentResult.id,
                dimensionKey: dim.key,
                dimensionName: `${dim.name} (${dim.nameZh})`,
                weight: dim.weight,
                score: dim.score,
                maxScore: dim.maxScore,
                performanceLevel: dim.performanceLevel,
                evidenceQuotesJson: dim.evidenceQuotes,
                rationale: dim.rationale,
                suggestionsJson: dim.suggestions,
              },
            });
          }

          for (const gram of report.grammarCorrections) {
            await tx.learningRecommendation.create({
              data: {
                resultId: assessmentResult.id,
                category: RecommendationCategory.GRAMMAR,
                originalPhrase: gram.original,
                correctedPhrase: gram.corrected,
                explanation: gram.explanation,
                exampleSentence: gram.example,
                priority: 1,
              },
            });
          }

          for (const voc of report.vocabularyEnhancements) {
            await tx.learningRecommendation.create({
              data: {
                resultId: assessmentResult.id,
                category: RecommendationCategory.VOCABULARY,
                originalPhrase: voc.original,
                correctedPhrase: voc.betterAlternatives.join(", "),
                explanation: voc.explanation,
                exampleSentence: voc.example,
                priority: 2,
              },
            });
          }

          for (const pron of report.pronunciationNotes) {
            await tx.learningRecommendation.create({
              data: {
                resultId: assessmentResult.id,
                category: RecommendationCategory.PRONUNCIATION,
                originalPhrase: pron.focus,
                correctedPhrase: pron.suggestion,
                explanation: pron.observation,
                exampleSentence: pron.sampleWords.join("、"),
                priority: 1,
              },
            });
          }

          await tx.assessmentSession.update({
            where: { id: sessionId },
            data: {
              status: SessionStatus.COMPLETED,
              completedAt: new Date(),
            },
          });
        });

        if (jobId) {
          await prisma.backgroundJob.update({
            where: { id: jobId },
            data: { status: JobStatus.COMPLETED, processedAt: new Date() },
          });
        }
        return;
      }
    } catch (prismaErr) {
      console.warn("Prisma scoring failed or offline, falling back to assessment store:", prismaErr);
    }

    // 2. Fallback to assessment store
    const storedSession = assessmentStore.getSession(sessionId);
    if (!storedSession) {
      throw new Error(`Session ${sessionId} not found in database or store`);
    }

    if (storedSession.status === "COMPLETED" && storedSession.result) {
      return;
    }

    const turnItems: ConversationTurnItem[] = (storedSession.turns || []).map((t) => ({
      turnIndex: t.turnIndex,
      stage: t.stage,
      speaker: t.speaker,
      textContent: t.textContent,
      pinyinContent: t.pinyinContent || undefined,
      audioUrl: t.audioUrl || undefined,
      durationMs: t.durationMs || undefined,
      createdAt: new Date(t.createdAt),
    }));

    const report = await ScoringEngine.evaluateConversation(
      turnItems,
      storedSession.template?.targetLevel || "HSK 3"
    );

    const storedResult: any = {
      id: `result_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      overallScore: report.overallScore,
      cefrEstimate: report.cefrEstimate,
      hskEstimate: report.hskEstimate,
      performanceSummary: report.performanceSummary,
      confidenceLevel: report.confidenceLevel,
      isAcousticAided: report.isAcousticAided,
      strengthsJson: report.strengths,
      weaknessesJson: report.weaknesses,
      priorityAreasJson: report.priorityAreas,
      improvementPlanJson: report.improvementPlan || [],
      scoreDimensions: report.dimensions.map((d) => ({
        id: `dim_${d.key}_${Date.now()}`,
        dimensionKey: d.key,
        dimensionName: `${d.name} (${d.nameZh})`,
        weight: d.weight,
        score: d.score,
        maxScore: d.maxScore,
        performanceLevel: d.performanceLevel,
        evidenceQuotesJson: d.evidenceQuotes,
        rationale: d.rationale,
        suggestionsJson: d.suggestions,
      })),
      recommendations: [
        ...report.grammarCorrections.map((g, i) => ({
          id: `rec_gram_${i}_${Date.now()}`,
          category: "GRAMMAR",
          originalPhrase: g.original,
          correctedPhrase: g.corrected,
          explanation: g.explanation,
          exampleSentence: g.example,
          priority: 1,
        })),
        ...report.vocabularyEnhancements.map((v, i) => ({
          id: `rec_voc_${i}_${Date.now()}`,
          category: "VOCABULARY",
          originalPhrase: v.original,
          correctedPhrase: v.betterAlternatives.join(", "),
          explanation: v.explanation,
          exampleSentence: v.example,
          priority: 2,
        })),
        ...report.pronunciationNotes.map((p, i) => ({
          id: `rec_pron_${i}_${Date.now()}`,
          category: "PRONUNCIATION",
          originalPhrase: p.focus,
          correctedPhrase: p.suggestion,
          explanation: p.observation,
          exampleSentence: p.sampleWords.join("、"),
          priority: 1,
        })),
      ],
      scoredAt: new Date().toISOString(),
    };

    assessmentStore.saveResult(sessionId, storedResult);
  }
}
