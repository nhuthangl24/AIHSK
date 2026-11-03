import prisma from "@/lib/db/prisma";
import { ScoringEngine } from "@/lib/ai/scoring-engine";
import { ConversationTurnItem } from "@/lib/ai/types";
import { JobStatus, SessionStatus, RecommendationCategory } from "@prisma/client";

export class ScoringWorker {
  /**
   * Enqueues a scoring job for a completed assessment session
   */
  static async enqueueScoringJob(sessionId: string): Promise<string> {
    const job = await prisma.backgroundJob.create({
      data: {
        jobType: "SCORING_PIPELINE",
        status: JobStatus.PENDING,
        payloadJson: { sessionId },
      },
    });

    // Execute job asynchronously (non-blocking for immediate response, or can be picked up by worker daemon)
    setTimeout(() => {
      this.processJob(job.id).catch((err) => {
        console.error(`Error processing background job ${job.id}:`, err);
      });
    }, 100);

    return job.id;
  }

  /**
   * Processes a scoring job
   */
  static async processJob(jobId: string): Promise<void> {
    const job = await prisma.backgroundJob.findUnique({
      where: { id: jobId },
    });

    if (!job || job.status === JobStatus.COMPLETED) return;

    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: JobStatus.RUNNING, retries: { increment: 1 } },
    });

    const payload = job.payloadJson as { sessionId: string };
    const sessionId = payload.sessionId;

    try {
      const session = await prisma.assessmentSession.findUnique({
        where: { id: sessionId },
        include: {
          turns: {
            orderBy: { turnIndex: "asc" },
            include: { transcription: true, recording: true },
          },
          template: true,
          user: true,
        },
      });

      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Convert turns to ConversationTurnItem
      const turnItems: ConversationTurnItem[] = session.turns.map((t) => ({
        turnIndex: t.turnIndex,
        stage: t.stage,
        speaker: t.speaker as "EXAMINER" | "LEARNER",
        textContent: t.transcription?.rawText || t.textContent,
        pinyinContent: t.pinyinContent || undefined,
        audioUrl: t.audioUrl || undefined,
        durationMs: t.durationMs || undefined,
        createdAt: t.createdAt,
      }));

      // Evaluate conversation
      const report = await ScoringEngine.evaluateConversation(
        turnItems,
        session.template.targetLevel
      );

      // Save into DB inside transaction
      await prisma.$transaction(async (tx) => {
        // Delete any previous result if retrying
        await tx.assessmentResult.deleteMany({
          where: { sessionId },
        });

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

        // Insert dimension scores
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

        // Insert grammar and vocabulary recommendations
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

        // Update session status to COMPLETED
        await tx.assessmentSession.update({
          where: { id: sessionId },
          data: {
            status: SessionStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        // Create user notification
        await tx.notification.create({
          data: {
            userId: session.userId,
            title: "Assessment Report Ready (评估报告已生成)",
            message: `Your ${session.template.title} assessment has been scored. Overall Score: ${report.overallScore}/100 (${report.hskEstimate}).`,
            type: "SCORE_READY",
            linkUrl: `/dashboard/reports/${sessionId}`,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            actorId: session.userId,
            action: "ASSESSMENT_SCORING_COMPLETED",
            entityType: "AssessmentSession",
            entityId: sessionId,
            metadataJson: {
              overallScore: report.overallScore,
              hskEstimate: report.hskEstimate,
            },
          },
        });
      });

      // Mark job as COMPLETED
      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          processedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.error(`Background job ${jobId} failed:`, err);
      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          lastError: err?.message || String(err),
        },
      });
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.FAILED,
          failureReason: err?.message || "Scoring pipeline error",
        },
      });
    }
  }
}
