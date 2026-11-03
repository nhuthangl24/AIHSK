import { AIClient, HHTECH_MODEL_CATALOG } from "@/lib/ai/ai-client";
import { AIConfigForm } from "./ai-config-form";

export const dynamic = "force-dynamic";

function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export default async function AdminAIConfigPage() {
  const activeConfig = await AIClient.getActiveConfig();

  const presets = [
    {
      id: "hhtech",
      name: "HHTECH.API (Đề xuất)",
      description: "Cổng API đa nhà cung cấp (Claude, GPT, Gemini, DeepSeek, Grok) qua một Base URL duy nhất.",
      baseUrl: "https://hhtechapi.net/v1",
      defaultModel: "claude-sonnet-4.6",
      keyPrefix: "ark-",
    },
    {
      id: "openai",
      name: "OpenAI Direct",
      description: "Kết nối trực tiếp API của OpenAI (gpt-4o, gpt-4o-mini).",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o-mini",
      keyPrefix: "sk-",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      description: "Kết nối trực tiếp Anthropic Messages API.",
      baseUrl: "https://api.anthropic.com/v1",
      defaultModel: "claude-3-5-sonnet-20241022",
      keyPrefix: "sk-ant-",
    },
    {
      id: "deepseek",
      name: "DeepSeek Direct",
      description: "Kết nối chính thức nền tảng DeepSeek.",
      baseUrl: "https://api.deepseek.com/v1",
      defaultModel: "deepseek-chat",
      keyPrefix: "sk-",
    },
  ];

  const initialConfigData = {
    providerName: activeConfig.providerName || "hhtech",
    baseUrl: activeConfig.baseUrl || "https://hhtechapi.net/v1",
    modelId: activeConfig.modelId || "claude-sonnet-4.6",
    temperature: activeConfig.temperature ?? 0.7,
    isEnabled: activeConfig.isEnabled,
    hasKey: Boolean(activeConfig.apiKey),
    maskedKey: maskApiKey(activeConfig.apiKey),
  };

  return (
    <AIConfigForm
      initialConfig={initialConfigData}
      catalog={HHTECH_MODEL_CATALOG}
      presets={presets}
    />
  );
}
