export type AssessmentStageNumber = 1 | 2 | 3 | 4 | 5;

export interface StageDefinition {
  stage: AssessmentStageNumber;
  name: string;
  nameZh: string;
  description: string;
  targetTurns: number;
}

export interface ConversationTurnItem {
  turnIndex: number;
  stage: number;
  speaker: "EXAMINER" | "LEARNER";
  textContent: string;
  pinyinContent?: string;
  audioUrl?: string;
  durationMs?: number;
  createdAt?: string | Date;
}

export interface DimensionScore {
  key: "pronunciation" | "fluency" | "vocabulary" | "grammar" | "coherence" | "comprehension" | "interaction";
  name: string;
  nameZh: string;
  weight: number; // e.g. 0.20
  score: number; // e.g. 17.5
  maxScore: number; // e.g. 20.0
  performanceLevel: "Mastery" | "Proficient" | "Developing" | "Elementary";
  evidenceQuotes: string[];
  rationale: string;
  suggestions: string[];
}

export interface GrammarAnalysisItem {
  original: string;
  corrected: string;
  explanation: string;
  category: string;
  example: string;
}

export interface VocabularyAnalysisItem {
  original: string;
  betterAlternatives: string[];
  explanation: string;
  example: string;
}

export interface PronunciationAnalysisItem {
  focus: string; // e.g. "Third tone sandhi (三声变调)", "Retroflex initials (zh, ch, sh)"
  observation: string;
  suggestion: string;
  sampleWords: string[];
}

export interface ComprehensiveAssessmentReport {
  overallScore: number;
  cefrEstimate: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  hskEstimate: "HSK 1 (Unofficial)" | "HSK 2 (Unofficial)" | "HSK 3 (Unofficial)" | "HSK 4 (Unofficial)" | "HSK 5 (Unofficial)" | "HSK 6 (Unofficial)";
  performanceSummary: string;
  confidenceLevel: number;
  isAcousticAided: boolean;
  dimensions: DimensionScore[];
  strengths: string[];
  weaknesses: string[];
  priorityAreas: string[];
  grammarCorrections: GrammarAnalysisItem[];
  vocabularyEnhancements: VocabularyAnalysisItem[];
  pronunciationNotes: PronunciationAnalysisItem[];
  improvementPlan: {
    week: number;
    title: string;
    focus: string;
    activities: string[];
  }[];
}
