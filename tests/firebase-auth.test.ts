import { describe, it, expect } from "vitest";
import { getAuthCookieOptions, ADMIN_EMAILS } from "../src/lib/auth/session";
import { getFirebaseConfig } from "../src/lib/firebase";
import { createClassniaToken, verifyClassniaToken } from "../src/lib/auth/classnia-token";

describe("Firebase & Subdomain Authentication Tests", () => {
  it("should have correct Classnia Firebase project configuration", () => {
    const config = getFirebaseConfig();
    expect(config.projectId).toBe("hsks-a320f");
    expect(config.authDomain).toContain("hsks-a320f.firebaseapp.com");
    expect(config.apiKey).toBeDefined();
    expect(config.appId).toContain("408971964413");
  });

  it("should recognize admin emails for automatic Super Admin privilege", () => {
    expect(ADMIN_EMAILS).toContain("luunhuthang2402@gmail.com");
    expect(ADMIN_EMAILS).toContain("nhuthangl24@gmail.com");
  });

  it("should generate secure auth cookie options", () => {
    const cookieOpts = getAuthCookieOptions();
    expect(cookieOpts.name).toBe("aihsk_token");
    expect(cookieOpts.httpOnly).toBe(true);
    expect(cookieOpts.path).toBe("/");
    expect(cookieOpts.sameSite).toBe("lax");
    expect(cookieOpts.maxAge).toBe(7 * 24 * 60 * 60);
  });

  it("should sign and verify Classnia HMAC cross-domain session tokens", () => {
    const mockUser = {
      id: "classnia_user_123",
      email: "test.student@classnia.id.vn",
      role: "user",
    };

    const token = createClassniaToken(mockUser);
    expect(token).toContain(".");

    const verified = verifyClassniaToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("test.student@classnia.id.vn");
    expect(verified?.userId).toBe("classnia_user_123");
  });

  it("should reject tampered or invalid Classnia tokens", () => {
    const invalidToken = "eyJ1c2VySWQiOiIxMjMifQ.invalidsig123";
    expect(verifyClassniaToken(invalidToken)).toBeNull();
  });
});
