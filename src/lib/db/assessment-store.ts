import fs from "fs";
import path from "path";
import { DEFAULT_SUPPORT_TICKETS } from "@/data/default-support-tickets";
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
  userEmail?: string | null;
  status: "READY" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
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
  metadata?: any;
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

export interface StoredSupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: "BUG" | "AI_FEEDBACK" | "FEATURE" | "ACCOUNT" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  title: string;
  description: string;
  relatedSessionId?: string | null;
  deviceInfo?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StoreData {
  templates: Record<string, StoredTemplate>;
  sessions: Record<string, StoredSession>;
  profiles: Record<string, StoredUserProfile>;
  tickets: Record<string, StoredSupportTicket>;
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

export function isJunkTemplate(t: StoredTemplate | null | undefined): boolean {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return false;
  if (!t) return true;
  if (t.id.startsWith("tpl_custom_") || t.id.startsWith("tpl-mw")) return true;
  const title = (t.title || "").toLowerCase();
  if (
    title.includes("đàm phán xuất nhập khẩu") ||
    title.includes("đề thi khảo thí") ||
    title.includes("thử nghiệm") ||
    title.includes("đã sửa") ||
    title.includes("test")
  ) {
    return true;
  }
  return false;
}

export function isTestSession(s: StoredSession | null | undefined): boolean {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return false;
  if (!s || !s.id) return true;
  const id = s.id.toLowerCase();
  if (id.startsWith("session_cold_") || id.startsWith("test_")) return true;

  const uId = (s.userId || "").toLowerCase();
  if (
    uId.startsWith("firebase_user_test_") ||
    uId.startsWith("firebase_test_user_") ||
    uId.startsWith("integration_user_") ||
    uId.startsWith("user_test_") ||
    uId.startsWith("test_user") ||
    uId.startsWith("purge_user_") ||
    uId.startsWith("student_test_") ||
    uId.startsWith("anonymous") ||
    uId.startsWith("guest_") ||
    uId.startsWith("learner_test_") ||
    uId.startsWith("learner_eval_") ||
    uId.startsWith("user_healed") ||
    uId === "user123"
  ) {
    return true;
  }

  const email = (s.userEmail || "").toLowerCase();
  if (
    email.endsWith("@example.com") ||
    email.endsWith("@test.com") ||
    email.endsWith("@purge.org") ||
    email === "test@test.com" ||
    email === "learner.sync@test.com" ||
    email === "healed@test.com" ||
    email === "learner88@example.com" ||
    email === "eval1@example.com"
  ) {
    return true;
  }

  const tId = (s.templateId || "").toLowerCase();
  if (tId.startsWith("tpl_custom_") || tId.startsWith("tpl-mw")) {
    return true;
  }

  return false;
}

export function isTestTicket(t: StoredSupportTicket | null | undefined): boolean {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return false;
  if (!t || !t.id) return true;
  const id = t.id.toUpperCase();
  if (
    id.startsWith("TK-TEST-") ||
    id.startsWith("TK-UPDATE-") ||
    id.startsWith("TK-ADM-") ||
    id.startsWith("TK-BULK-") ||
    id.startsWith("TK-SYNTH-") ||
    id.startsWith("TK-DEBUG-") ||
    id.startsWith("TK-HSKK-")
  ) {
    return true;
  }

  const uId = (t.userId || "").toLowerCase();
  if (
    uId.startsWith("user_seed_") ||
    uId.startsWith("firebase_user_test_") ||
    uId.startsWith("firebase_test_user_") ||
    uId.startsWith("integration_user_") ||
    uId.startsWith("user_test_") ||
    uId.startsWith("test_user") ||
    uId.startsWith("purge_user_")
  ) {
    return true;
  }

  const email = (t.userEmail || "").toLowerCase();
  if (
    email.endsWith("@example.com") ||
    email.endsWith("@test.com") ||
    email.endsWith("@purge.org") ||
    email === "ha.nguyen@classnia.id.vn" ||
    email === "duc.tm@gmail.com" ||
    email === "yen.le@outlook.com" ||
    email === "bao.pq@classnia.id.vn" ||
    email === "quynhanh.vu@classnia.id.vn" ||
    email === "huy.do@classnia.id.vn"
  ) {
    return true;
  }

  return false;
}

class AssessmentStore {
  private data: StoreData = {
    templates: {},
    sessions: {},
    profiles: {},
    tickets: {},
  };
  private initialized = false;
  private baseDir: string;
  private filePath: string;
  private sessionsDir: string;
  private profilesDir: string;
  private ticketsDir: string;

  constructor() {
    // Choose writable directory for storage (works on local dev & serverless /tmp)
    const isServerless = Boolean(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    this.baseDir = isServerless ? "/tmp" : path.join(process.cwd(), ".data");
    this.filePath = path.join(this.baseDir, "assessment_store.json");
    this.sessionsDir = path.join(this.baseDir, "sessions");
    this.profilesDir = path.join(this.baseDir, "profiles");
    this.ticketsDir = path.join(this.baseDir, "tickets");
    this.init();
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load from disk if available
    this.reloadFromDisk();

    // Seed default templates if missing
    for (const tpl of DEFAULT_TEMPLATES) {
      if (!this.data.templates[tpl.id]) {
        this.data.templates[tpl.id] = tpl;
      }
    }

    // Seed default support tickets if missing (ensures admin desk always has active tickets even on fresh serverless cold starts)
    if (!this.data.tickets) {
      this.data.tickets = {};
    }
    for (const ticket of DEFAULT_SUPPORT_TICKETS) {
      if (!this.data.tickets[ticket.id]) {
        this.data.tickets[ticket.id] = ticket;
      }
    }

    // Purge any lingering junk test templates, sessions, and test tickets
    for (const [id, tpl] of Object.entries(this.data.templates)) {
      if (isJunkTemplate(tpl)) {
        delete this.data.templates[id];
      }
    }
    for (const [id, s] of Object.entries(this.data.sessions || {})) {
      if (isTestSession(s)) {
        delete this.data.sessions[id];
      }
    }
    for (const [id, t] of Object.entries(this.data.tickets || {})) {
      if (isTestTicket(t)) {
        delete this.data.tickets[id];
      }
    }
  }

  public reloadFromDisk() {
    try {
      // 1. Ensure file exists from seed if missing (critical for serverless /tmp & fresh clones)
      if (!fs.existsSync(this.filePath)) {
        const candidateSeeds = [
          path.join(process.cwd(), "src", "data", "seed-assessment-store.json"),
          path.join(process.cwd(), ".data", "assessment_store.json"),
        ];

        for (const sp of candidateSeeds) {
          if (fs.existsSync(sp)) {
            try {
              if (!fs.existsSync(this.baseDir)) {
                fs.mkdirSync(this.baseDir, { recursive: true });
              }
              fs.copyFileSync(sp, this.filePath);
              break;
            } catch (copyErr) {
              console.warn("Could not copy seed assessment store:", copyErr);
            }
          }
        }
      }

      // 2. Read from primary store file
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.templates) {
          for (const [tId, tVal] of Object.entries(parsed.templates)) {
            if (!tId.startsWith("tpl_custom_") && (tVal as any)?.title !== "Đàm phán xuất nhập khẩu") {
              this.data.templates[tId] = tVal as any;
            }
          }
        }
        if (parsed.sessions) {
          for (const [sId, sVal] of Object.entries(parsed.sessions)) {
            if (!isTestSession(sVal as any)) {
              this.data.sessions[sId] = sVal as any;
            }
          }
        }
        if (parsed.profiles) Object.assign(this.data.profiles, parsed.profiles);
        if (parsed.tickets) {
          for (const [tId, tVal] of Object.entries(parsed.tickets)) {
            if (!isTestTicket(tVal as any)) {
              this.data.tickets[tId] = tVal as any;
            }
          }
        }
      }

      // 3. Fallback: if templates is suspiciously low (e.g. only defaults), attempt merging seed templates
      if (Object.keys(this.data.templates).length <= 7) {
        const seedPath = path.join(process.cwd(), "src", "data", "seed-assessment-store.json");
        if (fs.existsSync(seedPath)) {
          try {
            const seedRaw = fs.readFileSync(seedPath, "utf-8");
            const seedParsed = JSON.parse(seedRaw);
            if (seedParsed.templates) {
              for (const [tId, tVal] of Object.entries(seedParsed.templates)) {
                if (!tId.startsWith("tpl_custom_") && (tVal as any)?.title !== "Đàm phán xuất nhập khẩu") {
                  this.data.templates[tId] = tVal as any;
                }
              }
            }
            if (seedParsed.sessions && Object.keys(this.data.sessions).length === 0) {
              for (const [sId, sVal] of Object.entries(seedParsed.sessions)) {
                if (!isTestSession(sVal as any)) {
                  this.data.sessions[sId] = sVal as any;
                }
              }
            }
            if (seedParsed.tickets && Object.keys(this.data.tickets).length === 0) {
              for (const [tId, tVal] of Object.entries(seedParsed.tickets)) {
                if (!isTestTicket(tVal as any)) {
                  this.data.tickets[tId] = tVal as any;
                }
              }
            }
          } catch {}
        }
      }

      this.scanTicketsDir();
    } catch (e) {
      console.warn("Could not load assessment store from disk:", e);
    }
  }

  private getSessionFilePath(sessionId: string): string {
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.sessionsDir, `${safeId}.json`);
  }

  private saveSessionFile(session: StoredSession) {
    if (process.env.NODE_ENV === "test" || process.env.VITEST === "true" || isTestSession(session)) return;
    try {
      if (!fs.existsSync(this.sessionsDir)) {
        fs.mkdirSync(this.sessionsDir, { recursive: true });
      }
      fs.writeFileSync(this.getSessionFilePath(session.id), JSON.stringify(session, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write individual session file:", e);
    }
  }

  private loadSessionFile(sessionId: string): StoredSession | null {
    try {
      const p = this.getSessionFilePath(sessionId);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const session = JSON.parse(raw) as StoredSession;
        if (session && session.id) {
          this.data.sessions[session.id] = session;
          return session;
        }
      }
    } catch (e) {
      console.warn("Could not read individual session file:", e);
    }
    return null;
  }

  private persist() {
    if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const toPersist: StoreData = {
        templates: {},
        sessions: {},
        profiles: { ...this.data.profiles },
        tickets: {},
      };
      for (const [id, tpl] of Object.entries(this.data.templates)) {
        if (!isJunkTemplate(tpl)) toPersist.templates[id] = tpl;
      }
      for (const [id, s] of Object.entries(this.data.sessions)) {
        if (!isTestSession(s)) toPersist.sessions[id] = s;
      }
      for (const [id, t] of Object.entries(this.data.tickets)) {
        if (!isTestTicket(t)) toPersist.tickets[id] = t;
      }
      const tmpPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(toPersist, null, 2), "utf-8");
      fs.renameSync(tmpPath, this.filePath);
    } catch (e) {
      // Non-fatal if filesystem is read-only; memory cache still works
      console.warn("Warning: Could not persist assessment store to disk:", e);
    }
  }

  // --- TEMPLATES ---
  getTemplates(): StoredTemplate[] {
    this.init();
    return Object.values(this.data.templates).filter(
      (t) => t.isActive && t.isPublic && !t.id.startsWith("tpl_custom_") && t.title !== "Đàm phán xuất nhập khẩu"
    );
  }

  getAllTemplates(): StoredTemplate[] {
    this.init();
    return Object.values(this.data.templates).filter(
      (t) => !t.id.startsWith("tpl_custom_") && t.title !== "Đàm phán xuất nhập khẩu"
    );
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

  deleteTemplate(id: string): boolean {
    this.init();
    if (this.data.templates[id]) {
      delete this.data.templates[id];
      this.persist();
      return true;
    }
    return false;
  }

  // --- SESSIONS ---
  getSession(id: string): StoredSession | null {
    this.init();
    let session: StoredSession | null | undefined = this.data.sessions[id];
    if (!session) {
      session = this.loadSessionFile(id) || null;
    }
    if (!session) {
      this.reloadFromDisk();
      session = this.data.sessions[id];
    }
    if (!session) return null;

    // Attach template if available
    if (!session.template && session.templateId) {
      session.template = this.getTemplate(session.templateId) || undefined;
    }
    return session;
  }

  getAllSessions(includeTest = false): StoredSession[] {
    this.init();
    this.reloadFromDisk();

    // Also scan sessionsDir for any sessions written to individual json files
    try {
      if (fs.existsSync(this.sessionsDir)) {
        const files = fs.readdirSync(this.sessionsDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            const sessionId = file.replace(/\.json$/, "");
            const loaded = this.loadSessionFile(sessionId);
            if (loaded && loaded.id) {
              if (isTestSession(loaded)) {
                try {
                  fs.unlinkSync(path.join(this.sessionsDir, file));
                } catch {}
                delete this.data.sessions[loaded.id];
              } else if (!this.data.sessions[sessionId]) {
                this.data.sessions[loaded.id] = loaded;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not scan sessionsDir:", e);
    }

    return Object.values(this.data.sessions)
      .filter((s) => includeTest || !isTestSession(s))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((s) => ({
        ...s,
        template: s.template || (s.templateId ? this.getTemplate(s.templateId) || undefined : undefined),
      }));
  }

  getSessionsByUserId(userId: string): StoredSession[] {
    this.init();
    this.reloadFromDisk();
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
    this.saveSessionFile(session);
    this.persist();
    try {
      import("@/lib/firebase-db").then(({ FirebaseDb }) => {
        FirebaseDb.saveSession(session).catch(() => null);
      }).catch(() => null);
    } catch {}
    return session;
  }

  updateSession(
    id: string,
    updates: Partial<Omit<StoredSession, "id" | "template" | "turns" | "result">>
  ): StoredSession | null {
    this.init();
    let existing: StoredSession | null | undefined = this.data.sessions[id];
    if (!existing) {
      existing = this.loadSessionFile(id) || null;
    }
    if (!existing) {
      this.reloadFromDisk();
      existing = this.data.sessions[id];
    }
    if (!existing) return null;

    Object.assign(existing, updates, { updatedAt: new Date().toISOString() });
    this.saveSessionFile(existing);
    this.persist();
    return existing;
  }

  addTurn(sessionId: string, turn: StoredTurn): StoredTurn {
    this.init();
    let session: StoredSession | null | undefined = this.data.sessions[sessionId];
    if (!session) {
      session = this.loadSessionFile(sessionId) || null;
    }
    if (!session) {
      this.reloadFromDisk();
      session = this.data.sessions[sessionId];
    }
    if (!session) {
      // Create resilient in-flight session container
      session = {
        id: sessionId,
        assignmentId: null,
        templateId: "tpl-hsk3",
        rubricId: null,
        userId: "anonymous",
        status: "IN_PROGRESS",
        currentStage: turn.stage || 1,
        currentTurn: turn.turnIndex || 0,
        totalTurns: 20,
        totalDurationSeconds: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
        failureReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        turns: [turn],
        result: null,
      };
      this.data.sessions[sessionId] = session;
      this.saveSessionFile(session);
      this.persist();
      return turn;
    }

    if (!session.turns) session.turns = [];
    session.turns.push(turn);
    session.currentTurn = Math.max(session.currentTurn, turn.turnIndex);
    session.updatedAt = new Date().toISOString();
    this.saveSessionFile(session);
    this.persist();
    return turn;
  }

  saveResult(sessionId: string, result: StoredResult): StoredResult {
    this.init();
    let session: StoredSession | null | undefined = this.data.sessions[sessionId];
    if (!session) {
      session = this.loadSessionFile(sessionId) || null;
    }
    if (!session) {
      this.reloadFromDisk();
      session = this.data.sessions[sessionId];
    }
    if (session) {
      session.result = result;
      session.status = "COMPLETED";
      session.completedAt = new Date().toISOString();
      session.updatedAt = new Date().toISOString();
      this.saveSessionFile(session);
      this.persist();
      try {
        import("@/lib/firebase-db").then(({ FirebaseDb }) => {
          FirebaseDb.saveSession(session).catch(() => null);
        }).catch(() => null);
      } catch {}
    }
    return result;
  }

  deleteSession(sessionId: string): boolean {
    this.init();
    let deleted = false;
    if (this.data.sessions[sessionId]) {
      delete this.data.sessions[sessionId];
      deleted = true;
    }
    try {
      const file = this.getSessionFilePath(sessionId);
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        deleted = true;
      }
    } catch {}
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  // --- USER PROFILES ---
  getAllProfiles(): StoredUserProfile[] {
    this.init();
    const map = new Map<string, StoredUserProfile>();
    for (const p of Object.values(this.data.profiles)) {
      if (p && p.userId) {
        map.set(p.userId, p);
      }
    }
    return Array.from(map.values());
  }

  private getProfileFilePath(key: string): string {
    const safeKey = key.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.profilesDir, `${safeKey}.json`);
  }

  private saveProfileFile(key: string, profile: StoredUserProfile) {
    try {
      if (!fs.existsSync(this.profilesDir)) {
        fs.mkdirSync(this.profilesDir, { recursive: true });
      }
      fs.writeFileSync(this.getProfileFilePath(key), JSON.stringify(profile, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write individual profile file:", e);
    }
  }

  private loadProfileFile(key: string): StoredUserProfile | null {
    try {
      const p = this.getProfileFilePath(key);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const profile = JSON.parse(raw) as StoredUserProfile;
        if (profile) {
          this.data.profiles[key] = profile;
          if (profile.userId) this.data.profiles[profile.userId] = profile;
          if (profile.email) this.data.profiles[profile.email.toLowerCase().trim()] = profile;
          return profile;
        }
      }
    } catch (e) {
      console.warn("Could not read individual profile file:", e);
    }
    return null;
  }

  getProfile(userIdOrEmail: string): StoredUserProfile | null {
    this.init();
    if (!userIdOrEmail) return null;
    let profile: StoredUserProfile | null | undefined = this.data.profiles[userIdOrEmail];
    if (!profile) {
      profile = this.loadProfileFile(userIdOrEmail) || null;
    }
    if (!profile) {
      this.reloadFromDisk();
      profile = this.data.profiles[userIdOrEmail];
    }
    if (profile) return profile;

    const normalized = userIdOrEmail.toLowerCase().trim();
    if (normalized !== userIdOrEmail) {
      profile = this.data.profiles[normalized] || this.loadProfileFile(normalized) || null;
      if (profile) return profile;
    }

    return (
      Object.values(this.data.profiles).find(
        (p) =>
          p.userId === userIdOrEmail ||
          p.email?.toLowerCase().trim() === normalized
      ) || null
    );
  }

  saveProfile(profile: StoredUserProfile): StoredUserProfile {
    this.init();
    const cleanProfile: StoredUserProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    this.data.profiles[profile.userId] = cleanProfile;
    this.saveProfileFile(profile.userId, cleanProfile);
    if (profile.email) {
      const normEmail = profile.email.toLowerCase().trim();
      this.data.profiles[normEmail] = cleanProfile;
      this.saveProfileFile(normEmail, cleanProfile);
    }
    this.persist();
    return cleanProfile;
  }

  // --- SUPPORT TICKETS ---
  private getTicketFilePath(ticketId: string): string {
    const safeId = ticketId.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.ticketsDir, `${safeId}.json`);
  }

  private saveTicketFile(ticket: StoredSupportTicket) {
    if (process.env.NODE_ENV === "test" || process.env.VITEST === "true" || isTestTicket(ticket)) return;
    try {
      if (!fs.existsSync(this.ticketsDir)) {
        fs.mkdirSync(this.ticketsDir, { recursive: true });
      }
      fs.writeFileSync(this.getTicketFilePath(ticket.id), JSON.stringify(ticket, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write individual ticket file:", e);
    }
  }

  private scanTicketsDir() {
    try {
      if (fs.existsSync(this.ticketsDir)) {
        const files = fs.readdirSync(this.ticketsDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const raw = fs.readFileSync(path.join(this.ticketsDir, file), "utf-8");
              const t = JSON.parse(raw) as StoredSupportTicket;
              if (t && t.id) {
                if (isTestTicket(t)) {
                  try {
                    fs.unlinkSync(path.join(this.ticketsDir, file));
                  } catch {}
                  continue;
                }
                const existing = this.data.tickets[t.id];
                if (!existing || new Date(t.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
                  this.data.tickets[t.id] = t;
                }
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.warn("Could not scan ticketsDir:", e);
    }
  }

  getSupportTicket(id: string): StoredSupportTicket | null {
    this.init();
    let ticket = this.data.tickets?.[id];
    if (!ticket) {
      try {
        const filePath = this.getTicketFilePath(id);
        if (fs.existsSync(filePath)) {
          ticket = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          if (ticket) {
            this.data.tickets[ticket.id] = ticket;
          }
        }
      } catch (e) {
        console.warn("Could not read individual ticket file:", e);
      }
    }
    if (!ticket) {
      const matchDefault = DEFAULT_SUPPORT_TICKETS.find((t) => t.id === id);
      if (matchDefault) {
        ticket = { ...matchDefault };
        this.data.tickets[id] = ticket;
      }
    }
    return ticket || null;
  }

  saveSupportTicket(ticket: StoredSupportTicket): StoredSupportTicket {
    this.init();
    this.data.tickets[ticket.id] = ticket;
    this.saveTicketFile(ticket);
    this.persist();
    return ticket;
  }

  getSupportTicketsByUser(userId: string, email?: string): StoredSupportTicket[] {
    this.init();
    this.reloadFromDisk();
    this.scanTicketsDir();
    const normEmail = email?.toLowerCase().trim();

    return Object.values(this.data.tickets || {})
      .filter((t) => t.userId === userId || (normEmail && t.userEmail?.toLowerCase().trim() === normEmail))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllSupportTickets(): StoredSupportTicket[] {
    this.init();
    this.reloadFromDisk();
    this.scanTicketsDir();
    return Object.values(this.data.tickets || {})
      .filter((t) => !isTestTicket(t))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateSupportTicket(
    id: string,
    updates: Partial<StoredSupportTicket>,
    fallbackTicket?: StoredSupportTicket
  ): StoredSupportTicket | null {
    this.init();
    this.reloadFromDisk();
    this.scanTicketsDir();
    let existing = this.getSupportTicket(id);
    if (!existing && fallbackTicket) {
      existing = fallbackTicket;
      this.data.tickets[id] = fallbackTicket;
    }
    if (!existing) {
      const matchDefault = DEFAULT_SUPPORT_TICKETS.find((t) => t.id === id);
      if (matchDefault) {
        existing = { ...matchDefault };
        this.data.tickets[id] = existing;
      }
    }
    if (!existing) return null;

    const updated: StoredSupportTicket = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.tickets[id] = updated;
    this.saveTicketFile(updated);
    this.persist();
    return updated;
  }

  bulkUpsertTickets(incomingTickets: StoredSupportTicket[]): StoredSupportTicket[] {
    this.init();
    if (!Array.isArray(incomingTickets) || incomingTickets.length === 0) {
      return this.getAllSupportTickets();
    }
    for (const ticket of incomingTickets) {
      if (!ticket || !ticket.id || isTestTicket(ticket)) continue;
      const existing = this.data.tickets[ticket.id];
      if (!existing || new Date(ticket.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
        this.data.tickets[ticket.id] = ticket;
        this.saveTicketFile(ticket);
      }
    }
    this.persist();
    return this.getAllSupportTickets();
  }

  deleteSupportTicket(id: string): boolean {
    this.init();
    let deleted = false;
    if (this.data.tickets[id]) {
      delete this.data.tickets[id];
      deleted = true;
    }
    try {
      const file = this.getTicketFilePath(id);
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        deleted = true;
      }
    } catch {}
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  getDiskStorageStats() {
    this.init();
    this.reloadFromDisk();
    return {
      sessionsCount: Object.keys(this.data.sessions || {}).length,
      templatesCount: Object.keys(this.data.templates || {}).length,
      profilesCount: Object.keys(this.data.profiles || {}).length,
      ticketsCount: Object.keys(this.data.tickets || {}).length,
      storagePath: this.filePath,
    };
  }
}

// Global singleton to prevent memory reinitialization in serverless warm invocations
declare global {
  // eslint-disable-next-line no-var
  var __aihsk_assessment_store: AssessmentStore | undefined;
}

export const assessmentStore: AssessmentStore =
  globalThis.__aihsk_assessment_store || new AssessmentStore();

// Always keep singleton attached to globalThis in both dev & serverless production
globalThis.__aihsk_assessment_store = assessmentStore;
