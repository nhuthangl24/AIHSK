import fs from "fs";
import path from "path";
import { STAGES_CONFIG } from "@/lib/ai/examiner-service";

export interface StoredTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  targetLevel: string;
  estimatedDurationMinutes: number;
  maxTurns: number;
  stagesConfig: any;
  examinerPrompt: string;
  rubricId: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredTurn {
  id: string;
  sessionId: string;
  turnIndex: number;
  stage: number;
  speaker: "EXAMINER" | "LEARNER";
  textContent: string;
  pinyinContent?: string | null;
  audioUrl?: string | null;
  durationMs?: number;
  createdAt: string;
}

export interface StoredScoreDimension {
  id: string;
  dimensionKey?: string;
  dimensionName: string;
  score: number;
  maxScore?: number;
  weight: number;
  performanceLevel?: string;
  evidenceQuotesJson?: string[];
  rationale?: string;
  feedback?: string;
  suggestionsJson?: string[];
}

export interface StoredRecommendation {
  id: string;
  category: string;
  originalPhrase?: string | null;
  correctedPhrase?: string;
  explanation?: string;
  exampleSentence?: string | null;
  priority: number;
  recommendation?: string;
  actionableExercise?: string;
}

export interface StoredResult {
  id: string;
  sessionId: string;
  overallScore: number;
  hskLevel?: string;
  hskEstimate?: string;
  cefrLevel?: string;
  cefrEstimate?: string;
  passingStatus?: boolean;
  feedbackSummary?: string;
  performanceSummary?: string;
  scoringRationale?: string;
  confidenceLevel?: number;
  isAcousticAided?: boolean;
  strengthsJson?: string[];
  weaknessesJson?: string[];
  priorityAreasJson?: string[];
  improvementPlanJson?: any[];
  scoredAt: string;
  scoreDimensions: StoredScoreDimension[];
  recommendations: StoredRecommendation[];
}

export interface StoredSession {
  id: string;
  assignmentId: string | null;
  templateId: string;
  rubricId: string | null;
  userId: string;
  status: "READY" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED" | "FAILED";
  currentStage: number;
  currentTurn: number;
  totalTurns: number;
  totalDurationSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  template?: StoredTemplate;
  turns: StoredTurn[];
  result?: StoredResult | null;
}

export interface StoredUserProfile {
  userId: string;
  name?: string;
  email?: string;
  targetLevel: string;
  nativeLanguage: string;
  learningGoal?: string;
  studyHoursWeekly: number;
  bio?: string;
  updatedAt: string;
}

interface StoreData {
  templates: Record<string, StoredTemplate>;
  sessions: Record<string, StoredSession>;
  profiles: Record<string, StoredUserProfile>;
}

