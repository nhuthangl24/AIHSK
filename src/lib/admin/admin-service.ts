import { FirebaseDb } from "@/lib/firebase-db";
import { assessmentStore } from "@/lib/db/assessment-store";
import { ADMIN_EMAILS } from "@/lib/auth/session";

export interface EnrichedAdminUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  targetLevel: string;
  nativeLanguage: string;
  studyHoursWeekly: number;
  totalSessions: number;
  completedSessions: number;
  avgScore: number | null;
  lastActive: string;
  avatar?: string | null;
}

export class AdminService {
  /**
   * Retrieves unified list of all platform users merged from:
   * 1. Firebase Firestore registered users (Primary Auth DB)
   * 2. AssessmentStore stored user profiles
   * 3. Examination session candidate records
   */
  static async getEnrichedUsers(): Promise<EnrichedAdminUser[]> {
    const fbUsers = await FirebaseDb.getAllUsers().catch(() => []);
    const storedProfiles = assessmentStore.getAllProfiles();
    const allSessions = assessmentStore.getAllSessions();

    const userMap = new Map<string, EnrichedAdminUser>();

    // 1. Add all Firestore users
    for (const u of fbUsers) {
      const email = u.email?.toLowerCase().trim() || "";
      const key = email || u.id;
      const isAdmin = ADMIN_EMAILS.includes(email) || u.role === "ADMIN";

      userMap.set(key, {
        userId: u.id,
        name: u.name || (email ? email.split("@")[0] : "Học Viên"),
        email,
        role: isAdmin ? "ADMIN" : "USER",
        targetLevel: u.targetLevel || "HSK 3",
        nativeLanguage: u.nativeLanguage || "Tiếng Việt",
        studyHoursWeekly: u.studyHoursWeekly || 3,
        totalSessions: 0,
        completedSessions: 0,
        avgScore: null,
        lastActive: u.lastLoginAt || u.updatedAt || u.createdAt || new Date().toISOString(),
        avatar: u.avatar || null,
      });
    }

    // 2. Add or merge stored profiles from assessmentStore
    for (const p of storedProfiles) {
      const email = p.email?.toLowerCase().trim() || "";
      const key = email || p.userId;
      const existing = userMap.get(key);
      const isAdmin = ADMIN_EMAILS.includes(email);

      if (!existing) {
        userMap.set(key, {
          userId: p.userId,
          name: p.name || (email ? email.split("@")[0] : "Học Viên"),
          email,
          role: isAdmin ? "ADMIN" : "USER",
          targetLevel: p.targetLevel || "HSK 3",
          nativeLanguage: p.nativeLanguage || "Tiếng Việt",
          studyHoursWeekly: p.studyHoursWeekly || 3,
          totalSessions: 0,
          completedSessions: 0,
          avgScore: null,
          lastActive: p.updatedAt || new Date().toISOString(),
          avatar: null,
        });
      } else {
        if (p.name && (!existing.name || existing.name === "Học Viên")) {
          existing.name = p.name;
        }
        if (p.targetLevel) existing.targetLevel = p.targetLevel;
        if (p.nativeLanguage) existing.nativeLanguage = p.nativeLanguage;
        if (p.studyHoursWeekly) existing.studyHoursWeekly = p.studyHoursWeekly;
      }
    }

    // 3. Add users who participated in assessment sessions if not yet indexed
    for (const s of allSessions) {
      const email = s.userEmail?.toLowerCase().trim() || "";
      const id = s.userId;
      const key = email || id;

      if (key && !userMap.has(key)) {
        const isAdmin = Boolean(email && ADMIN_EMAILS.includes(email));
        userMap.set(key, {
          userId: id,
          name: email ? email.split("@")[0] : `Học Viên ${id.substring(0, 8)}`,
          email,
          role: isAdmin ? "ADMIN" : "USER",
          targetLevel: s.template?.targetLevel || s.result?.hskLevel || "HSK 3",
          nativeLanguage: "Tiếng Việt",
          studyHoursWeekly: 3,
          totalSessions: 0,
          completedSessions: 0,
          avgScore: null,
          lastActive: s.completedAt || s.startedAt || s.createdAt || new Date().toISOString(),
          avatar: null,
        });
      }
    }

    // 4. Precompute session lookups for fast enrichment
    const sessionsByUserId = new Map<string, typeof allSessions>();
    const sessionsByEmail = new Map<string, typeof allSessions>();

    for (const s of allSessions) {
      if (s.userId) {
        const list = sessionsByUserId.get(s.userId) || [];
        list.push(s);
        sessionsByUserId.set(s.userId, list);
      }
      if (s.userEmail) {
        const em = s.userEmail.toLowerCase().trim();
        const list = sessionsByEmail.get(em) || [];
        list.push(s);
        sessionsByEmail.set(em, list);
      }
    }

    // 5. Calculate exam statistics for each user
    const result: EnrichedAdminUser[] = [];

    for (const user of userMap.values()) {
      const userEmail = user.email?.toLowerCase().trim();
      const userSessionsById = sessionsByUserId.get(user.userId) || [];
      const userSessionsByEmail = userEmail ? sessionsByEmail.get(userEmail) || [] : [];

      // Combine unique sessions
      const sessionMap = new Map<string, (typeof allSessions)[0]>();
      for (const s of userSessionsById) sessionMap.set(s.id, s);
      for (const s of userSessionsByEmail) sessionMap.set(s.id, s);

      const userSessions = Array.from(sessionMap.values());
      const completed = userSessions.filter((s) => s.status === "COMPLETED");
      const totalScore = completed.reduce((sum, s) => sum + (s.result?.overallScore || 0), 0);
      const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : null;

      let latestDate = user.lastActive;
      if (userSessions[0]) {
        const sDate = userSessions[0].completedAt || userSessions[0].startedAt || userSessions[0].createdAt;
        if (sDate && new Date(sDate) > new Date(latestDate)) {
          latestDate = sDate;
        }
      }

      result.push({
        ...user,
        totalSessions: userSessions.length,
        completedSessions: completed.length,
        avgScore,
        lastActive: latestDate,
      });
    }

    // Sort by latest activity first
    return result.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }
}
