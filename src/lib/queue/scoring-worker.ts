import { ScoringEngine } from "@/lib/ai/scoring-engine";
import { ConversationTurnItem } from "@/lib/ai/types";
import { assessmentStore } from "@/lib/db/assessment-store";

export class ScoringWorker {
  /**
   * Enqueues a scoring job for a completed assessment session
   */
  static async enqueueScoringJob(sessionId: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setTimeout(() => {
      this.processSession(sessionId, jobId).catch((err) => {
        console.error(`Error processing scoring for session ${sessionId}:`, err);
      });
    }, 50);

    return jobId;
  }

  /**
   * Ensures that a session in PROCESSING status has its scoring pipeline completed.
   */
  static async ensureSessionScored(sessionId: string): Promise<void> {
    const stored = assessmentStore.getSession(sessionId);
    if (stored && stored.status === "COMPLETED" && stored.result) {
      return;
    }

    await this.processSession(sessionId);
  }

  /**
   * Processes a scoring job by Job ID
   */
  static async processJob(jobId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.processSession(sessionId, jobId);
    }
  }

  /**
   * Directly processes and finalizes scoring for an assessment session
   */
  static async processSession(sessionId: string, jobId?: string): Promise<void> {
    const storedSession = assessmentStore.getSession(sessionId);
    if (!storedSession) {
      throw new Error(`Session ${sessionId} not found in assessment store`);
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
