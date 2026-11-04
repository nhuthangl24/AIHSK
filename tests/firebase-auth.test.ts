import { describe, it, expect } from "vitest";
import { getAuthCookieOptions, ADMIN_EMAILS } from "../src/lib/auth/session";
import { getFirebaseConfig } from "../src/lib/firebase";
import { createClassniaToken, verifyClassniaToken } from "../src/lib/auth/classnia-token";

describe("Firebase & Subdomain Authentication Tests", () => {
  it("should have correct Classnia Firebase project configuration", () => {
    const config = getFirebaseConfig();
    expect(config.projectId).toBe("hsks-a320f");
    expect(config.authDomain).toContain("firebaseapp.com");
    expect(config.apiKey).toBeDefined();
    expect(config.appId).toBeDefined();
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

  it("should successfully process Firebase SSO sync via /api/auth/firebase-sync without scoping ReferenceError", async () => {
    const { POST } = await import("../src/app/api/auth/firebase-sync/route");
    const { NextRequest } = await import("next/server");

    const req = new NextRequest("http://localhost:3000/api/auth/firebase-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test.firebase.user@classnia.id.vn",
        displayName: "Firebase Test User",
        uid: "uid_firebase_test_12345",
        photoURL: "https://example.com/avatar.png",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe("test.firebase.user@classnia.id.vn");
    expect(data.user.id).toBe("uid_firebase_test_12345");
  });
});
