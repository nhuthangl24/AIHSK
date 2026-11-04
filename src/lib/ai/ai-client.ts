import { prisma, isPrismaAvailable } from "@/lib/db/prisma";

export interface LLMConfig {
  providerName: string; // "hhtech" | "openai" | "anthropic" | "deepseek" | "custom"
  baseUrl: string;
  apiKey: string;
  modelId: string;
  temperature?: number;
  isEnabled: boolean;
  isDefault: boolean;
  notes?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelCatalogItem {
  id: string;
  name: string;
  provider: string;
  costInfo?: string;
  recommended?: boolean;
}

export const HHTECH_MODEL_CATALOG: { group: string; models: ModelCatalogItem[] }[] = [
  {
    group: "Claude (Anthropic)",
    models: [
      { id: "claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "Claude", costInfo: "1.200 credit / 1M token", recommended: true },
      { id: "claude-sonnet-5", name: "Claude Sonnet 5", provider: "Claude", costInfo: "1.200 credit / 1M token" },
      { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", provider: "Claude", costInfo: "1.200 credit / 1M token" },
      { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", provider: "Claude", costInfo: "400 credit / 1M token" },
      { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", provider: "Claude", costInfo: "400 credit / 1M token" },
      { id: "claude-opus-5-5", name: "Claude Opus 5.5", provider: "Claude", costInfo: "2.000 credit / 1M token" },
      { id: "claude-opus-5", name: "Claude Opus 5", provider: "Claude", costInfo: "2.000 credit / 1M token" },
      { id: "claude-opus-4-8", name: "Claude Opus 4.8", provider: "Claude", costInfo: "2.000 credit / 1M token" },
      { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "Claude", costInfo: "2.000 credit / 1M token" },
      { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Claude", costInfo: "2.000 credit / 1M token" },
      { id: "claude-fable-5-1", name: "Claude Fable 5.1", provider: "Claude", costInfo: "3.600 credit / 1M token" },
      { id: "claude-fable-5", name: "Claude Fable 5", provider: "Claude", costInfo: "3.600 credit / 1M token" },
    ],
  },
  {
    group: "GPT (OpenAI)",
    models: [
      { id: "gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "GPT", costInfo: "1.000 credit / 1M token", recommended: true },
      { id: "gpt-6.1-sol", name: "GPT-6.1 Sol", provider: "GPT", costInfo: "800 credit / 1M token" },
      { id: "gpt-6-sol", name: "GPT-6 Sol", provider: "GPT", costInfo: "800 credit / 1M token" },
      { id: "gpt-5.6-terra", name: "GPT-5.6 Terra", provider: "GPT", costInfo: "800 credit / 1M token" },
      { id: "gpt-6-luna", name: "GPT-6 Luna", provider: "GPT", costInfo: "600 credit / 1M token" },
      { id: "gpt-5.6-luna", name: "GPT-5.6 Luna", provider: "GPT", costInfo: "600 credit / 1M token" },
      { id: "gpt-6-astra", name: "GPT 6 Astra", provider: "GPT", costInfo: "2.000 credit / 1M token" },
      { id: "codex-auto-review", name: "Codex Auto Review", provider: "GPT", costInfo: "500 credit / 1M token" },
      { id: "gpt-4o", name: "GPT-4o Standard", provider: "GPT", costInfo: "1.500 credit / 1M token" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "GPT", costInfo: "300 credit / 1M token" },
    ],
  },
  {
    group: "Gemini (Google)",
    models: [
      { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", provider: "Gemini", costInfo: "650 credit / 1M token", recommended: true },
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", provider: "Gemini", costInfo: "700 credit / 1M token" },
      { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Gemini", costInfo: "500 credit / 1M token" },
      { id: "gemini-4-argon", name: "Gemini 4 Argon", provider: "Gemini", costInfo: "1.890 credit / 1M token" },
    ],
  },
  {
    group: "China AI (DeepSeek / GLM / Kimi / Qwen)",
    models: [
      { id: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash 0910", provider: "DeepSeek", costInfo: "600 credit / 1M token", recommended: true },
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", provider: "DeepSeek", costInfo: "600 credit / 1M token" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 0731", provider: "DeepSeek", costInfo: "350 credit / 1M token" },
      { id: "glm-5.2", name: "GLM 5.2", provider: "GLM", costInfo: "700 credit / 1M token" },
      { id: "glm-5.3-flash", name: "GLM 5.3 Flash", provider: "GLM", costInfo: "850 credit / 1M token" },
      { id: "kimi-k3", name: "Kimi K3", provider: "Kimi", costInfo: "1.000 credit / 1M token" },
      { id: "qwen3-coder-plus", name: "Qwen3 Coder Plus", provider: "Qwen", costInfo: "400 credit / 1M token" },
    ],
  },
  {
    group: "Grok (xAI)",
    models: [
      { id: "grok-4.6", name: "Grok 4.6 Heavy", provider: "Grok", costInfo: "900 credit / 1M token" },
      { id: "grok-4.5", name: "Grok 4.5 Heavy", provider: "Grok", costInfo: "800 credit / 1M token" },
      { id: "grok-4.7", name: "Grok 4.7", provider: "Grok", costInfo: "900 credit / 1M token" },
    ],
  },
];

export class AIClient {
  /**
   * Retrieves the current active LLM configuration from the database or environment variables.
   */
  static async getActiveConfig(): Promise<LLMConfig> {
    try {
      if (await isPrismaAvailable()) {
        const dbConfig = await prisma.aIProviderConfiguration.findFirst({
          where: {
            providerType: "LLM",
            isEnabled: true,
            isDefault: true,
          },
        });

        if (dbConfig) {
          const json = (dbConfig.configJson as Record<string, any>) || {};
          return {
            providerName: dbConfig.providerName || "hhtech",
            baseUrl: json.baseUrl || "https://hhtechapi.net/v1",
            apiKey: json.apiKey || process.env.HHTECH_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
            modelId: dbConfig.modelId || "claude-sonnet-4.6",
            temperature: typeof json.temperature === "number" ? json.temperature : 0.7,
            isEnabled: dbConfig.isEnabled,
            isDefault: dbConfig.isDefault,
            notes: json.notes || "Configured via Classnia Admin Panel",
          };
        }
      }
    } catch {
      // Could not query AIProviderConfiguration from DB, falling back to ENV variables
    }

    // Default fallback from environment variables
    const apiKey =
      process.env.HHTECH_API_KEY ||
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      "";

    const baseUrl =
      process.env.AI_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      "https://hhtechapi.net/v1";

    const modelId =
      process.env.AI_DEFAULT_MODEL ||
      "claude-sonnet-4.6";

    return {
      providerName: process.env.AI_PROVIDER || (apiKey.startsWith("ark-") ? "hhtech" : "openai"),
      baseUrl,
      apiKey,
      modelId,
      temperature: 0.7,
      isEnabled: Boolean(apiKey),
      isDefault: true,
      notes: "Default environment variable configuration",
    };
  }

  /**
   * Saves or updates the primary LLM configuration in the database.
   */
  static async saveConfig(config: {
    providerName: string;
    baseUrl: string;
    apiKey?: string;
    modelId: string;
    temperature?: number;
    isEnabled?: boolean;
    notes?: string;
    updatedById?: string;
  }) {
    // Check existing
    const existing = await prisma.aIProviderConfiguration.findFirst({
      where: {
        providerType: "LLM",
        isDefault: true,
      },
    });

    const oldJson = (existing?.configJson as Record<string, any>) || {};
    // If no new apiKey provided, keep existing
    const finalApiKey = config.apiKey ? config.apiKey.trim() : oldJson.apiKey || "";

    const cleanBaseUrl = (config.baseUrl || "https://hhtechapi.net/v1")
      .trim()
      .replace(/\/+$/, "");

    const newConfigJson = {
      ...oldJson,
      baseUrl: cleanBaseUrl,
      apiKey: finalApiKey,
      temperature: config.temperature ?? 0.7,
      notes: config.notes ?? "Updated via Admin AI Hub",
    };

    if (existing) {
      return await prisma.aIProviderConfiguration.update({
        where: { id: existing.id },
        data: {
          providerName: config.providerName || "hhtech",
          modelId: config.modelId || "claude-sonnet-4.6",
          configJson: newConfigJson,
          isEnabled: config.isEnabled ?? true,
          updatedById: config.updatedById,
        },
      });
    }

    return await prisma.aIProviderConfiguration.create({
      data: {
        providerType: "LLM",
        providerName: config.providerName || "hhtech",
        modelId: config.modelId || "claude-sonnet-4.6",
        configJson: newConfigJson,
        isEnabled: config.isEnabled ?? true,
        isDefault: true,
        updatedById: config.updatedById,
      },
    });
  }

  /**
   * Executes a Chat Completion request using standard OpenAI-compatible API format (supported by HHTECH.API).
   */
  static async chatCompletion({
    messages,
    model,
    temperature,
    requireJson = false,
  }: {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    requireJson?: boolean;
  }): Promise<string> {
    const config = await this.getActiveConfig();

    if (!config.apiKey) {
      throw new Error("No API key configured for LLM. Please configure HHTECH_API_KEY in Admin.");
    }

    const targetModel = model || config.modelId || "claude-sonnet-4.6";
    const targetTemp = temperature ?? config.temperature ?? 0.7;

    let endpoint = config.baseUrl.trim().replace(/\/+$/, "");
    if (!endpoint.endsWith("/chat/completions")) {
      endpoint = `${endpoint}/chat/completions`;
    }

    // Attempt with response_format first if requested
    const requestBody: Record<string, any> = {
      model: targetModel,
      messages,
      temperature: targetTemp,
    };

    if (requireJson) {
      requestBody.response_format = { type: "json_object" };
    }

    const timeoutMs = requireJson ? 60000 : 25000;
    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(timeoutMs),
    });

    // If 400 bad request due to response_format not supported by proxy model, retry without response_format
    if (!response.ok && requireJson && response.status === 400) {
      const errText = await response.text();
      console.warn("Retrying chat completion without response_format flag due to:", errText);
      delete requestBody.response_format;

      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(timeoutMs),
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`LLM API error (${response.status}): ${errBody || response.statusText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("LLM returned empty completion message.");
    }

    return content;
  }

  /**
   * Safe JSON extraction helper that handles raw JSON, markdown ```json code blocks,
   * and trailing comments from diverse LLM proxy responses.
   */
  static extractJson<T = any>(rawText: string): T {
    const trimmed = rawText.trim();

    // 1. Direct parse attempt
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // Continue to regex extraction
    }

    // 2. Extract from ```json ... ``` or ``` ... ```
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch {
        // Continue
      }
    }

    // 3. Find first { and last }
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = trimmed.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate) as T;
    }

    throw new Error(`Failed to extract valid JSON from LLM response: ${trimmed.slice(0, 150)}...`);
  }

  /**
   * Tests connection to the specified LLM endpoint with given credentials.
   */
  static async testConnection({
    baseUrl,
    apiKey,
    modelId,
  }: {
    baseUrl: string;
    apiKey: string;
    modelId: string;
  }): Promise<{
    success: boolean;
    latencyMs: number;
    reply?: string;
    error?: string;
    modelUsed: string;
  }> {
    const startTime = Date.now();
    let endpoint = (baseUrl || "https://hhtechapi.net/v1").trim().replace(/\/+$/, "");
    if (!endpoint.endsWith("/chat/completions")) {
      endpoint = `${endpoint}/chat/completions`;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: modelId || "claude-sonnet-4.6",
          messages: [
            {
              role: "system",
              content: "You are the Chinese Examiner AI for Classnia. Answer briefly in Mandarin.",
            },
            {
              role: "user",
              content: "你好！请确认系统连接状态。",
            },
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          latencyMs,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`,
          modelUsed: modelId,
        };
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "(Không có nội dung phản hồi)";

      return {
        success: true,
        latencyMs,
        reply,
        modelUsed: modelId,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: err?.message || String(err),
        modelUsed: modelId,
      };
    }
  }
}
