import { describe, it, expect } from "vitest";
import { middleware } from "../src/middleware";
import { NextRequest } from "next/server";

describe("CORS & LAN Middleware Unit Tests", () => {
  it("should handle OPTIONS preflight requests with CORS headers", () => {
    const req = new NextRequest("http://192.168.1.44:3000/api/assessments", {
      method: "OPTIONS",
      headers: {
        origin: "http://192.168.1.44:3000",
        "access-control-request-method": "POST",
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://192.168.1.44:3000");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });

  it("should attach CORS headers to normal API responses", () => {
    const req = new NextRequest("http://192.168.1.44:3000/api/ping", {
      method: "GET",
      headers: {
        origin: "http://192.168.1.44:3000",
      },
    });

    const res = middleware(req);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://192.168.1.44:3000");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });
});
