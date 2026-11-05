import { getFirestoreDb } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit, setDoc } from "firebase/firestore";

export interface FirebaseUserDoc {
  id: string;
  email: string;
  name: string;
  role?: string;
  targetHsk?: number | string;
  targetLevel?: string;
  streakDays?: number;
  totalMastered?: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  nativeLanguage?: string;
  studyHoursWeekly?: number;
  learningGoal?: string;
}

function normalizeTargetLevel(targetHsk?: number | string): string {
  if (!targetHsk) return "HSK 3";
  const str = String(targetHsk).trim();
  if (str.toUpperCase().startsWith("HSK")) return str.toUpperCase();
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 1 && num <= 6) return `HSK ${num}`;
  return "HSK 3";
}

export class FirebaseDb {
  /**
   * Get all registered users from Firestore collection 'users'
   */
  static async getAllUsers(): Promise<FirebaseUserDoc[]> {
    try {
      const db = getFirestoreDb();
      if (!db) return [];

      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const level = normalizeTargetLevel(data.targetHsk || data.targetLevel);
        const email = (data.email || "").toLowerCase().trim();

        return {
          id: docSnap.id,
          email,
          name: data.name || (email ? email.split("@")[0] : "Học Viên"),
          role: (data.role || "USER").toUpperCase(),
          targetHsk: data.targetHsk || 3,
          targetLevel: level,
          streakDays: typeof data.streakDays === "number" ? data.streakDays : 1,
          totalMastered: typeof data.totalMastered === "number" ? data.totalMastered : 0,
          avatar: data.avatar || data.photoURL || null,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || new Date().toISOString(),
          nativeLanguage: data.nativeLanguage || "Tiếng Việt",
          studyHoursWeekly: data.studyHoursWeekly || 3,
          learningGoal: data.learningGoal || "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa",
        };
      });
    } catch (e) {
      console.warn("FirebaseDb getAllUsers note:", e);
      return [];
    }
  }

  /**
   * Find user in Firestore by email
   */
  static async findUserByEmail(email: string): Promise<FirebaseUserDoc | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;

      const normalized = email.toLowerCase().trim();
      const q = query(collection(db, "users"), where("email", "==", normalized), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;

      const docSnap = snap.docs[0];
      const data = docSnap.data();
      const level = normalizeTargetLevel(data.targetHsk || data.targetLevel);

      return {
        id: docSnap.id,
        email: data.email || normalized,
        name: data.name || normalized.split("@")[0],
        role: (data.role || "USER").toUpperCase(),
        targetHsk: data.targetHsk || 3,
        targetLevel: level,
        streakDays: typeof data.streakDays === "number" ? data.streakDays : 1,
        totalMastered: typeof data.totalMastered === "number" ? data.totalMastered : 0,
        avatar: data.avatar || data.photoURL || null,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || new Date().toISOString(),
        nativeLanguage: data.nativeLanguage || "Tiếng Việt",
        studyHoursWeekly: data.studyHoursWeekly || 3,
        learningGoal: data.learningGoal || "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa",
      };
    } catch (e) {
      console.warn("FirebaseDb findUserByEmail note:", e);
      return null;
    }
  }

  /**
   * Find user in Firestore by UID/id
   */
  static async findUserById(userId: string): Promise<FirebaseUserDoc | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;

      const userDocRef = doc(db, "users", userId);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) return null;

      const data = snap.data();
      const level = normalizeTargetLevel(data.targetHsk || data.targetLevel);

      return {
        id: snap.id,
        email: data.email || "",
        name: data.name || "",
        role: (data.role || "USER").toUpperCase(),
        targetHsk: data.targetHsk || 3,
        targetLevel: level,
        streakDays: typeof data.streakDays === "number" ? data.streakDays : 1,
        totalMastered: typeof data.totalMastered === "number" ? data.totalMastered : 0,
        avatar: data.avatar || data.photoURL || null,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || new Date().toISOString(),
        nativeLanguage: data.nativeLanguage || "Tiếng Việt",
        studyHoursWeekly: data.studyHoursWeekly || 3,
        learningGoal: data.learningGoal || "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa",
      };
    } catch (e) {
      console.warn("FirebaseDb findUserById note:", e);
      return null;
    }
  }

  /**
   * Update user in Firestore by UID/id or email
   */
  static async updateUser(
    userId: string,
    data: Partial<FirebaseUserDoc>,
    email?: string
  ): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;

      const targetEmail = (email || data.email || "").toLowerCase().trim();
      let targetDocId = userId;

      // If userId seems synthetic (e.g. starts with classnia_) and targetEmail exists, resolve real doc ID
      if (targetEmail && (userId.startsWith("classnia_") || !userId)) {
        const found = await this.findUserByEmail(targetEmail);
        if (found?.id) {
          targetDocId = found.id;
        }
      }

      const userDocRef = doc(db, "users", targetDocId);
      await setDoc(
        userDocRef,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e: any) {
      if (
        e?.code === "permission-denied" ||
        e?.message?.includes("PERMISSION_DENIED") ||
        e?.message?.includes("Missing or insufficient permissions")
      ) {
        // Expected when server-side Node process writes without Firebase Admin Service Account credentials.
        // Durable persistence is handled by PostgreSQL (Prisma) and assessmentStore.
        return false;
      }
      console.warn("FirebaseDb updateUser note:", e);
      return false;
    }
  }

  /**
   * Save assessment session to Firestore collection 'assessment_sessions'
   */
  static async saveSession(session: any): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db || !session || !session.id) return false;

      const docRef = doc(db, "assessment_sessions", session.id);
      // Remove any undefined properties which Firestore rejects
      const cleanData = JSON.parse(JSON.stringify(session));
      await setDoc(
        docRef,
        {
          ...cleanData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e: any) {
      if (
        e?.code === "permission-denied" ||
        e?.message?.includes("PERMISSION_DENIED") ||
        e?.message?.includes("Missing or insufficient permissions")
      ) {
        // Expected when server-side Node process writes without Firebase Admin Service Account credentials.
        return false;
      }
      console.warn("FirebaseDb saveSession note:", e);
      return false;
    }
  }

  /**
   * Get assessment session from Firestore by sessionId
   */
  static async getSession(sessionId: string): Promise<any | null> {
    try {
      const db = getFirestoreDb();
      if (!db || !sessionId) return null;

      const docRef = doc(db, "assessment_sessions", sessionId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data();
    } catch (e) {
      console.warn("FirebaseDb getSession note:", e);
      return null;
    }
  }

  /**
   * Save or update support ticket in Firestore collection 'support_tickets'
   */
  static async saveTicket(ticket: any): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db || !ticket || !ticket.id) return false;

      const docRef = doc(db, "support_tickets", ticket.id);
      const cleanData = JSON.parse(JSON.stringify(ticket));
      await setDoc(
        docRef,
        {
          ...cleanData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e: any) {
      if (
        e?.code === "permission-denied" ||
        e?.message?.includes("PERMISSION_DENIED") ||
        e?.message?.includes("Missing or insufficient permissions")
      ) {
        return false;
      }
      console.warn("FirebaseDb saveTicket note:", e);
      return false;
    }
  }

  /**
   * Get all support tickets from Firestore
   */
  static async getAllTickets(): Promise<any[]> {
    try {
      const db = getFirestoreDb();
      if (!db) return [];

      const colRef = collection(db, "support_tickets");
      const snap = await getDocs(colRef);
      if (snap.empty) return [];

      return snap.docs.map((d) => d.data());
    } catch (e: any) {
      // Permission denied or offline fallback
      return [];
    }
  }

  /**
   * Get support tickets for a specific user from Firestore
   */
  static async getTicketsByUser(userId: string, email?: string): Promise<any[]> {
    try {
      const db = getFirestoreDb();
      if (!db) return [];

      const colRef = collection(db, "support_tickets");
      const q = query(colRef, where("userId", "==", userId));
      const snap = await getDocs(q);
      const results: any[] = [];
      snap.forEach((d) => results.push(d.data()));

      if (email && email.includes("@")) {
        const normEmail = email.toLowerCase().trim();
        const qEmail = query(colRef, where("userEmail", "==", normEmail));
        const snapEmail = await getDocs(qEmail);
        snapEmail.forEach((d) => {
          const t = d.data();
          if (!results.some((r) => r.id === t.id)) {
            results.push(t);
          }
        });
      }

      return results;
    } catch (e) {
      return [];
    }
  }

  /**
   * Update support ticket in Firestore
   */
  static async updateTicket(id: string, updates: any): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db || !id) return false;

      const docRef = doc(db, "support_tickets", id);
      const cleanData = JSON.parse(JSON.stringify(updates));
      await setDoc(
        docRef,
        {
          ...cleanData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e: any) {
      return false;
    }
  }
}
