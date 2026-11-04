export type HskkLevel = "HSKK_PRIMARY" | "HSKK_INTERMEDIATE" | "HSKK_ADVANCED";

export type HskkQuestionType =
  | "LISTEN_AND_REPEAT"     // 听后重复 (Phần 1 Sơ cấp & Trung cấp)
  | "LISTEN_AND_ANSWER"     // 听后回答 (Phần 2 Sơ cấp)
  | "PICTURE_DESCRIPTION"   // 看图说话 (Phần 2 Trung cấp)
  | "ANSWER_QUESTIONS"      // 回答问题 (Phần 3 Sơ cấp, Trung cấp, Cao cấp)
  | "LISTEN_AND_RETOLD"     // 听后复述 (Phần 1 Cao cấp)
  | "READ_PASSAGE";         // 朗读 (Phần 2 Cao cấp)

export interface HskkQuestion {
  id: string;
  partNumber: 1 | 2 | 3;
  questionIndex: number;
  type: HskkQuestionType;
  title: string;
  audioPrompt: string; // The prompt spoken by the official examiner
  pinyinPrompt?: string;
  vietnamesePrompt?: string;
  readingText?: string; // For reading passage in Advanced Part 2
  imageUrl?: string; // For picture description in Intermediate Part 2
  imageAlt?: string;
  prepTimeSeconds: number; // Preparation time before speaking
  speakingTimeSeconds: number; // Speaking recording time
  maxScore: number;
}

export interface HskkPartConfig {
  partNumber: 1 | 2 | 3;
  nameZh: string;
  nameVi: string;
  description: string;
  questionCount: number;
  totalTimeMinutes: number;
  maxScore: number;
  guidelines: string;
}

export interface HskkExamTemplate {
  id: string;
  level: HskkLevel;
  code: string;
  title: string;
  titleZh: string;
  description: string;
  targetVocab: string;
  hskEquivalent: string;
  totalQuestions: number;
  totalDurationMinutes: number;
  parts: HskkPartConfig[];
  questions: HskkQuestion[];
}

export interface HskkCandidateAnswer {
  questionId: string;
  partNumber: number;
  questionIndex: number;
  transcript: string;
  durationSeconds: number;
  spokenAt: string;
}

export interface HskkDetailedQuestionEvaluation {
  questionId: string;
  partNumber: number;
  questionIndex: number;
  questionType: HskkQuestionType;
  title: string;
  prompt: string;
  candidateSpoken: string;
  score: number;
  maxScore: number;
  pronunciationQuality: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  feedback: string;
  correction?: string;
  pinyinCorrection?: string;
}

export interface HskkResult {
  overallScore: number; // 0 - 100
  isPassed: boolean; // >= 60
  level: HskkLevel;
  levelName: string;
  certificateCode: string;
  part1Score: number;
  part1Max: number;
  part2Score: number;
  part2Max: number;
  part3Score: number;
  part3Max: number;
  fluencyScore: number;
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  detailedQuestions: HskkDetailedQuestionEvaluation[];
  evaluatedAt: string;
}

export interface HskkSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  candidateNumber: string; // 准考证号 (e.g. ZK202611049281)
  templateId: string;
  level: HskkLevel;
  mode: "OFFICIAL" | "PRACTICE";
  status: "INITIALIZING" | "IN_PROGRESS" | "SUBMITTING" | "COMPLETED";
  startedAt: string;
  completedAt?: string;
  currentQuestionIndex: number;
  answers: Record<string, HskkCandidateAnswer>;
  result?: HskkResult;
}
