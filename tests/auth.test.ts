import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { signToken, verifyToken } from "../src/lib/auth/jwt";
import { UserRole } from "@prisma/client";

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
      role: UserRole.LEARNER,
      name: "Test Candidate",
    };

    const token = await signToken(payload, "1h");
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(UserRole.LEARNER);
  });

  it("should reject tampered or invalid JWT tokens", async () => {
    const result = await verifyToken("invalid.token.structure");
    expect(result).toBeNull();
  });
});
