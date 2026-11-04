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
}
