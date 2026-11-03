import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { AIClient, HHTECH_MODEL_CATALOG } from "@/lib/ai/ai-client";

function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const activeConfig = await AIClient.getActiveConfig();

  return NextResponse.json({
    config: {
      providerName: activeConfig.providerName,
      baseUrl: activeConfig.baseUrl,
      modelId: activeConfig.modelId,
      temperature: activeConfig.temperature ?? 0.7,
      isEnabled: activeConfig.isEnabled,
      hasKey: Boolean(activeConfig.apiKey),
      maskedKey: maskApiKey(activeConfig.apiKey),
    },
    catalog: HHTECH_MODEL_CATALOG,
    presets: [
      {
        id: "hhtech",
        name: "HHTECH.API (Đề xuất)",
        description: "Tích hợp toàn diện Claude, GPT, Gemini, Grok, DeepSeek qua một endpoint duy nhất tại Việt Nam.",
        baseUrl: "https://hhtechapi.net/v1",
        defaultModel: "claude-sonnet-4.6",
        keyPrefix: "ark-",
      },
      {
        id: "openai",
        name: "OpenAI Trực Tiếp",
        description: "Kết nối chính thức tới OpenAI API (gpt-4o, gpt-4o-mini).",
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o-mini",
        keyPrefix: "sk-",
      },
      {
        id: "anthropic",
        name: "Anthropic Claude Trực Tiếp",
        description: "Kết nối trực tiếp tới Anthropic API.",
        baseUrl: "https://api.anthropic.com/v1",
        defaultModel: "claude-3-5-sonnet-20241022",
        keyPrefix: "sk-ant-",
      },
      {
        id: "deepseek",
        name: "DeepSeek Trực Tiếp",
        description: "Kết nối trực tiếp DeepSeek V3 / R1.",
        baseUrl: "https://api.deepseek.com/v1",
        defaultModel: "deepseek-chat",
        keyPrefix: "sk-",
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { providerName, baseUrl, apiKey, modelId, temperature, isEnabled } = body;

    const saved = await AIClient.saveConfig({
      providerName: providerName || "hhtech",
      baseUrl: baseUrl || "https://hhtechapi.net/v1",
      apiKey: apiKey && !apiKey.includes("••••") ? apiKey : undefined,
      modelId: modelId || "claude-sonnet-4.6",
      temperature: typeof temperature === "number" ? temperature : 0.7,
      isEnabled: isEnabled ?? true,
      updatedById: user.userId,
      notes: `Configured by admin ${user.email} for HHTECH.API`,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: "AI_CONFIG_UPDATED",
        entityType: "AIProviderConfiguration",
        entityId: saved.id,
        metadataJson: {
          providerName: saved.providerName,
          modelId: saved.modelId,
          baseUrl,
          hasKey: Boolean(apiKey),
        },
      },
    });

    const updated = await AIClient.getActiveConfig();

    return NextResponse.json({
      success: true,
      message: "Cấu hình AI đã được cập nhật thành công vào hệ thống!",
      config: {
        providerName: updated.providerName,
        baseUrl: updated.baseUrl,
        modelId: updated.modelId,
        temperature: updated.temperature,
        isEnabled: updated.isEnabled,
        hasKey: Boolean(updated.apiKey),
        maskedKey: maskApiKey(updated.apiKey),
      },
    });
  } catch (err: any) {
    console.error("Failed to save AI config:", err);
    return NextResponse.json({ error: err?.message || "Failed to save AI config" }, { status: 500 });
  }
}