const DEFAULT_TEMPLATES: StoredTemplate[] = [
  {
    id: "tpl-hsk1",
    title: "HSK 1 Khẩu Ngữ Cơ Bản (Sơ Cấp 1)",
    slug: "hsk-1-speaking-basic",
    description: "Khảo thí phản xạ chào hỏi, giới thiệu bản thân, quốc tịch, sở thích và gia đình theo chuẩn HSK 1.",
    category: "HSK_ORIENTED",
    targetLevel: "HSK 1",
    estimatedDurationMinutes: 10,
    maxTurns: 16,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Conduct a gentle 5-stage oral assessment for HSK 1 beginner learners with clear, standard Mandarin and Pinyin.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-hsk2",
    title: "HSK 2 Khẩu Ngữ Giao Tiếp Hàng Ngày (Sơ Cấp 2)",
    slug: "hsk-2-speaking-daily",
    description: "Tình huống mua sắm, hỏi đường, ăn uống và trao đổi thói quen sinh hoạt thường nhật.",
    category: "HSK_ORIENTED",
    targetLevel: "HSK 2",
    estimatedDurationMinutes: 12,
    maxTurns: 18,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Assess everyday conversational Mandarin for HSK 2 candidates.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-hsk3",
    title: "HSK 3 Spoken Mandarin Diagnostic",
    slug: "hsk-3-oral-proficiency",
    description: "Khảo thí năng lực diễn đạt ý kiến, kể lại trải nghiệm du lịch, học tập và công việc hàng ngày.",
    category: "HSK_ORIENTED",
    targetLevel: "HSK 3",
    estimatedDurationMinutes: 15,
    maxTurns: 18,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Assess student's narrative fluency, sentence transitions, and tonal clarity under adaptive questioning.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-hsk4",
    title: "HSK 4 Intermediate Argumentation & Culture",
    slug: "hsk-4-intermediate-argumentation",
    description: "Thảo luận sâu về chủ đề đời sống hiện đại, công nghệ, hiện tượng xã hội và đưa ra lập luận cá nhân.",
    category: "HSK_ORIENTED",
    targetLevel: "HSK 4",
    estimatedDurationMinutes: 15,
    maxTurns: 18,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Evaluate student's discourse coherence, conjunction pairs, and tone stabilization under deeper probing questions.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-hsk5",
    title: "HSK 5 Diễn Đạt Lưu Loát & Phản Biện (Cao Cấp 1)",
    slug: "hsk-5-advanced-fluency",
    description: "Đánh giá khả năng phân tích, so sánh quan điểm phức tạp, tranh luận văn hóa và chuyên ngành.",
    category: "HSK_ORIENTED",
    targetLevel: "HSK 5",
    estimatedDurationMinutes: 18,
    maxTurns: 20,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Assess advanced fluency, nuanced vocabulary, and rhetorical structuring in Mandarin.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-hsk6",
    title: "HSK 6 Thành Thạo Ngôn Ngữ & Học Thuật (Cao Cấp 2)",
    slug: "hsk-6-mastery",
    description: "Thuyết trình học thuật, nghị luận xã hội sâu rộng, sử dụng thành ngữ (成语) nhuần nhuyễn.",
    category: "HSK_ORIENTED",
    targetLevel: "HSK 6",
    estimatedDurationMinutes: 20,
    maxTurns: 20,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Evaluate near-native idiomatic expression, register switching, and rapid conceptual synthesis.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-business",
    title: "Business Chinese & Professional Communication",
    slug: "business-mandarin-workplace",
    description: "Tập trung vào đàm phán hợp đồng, văn hóa doanh nghiệp, phỏng vấn ứng tuyển và trao đổi thương mại.",
    category: "BUSINESS",
    targetLevel: "HSK 5",
    estimatedDurationMinutes: 18,
    maxTurns: 20,
    stagesConfig: STAGES_CONFIG,
    examinerPrompt: "Evaluate workplace register, formal Chinese business terminology, and persuasive clarity.",
    rubricId: "rubric-standard-v1",
    isActive: true,
    isPublic: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class AssessmentStore {
  private data: StoreData = {
    templates: {},
    sessions: {},
    profiles: {},
  };
  private initialized = false;
  private filePath: string;

  constructor() {
    // Choose writable directory for storage (works on local dev & serverless /tmp)
    const isServerless = Boolean(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const baseDir = isServerless ? "/tmp" : path.join(process.cwd(), ".data");
    this.filePath = path.join(baseDir, "assessment_store.json");
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load from disk if available
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.templates) this.data.templates = parsed.templates;
        if (parsed.sessions) this.data.sessions = parsed.sessions;
        if (parsed.profiles) this.data.profiles = parsed.profiles;
      }
    } catch (e) {
      console.warn("Could not load assessment store from disk:", e);
    }

    // Seed default templates if missing
    for (const tpl of DEFAULT_TEMPLATES) {
      if (!this.data.templates[tpl.id]) {
        this.data.templates[tpl.id] = tpl;
      }
    }
  }

  private persist() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      // Non-fatal if filesystem is read-only; memory cache still works
      console.warn("Warning: Could not persist assessment store to disk:", e);
    }
  }

  // --- TEMPLATES ---
  getTemplates(): StoredTemplate[] {
    this.init();
    return Object.values(this.data.templates).filter((t) => t.isActive && t.isPublic);
  }

  getTemplate(id: string): StoredTemplate | null {
    this.init();
    return this.data.templates[id] || Object.values(this.data.templates).find((t) => t.slug === id) || null;
  }

  saveTemplate(template: StoredTemplate): StoredTemplate {
    this.init();
    this.data.templates[template.id] = template;
    this.persist();
    return template;
  }

  // --- SESSIONS ---
  getSession(id: string): StoredSession | null {
    this.init();
    const session = this.data.sessions[id];
    if (!session) return null;

    // Attach template if available
    if (!session.template && session.templateId) {
      session.template = this.getTemplate(session.templateId) || undefined;
    }
    return session;
  }

  getAllSessions(): StoredSession[] {
    this.init();
    return Object.values(this.data.sessions)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((s) => ({
        ...s,
        template: s.template || (s.templateId ? this.getTemplate(s.templateId) || undefined : undefined),
      }));
  }

  getSessionsByUserId(userId: string): StoredSession[] {
    this.init();
    return Object.values(this.data.sessions)
      .filter((s) => s.userId === userId || s.userId?.includes(userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((s) => ({
        ...s,
        template: s.template || (s.templateId ? this.getTemplate(s.templateId) || undefined : undefined),
      }));
  }

  saveSession(session: StoredSession): StoredSession {
    this.init();
    this.data.sessions[session.id] = session;
    this.persist();
    return session;
  }

  updateSession(
    id: string,
    updates: Partial<Omit<StoredSession, "id" | "template" | "turns" | "result">>
  ): StoredSession | null {
    this.init();
    const existing = this.data.sessions[id];
    if (!existing) return null;

    Object.assign(existing, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return existing;
  }

  addTurn(sessionId: string, turn: StoredTurn): StoredTurn {
    this.init();
    const session = this.data.sessions[sessionId];
    if (!session) {
      throw new Error(`Cannot add turn: session ${sessionId} not found`);
    }

    if (!session.turns) session.turns = [];
    session.turns.push(turn);
    session.updatedAt = new Date().toISOString();
    this.persist();
    return turn;
  }

  saveResult(sessionId: string, result: StoredResult): StoredResult {
    this.init();
    const session = this.data.sessions[sessionId];
    if (session) {
      session.result = result;
      session.status = "COMPLETED";
      session.completedAt = new Date().toISOString();
      session.updatedAt = new Date().toISOString();
      this.persist();
    }
    return result;
  }

  // --- USER PROFILES ---
  getProfile(userId: string): StoredUserProfile | null {
    this.init();
    return this.data.profiles[userId] || null;
  }

  saveProfile(profile: StoredUserProfile): StoredUserProfile {
    this.init();
    this.data.profiles[profile.userId] = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.profiles[profile.userId];
  }
}

// Global singleton to prevent memory reinitialization in serverless warm invocations
declare global {
  // eslint-disable-next-line no-var
  var __aihsk_assessment_store: AssessmentStore | undefined;
}

export const assessmentStore: AssessmentStore =
  globalThis.__aihsk_assessment_store || new AssessmentStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__aihsk_assessment_store = assessmentStore;
}
