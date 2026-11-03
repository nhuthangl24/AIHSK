import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { AIClient } from "@/lib/ai/ai-client";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ORG_ADMIN)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    let { baseUrl, apiKey, modelId } = body;

    // If apiKey is omitted or masked, read current active key
    if (!apiKey || apiKey.includes("••••")) {
      const active = await AIClient.getActiveConfig();
      apiKey = active.apiKey;
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Vui lòng nhập API Key (ví dụ: ark-...) trước khi kiểm tra kết nối.",
        },
        { status: 400 }
      );
    }

    const testResult = await AIClient.testConnection({
      baseUrl: baseUrl || "https://hhtechapi.net/v1",
      apiKey,
      modelId: modelId || "claude-sonnet-4.6",
    });

    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Kiểm tra kết nối thất bại",
      },
      { status: 500 }
    );
  }
}
