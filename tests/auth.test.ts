import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { signToken, verifyToken } from "../src/lib/auth/jwt";
import { UserRole } from "../src/types/database";

describe("Authentication & Security Unit Tests", () => {
  it("should securely hash and verify passwords using bcrypt", async () => {
    const rawPassword = "StrongPassword2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword("WrongPassword!", hash);
    expect(isWrong).toBe(false);
  });

  it("should sign and verify JWT session tokens", async () => {
    const payload = {
      userId: "user_test_123",
      email: "test@aihsk.com",
      role: UserRole.USER,
      name: "Test Candidate",
    };

    const token = await signToken(payload, "1h");
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(UserRole.USER);
  });

  it("should reject tampered or invalid JWT tokens", async () => {
    const result = await verifyToken("invalid.token.structure");
    expect(result).toBeNull();
  });

  it("should support Google login payload verification and token issuance", async () => {
    const googleUser = {
      userId: "google_sub_987654",
      email: "vietnam.candidate@gmail.com",
      role: UserRole.USER,
      name: "Google Learner",
    };

    const token = await signToken(googleUser);
    const verified = await verifyToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("vietnam.candidate@gmail.com");
    expect(verified?.name).toBe("Google Learner");
    expect(verified?.role).toBe(UserRole.USER);
  });

  it("should parse and decode user profile cookie safely", async () => {
    const { getUserProfileCookie, PROFILE_COOKIE_NAME } = await import("../src/lib/auth/session");

    const sampleProfile = {
      name: "Nguyễn Văn A",
      targetLevel: "HSK 5",
      studyHoursWeekly: 7,
      learningGoal: "Thi đỗ HSK 5 trong 3 tháng",
      nativeLanguage: "Tiếng Việt",
      updatedAt: new Date().toISOString(),
    };

    const mockCookieStore = {
      get: (name: string) => {
        if (name === PROFILE_COOKIE_NAME) {
          return { value: encodeURIComponent(JSON.stringify(sampleProfile)) };
        }
        return undefined;
      },
    };

    const parsed = getUserProfileCookie(mockCookieStore);
    expect(parsed).not.toBeNull();
    expect(parsed?.name).toBe("Nguyễn Văn A");
    expect(parsed?.targetLevel).toBe("HSK 5");
    expect(parsed?.studyHoursWeekly).toBe(7);
  });
});
