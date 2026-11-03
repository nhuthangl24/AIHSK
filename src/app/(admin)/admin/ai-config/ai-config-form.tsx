"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Cpu,
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Sliders,
  Sparkles,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  Zap,
  Terminal,
  Database,
  Coins,
  Bot,
} from "lucide-react";

interface AIConfigData {
  providerName: string;
  baseUrl: string;
  modelId: string;
  temperature: number;
  isEnabled: boolean;
  hasKey: boolean;
  maskedKey: string;
}

interface CatalogGroup {
  group: string;
  models: {
    id: string;
    name: string;
    provider: string;
    costInfo?: string;
    recommended?: boolean;
  }[];
}

interface Preset {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  defaultModel: string;
  keyPrefix: string;
}

export function AIConfigForm({
  initialConfig,
  catalog,
  presets,
}: {
  initialConfig: AIConfigData;
  catalog: CatalogGroup[];
  presets: Preset[];
}) {
  const [providerName, setProviderName] = useState(initialConfig.providerName || "hhtech");
  const [baseUrl, setBaseUrl] = useState(initialConfig.baseUrl || "https://hhtechapi.net/v1");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelId, setModelId] = useState(initialConfig.modelId || "claude-sonnet-4.6");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [temperature, setTemperature] = useState(initialConfig.temperature ?? 0.7);
  const [isEnabled, setIsEnabled] = useState(initialConfig.isEnabled ?? true);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Test Connection Results
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    reply?: string;
    error?: string;
    modelUsed?: string;
  } | null>(null);

  // Simulation Sandbox
  const [simText, setSimText] = useState("你好老师！我叫阮文安，今年二十岁，学习中文已经两年了。");
  const [simLevel, setSimLevel] = useState("HSK 3");
  const [simResult, setSimResult] = useState<{
    stage: number;
    examinerResponse: string;
    pinyin: string;
    pedagogicalObservation?: string;
  } | null>(null);

  const applyPreset = (preset: Preset) => {
    setProviderName(preset.id);
    setBaseUrl(preset.baseUrl);
    setModelId(preset.defaultModel);
    setIsCustomModel(false);
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName,
          baseUrl,
          apiKey: apiKey.trim() || undefined,
          modelId,
          temperature: Number(temperature),
          isEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu cấu hình");
      }

      setSaveSuccess(data.message || "Cấu hình AI đã lưu thành công!");
      if (apiKey) {
        setApiKey(""); // clear plain input after saving
      }
    } catch (err: any) {
      setSaveError(err.message || "Lỗi khi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl,
          apiKey: apiKey.trim() || undefined,
          modelId,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        error: err.message || "Không thể kết nối đến máy chủ",
        modelUsed: modelId,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateTurn = async () => {
    setIsSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch("/api/admin/ai-config/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: simText,
          targetLevel: simLevel,
          topic: "Giới thiệu bản thân và thói quen sinh hoạt",
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setSimResult(data.result);
      } else {
        alert(data.error || "Mô phỏng thất bại");
      }
    } catch (err: any) {
      alert("Lỗi kiểm thử: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="cinnabar" className="text-xs">
            Admin AI Control
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cấu Hình Mô Hình AI & Khảo Thí (HHTECH.API)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập cổng kết nối LLM (Claude, GPT, Gemini, DeepSeek), kiểm tra độ trễ và quản trị quy trình chấm thi tự động.
        </p>
      </div>

      {/* Realtime Status Overview Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-transparent">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {providerName === "hhtech" ? "HHTECH.API Gateway" : providerName.toUpperCase()}
                </span>
                <Badge variant={initialConfig.hasKey ? "success" : "warning"}>
                  {initialConfig.hasKey ? "Key Đã Cài Đặt" : "Chưa Lưu Key"}
                </Badge>
                <Badge variant="info">
                  Model: {modelId}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Endpoint: <code className="font-mono text-purple-600 dark:text-purple-400">{baseUrl}</code>
                {initialConfig.maskedKey && (
                  <span className="ml-2 font-mono text-slate-400">({initialConfig.maskedKey})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="gap-1.5"
            >
              <Zap className={`h-4 w-4 text-amber-500 ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Đang Kiểm Tra..." : "Ping Test Endpoint"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preset Quick Select */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Chọn Nhanh Cổng Cung Cấp (Presets)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Bấm chọn để tự động điền Base URL và mô hình tiêu chuẩn phù hợp nhất với khảo thí HSK.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((p) => {
              const isSelected = providerName === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-400">
                    Mặc định: {p.defaultModel}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-600" />
              <span>Tham Số Kết Nối & Xác Thực API</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Các thiết lập này áp dụng tức thời cho Giám khảo AI (Examiner) và Động cơ Chấm điểm (Scoring Pipeline).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Feedback Banners */}
            {saveSuccess && (
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Provider and Base URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="providerName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tên Đơn Vị Cung Cấp
                </Label>
                <Input
                  id="providerName"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="hhtech"
                  className="font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Ví dụ: <code className="text-purple-600">hhtech</code>, <code className="text-purple-600">openai</code>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="baseUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Base URL (OpenAI-Compatible Endpoint)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://hhtechapi.net/v1"
                    className="font-mono text-xs"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBaseUrl("https://hhtechapi.net/v1")}
                    title="Đặt lại về HHTECH URL"
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Chuẩn OpenAI của HHTECH là <code className="text-purple-600">https://hhtechapi.net/v1</code>
                </p>
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="apiKey" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-purple-600" />
                  <span>API Key / Bearer Auth Token</span>
                </Label>
                {initialConfig.hasKey && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Hệ thống đang lưu: {initialConfig.maskedKey}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    initialConfig.hasKey
                      ? "Nhập API key mới để ghi đè (ví dụ: ark-xxxxxxxxxx)..."
                      : "Dán key HHTECH.API (ví dụ: ark-xxxxxxxxxx) tại đây..."
                  }
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Key HHTECH có định dạng bắt đầu bằng <code className="text-purple-600">ark-</code>. Khóa được mã hóa an toàn trên máy chủ.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="modelSelect" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mô Hình Ngôn Ngữ Khảo Thí (Model ID)
                </Label>
                <button
                  type="button"
                  onClick={() => setIsCustomModel(!isCustomModel)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {isCustomModel ? "← Chọn từ danh mục HHTECH" : "Tự gõ model tùy biến..."}
                </button>
              </div>

              {isCustomModel ? (
                <Input
                  id="customModel"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  placeholder="claude-sonnet-4.6"
                  className="font-mono text-xs"
                />
              ) : (
                <select
                  id="modelSelect"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {catalog.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id}) {m.costInfo ? `— [${m.costInfo}]` : ""} {m.recommended ? "★ ĐỀ XUẤT" : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-slate-500">
                Khuyên dùng: <strong className="text-purple-600">claude-sonnet-4.6</strong> hoặc <strong className="text-purple-600">gpt-5.6-sol</strong> để đạt độ nhạy ngôn ngữ tiếng Trung và khả năng sửa lỗi ngữ pháp tốt nhất.
              </p>
            </div>

            {/* Temperature & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Temperature (Độ linh hoạt hội thoại): {temperature}
                  </Label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.0 (Chính xác, kỷ luật)</span>
                  <span>0.7 (Tự nhiên, phản xạ)</span>
                  <span>1.0 (Sáng tạo cao)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    Kích Hoạt Cloud LLM
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Tắt để chỉ dùng Engine Adaptive tích hợp cục bộ.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="gap-2 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
                <span>Kiểm Tra Kết Nối (Ping Endpoint)</span>
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Đang Lưu Cấu Hình..." : "Lưu & Kích Hoạt Cấu Hình"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Test Connection Result Box */}
      {testResult && (
        <Card className={`border ${testResult.success ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20" : "border-rose-300 dark:border-rose-800 bg-rose-50/20"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                )}
                <span>
                  {testResult.success
                    ? "Kết Nối Thành Công Tới HHTECH.API!"
                    : "Kết Nối Không Thành Công"}
                </span>
              </div>
              <Badge variant={testResult.success ? "success" : "destructive"}>
                Độ trễ: {testResult.latencyMs} ms
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            {testResult.success ? (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-950">
                <span className="text-[10px] text-slate-400 block mb-1">
                  Mô hình <strong className="text-purple-600">{testResult.modelUsed}</strong> phản hồi:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-sans font-medium">
                  {testResult.reply}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-950 text-rose-600 dark:text-rose-400">
                {testResult.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interactive Sandbox Test */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Play className="h-4 w-4 text-emerald-600" />
            <span>Phòng Thí Nghiệm Hội Thoại Khảo Thí (Sandbox Simulation)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Kiểm tra phản hồi thực tế của Giám khảo AI đối với câu nói của thí sinh bằng tiếng Trung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <Label className="text-xs font-medium">Câu trả lời mẫu của thí sinh</Label>
              <Input
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="Nhập câu tiếng Trung của thí sinh..."
                className="text-xs font-sans"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Cấp độ mục tiêu</Label>
              <select
                value={simLevel}
                onChange={(e) => setSimLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
              >
                <option value="HSK 2">HSK 2 / A2</option>
                <option value="HSK 3">HSK 3 / B1 (Mặc định)</option>
                <option value="HSK 4">HSK 4 / B2</option>
                <option value="HSK 5">HSK 5 / C1</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSimulateTurn}
            disabled={isSimulating}
            className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{isSimulating ? "Giám Khảo Đang Suy Nghĩ..." : "Gửi Thử Nghiệm Tới Giám Khảo AI"}</span>
          </Button>

          {simResult && (
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300">
                <span>Phản Hồi Từ Giám Khảo (Stage {simResult.stage})</span>
                <Badge variant="outline">Giai đoạn: {simResult.stage} / 5</Badge>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-purple-100 dark:border-purple-950 space-y-1.5">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {simResult.examinerResponse}
                </p>
                {simResult.pinyin && (
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-mono">
                    {simResult.pinyin}
                  </p>
                )}
              </div>

              {simResult.pedagogicalObservation && (
                <p className="text-[11px] text-slate-500 italic">
                  <strong>Quan sát sư phạm:</strong> {simResult.pedagogicalObservation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* HHTECH Model Pricing & Reference */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>Bảng Giá Credit Tham Khảo HHTECH.API</span>
            </div>
            <span className="text-xs font-normal text-slate-500">
              Số dư tài khoản: <strong className="text-purple-600">51.374,31 cr</strong>
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Chi phí tính theo triệu token (1M token) theo bảng niêm yết chính thức từ HHTECH.API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2 px-3">Mô Hình</th>
                  <th className="py-2 px-3">Nhà Cung Cấp</th>
                  <th className="py-2 px-3">Đơn Giá Gộp (1M Token)</th>
                  <th className="py-2 px-3">Độ Phù Hợp Cho Khảo Thí HSK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-2 px-3 font-semibold text-purple-700 dark:text-purple-400">
                    claude-sonnet-4.6 ★
                  </td>
                  <td className="py-2 px-3">Claude</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">1.200 credit</td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    Rất cao — Khuyên dùng cho cả 5 vòng thi và báo cáo 7 chiều
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    gpt-5.6-sol
                  </td>
                  <td className="py-2 px-3">GPT</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">1.000 credit</td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    Rất cao — Khả năng lập luận logic và sửa lỗi ngữ pháp tuyệt vời
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    deepseek-v4.1-flash
                  </td>
                  <td className="py-2 px-3">DeepSeek</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">600 credit</td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    Tiết kiệm — Xử lý tiếng Trung bản địa cực tốt
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    gemini-3.7-flash
                  </td>
                  <td className="py-2 px-3">Gemini</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">650 credit</td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    Độ trễ thấp — Phù hợp cho phản hồi tức thì
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    claude-haiku-4.5
                  </td>
                  <td className="py-2 px-3">Claude</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">400 credit</td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    Siêu tiết kiệm — Phù hợp cho kiểm tra trình độ sơ cấp (HSK 1-2)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
