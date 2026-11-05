"use client";

export interface SystemAudioSettings {
  voiceName: string;
  playbackSpeed: number; // 0.85, 0.95, 1.05
  recognitionLang: string; // "zh-TW" | "zh-CN"
  showPinyin: boolean;
}

const STORAGE_KEY = "aihsk_system_audio_settings";
const SETTINGS_EVENT = "aihsk_audio_settings_changed";

export const FIXED_VOICE_NAME = "Google 國語（臺灣）";
export const FIXED_VOICE_LABEL = "✓ Google 國語（臺灣） (zh-TW) ⭐ [Khuyên dùng]";

const DEFAULT_SETTINGS: SystemAudioSettings = {
  voiceName: FIXED_VOICE_NAME,
  playbackSpeed: 0.95,
  recognitionLang: "zh-TW",
  showPinyin: true,
};

export function getSystemAudioSettings(): SystemAudioSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        // Strictly lock to FIXED_VOICE_NAME across the entire system.
        // Overrides any legacy or third-party voice names saved in client localStorage.
        voiceName: FIXED_VOICE_NAME,
        playbackSpeed: typeof parsed.playbackSpeed === "number" ? parsed.playbackSpeed : DEFAULT_SETTINGS.playbackSpeed,
        recognitionLang: parsed.recognitionLang || DEFAULT_SETTINGS.recognitionLang,
        showPinyin: typeof parsed.showPinyin === "boolean" ? parsed.showPinyin : DEFAULT_SETTINGS.showPinyin,
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSystemAudioSettings(updates: Partial<SystemAudioSettings>): SystemAudioSettings {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS, ...updates, voiceName: FIXED_VOICE_NAME };
  }
  try {
    const current = getSystemAudioSettings();
    const updated: SystemAudioSettings = {
      ...current,
      ...updates,
      // Always enforce FIXED_VOICE_NAME
      voiceName: FIXED_VOICE_NAME,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for cross-component reactive sync
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Normalizes voice identifiers for robust fuzzy matching across OS platforms and Chromium builds
 */
function normalizeVoiceString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[\s\-_()（）[\]【】·,.:;]/g, "");
}

/**
 * Checks whether a voice is specifically Google's Taiwan Mandarin voice
 */
export function isGoogleTaiwanVoice(v: SpeechSynthesisVoice): boolean {
  if (!v) return false;
  if (v.name === FIXED_VOICE_NAME) return true;

  const n = normalizeVoiceString(v.name);
  const l = normalizeVoiceString(v.lang);

  if (n === normalizeVoiceString(FIXED_VOICE_NAME)) return true;

  const isGoogle = n.includes("google") || n.includes("chrome");
  const isTaiwan =
    l === "zhtw" ||
    n.includes("taiwan") ||
    n.includes("台湾") ||
    n.includes("臺灣");

  if (isGoogle && isTaiwan) return true;

  // In Chromium, "Google 國語" without Mainland identifiers is exclusively the Taiwan model
  if (isGoogle && n.includes("國語") && !n.includes("mainland") && !n.includes("大陆") && !n.includes("大陸")) {
    return true;
  }

  return false;
}

/**
 * Fallback detector for non-Chromium browsers (Safari iOS/macOS, Windows Edge)
 */
export function isTaiwanVoice(v: SpeechSynthesisVoice): boolean {
  if (!v) return false;
  if (isGoogleTaiwanVoice(v)) return true;

  const n = normalizeVoiceString(v.name);
  const l = normalizeVoiceString(v.lang);

  return (
    l === "zhtw" ||
    n.includes("taiwan") ||
    n.includes("台湾") ||
    n.includes("臺灣") ||
    n.includes("meijia") || // Apple macOS / iOS Taiwan Siri
    n.includes("hsiaochen") || // Edge Taiwan Natural
    n.includes("hanhan") ||
    n.includes("yating")
  );
}

/**
 * General Chinese voice matcher fallback if no Taiwan-specific voice is installed
 */
export function isChineseVoice(v: SpeechSynthesisVoice): boolean {
  if (!v) return false;
  if (isTaiwanVoice(v)) return true;

  const l = normalizeVoiceString(v.lang);
  const n = normalizeVoiceString(v.name);

  return (
    l.startsWith("zh") ||
    l.includes("cmn") ||
    n.includes("chinese") ||
    n.includes("mandarin") ||
    n.includes("普通话") ||
    n.includes("國語")
  );
}

/**
 * Strictly selects the best Chinese voice with highest priority to Google 國語（臺灣）
 */
export function getBestChineseVoice(
  voices: SpeechSynthesisVoice[],
  _preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Priority 1: Google 國語（臺灣）
  const googleTw = voices.find(isGoogleTaiwanVoice);
  if (googleTw) return googleTw;

  // Priority 2: Native Taiwan Voice (Safari Meijia, Edge HsiaoChen)
  const nativeTw = voices.find(isTaiwanVoice);
  if (nativeTw) return nativeTw;

  // Priority 3: Any general Chinese voice (fallback)
  const anyZh = voices.find(isChineseVoice);
  if (anyZh) return anyZh;

  return voices[0] || null;
}

export function getAvailableChineseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  const match = getBestChineseVoice(voices);
  return match ? [match] : [];
}

export function cleanSpeechText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\(\[（【].*?[\)\]）】]/g, "")
    .replace(/💡|•|&bull;|&quot;|“|”/g, "")
    .trim();
}

// Global cached voice and async resolution state for cold page mounts
let cachedTargetVoice: SpeechSynthesisVoice | null = null;
let voiceInitPromise: Promise<SpeechSynthesisVoice | null> | null = null;
let globalSpeechId = 0;

/**
 * Resolves the target Chinese voice, awaiting voiceschanged if voices are not yet loaded
 */
export function resolveChineseVoice(): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve(null);
  }

  if (cachedTargetVoice) {
    return Promise.resolve(cachedTargetVoice);
  }

  const current = window.speechSynthesis.getVoices();
  if (current && current.length > 0) {
    const best = getBestChineseVoice(current);
    if (best) {
      cachedTargetVoice = best;
      return Promise.resolve(best);
    }
  }

  if (voiceInitPromise) {
    return voiceInitPromise;
  }

  voiceInitPromise = new Promise((resolve) => {
    let resolved = false;

    const onVoicesChanged = () => {
      if (resolved) return;
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        const best = getBestChineseVoice(v);
        if (best) {
          resolved = true;
          cachedTargetVoice = best;
          window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
          resolve(best);
        }
      }
    };

    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

    // Timeout safety fallback (max 350ms)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
        const finalVoices = window.speechSynthesis.getVoices();
        const best = getBestChineseVoice(finalVoices);
        cachedTargetVoice = best;
        resolve(best);
      }
    }, 350);
  });

  return voiceInitPromise;
}

// Auto-initialize on browser load
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  resolveChineseVoice();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    const v = window.speechSynthesis.getVoices();
    if (v && v.length > 0) {
      cachedTargetVoice = getBestChineseVoice(v);
    }
  });
}

interface SpeakOptions {
  speedOverride?: number;
  voiceNameOverride?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export function speakWithSystemSettings(
  text: string,
  options?: SpeakOptions
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  window.speechSynthesis.cancel();
  const thisCallId = ++globalSpeechId;

  const clean = cleanSpeechText(text);
  if (!clean) return null;

  const settings = getSystemAudioSettings();
  const utterance = new SpeechSynthesisUtterance(clean);

  // ALWAYS strictly zh-TW for speech output across the entire application
  utterance.lang = "zh-TW";
  utterance.rate = options?.speedOverride || settings.playbackSpeed || 0.95;
  utterance.pitch = 1.0;

  const applyVoiceAndSpeak = (voice: SpeechSynthesisVoice | null) => {
    // If a newer speech request or stop was called, abort
    if (globalSpeechId !== thisCallId) return;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "zh-TW";
    }

    utterance.onstart = () => {
      if (globalSpeechId === thisCallId) {
        options?.onStart?.();
      }
    };

    utterance.onend = () => {
      if (globalSpeechId === thisCallId) {
        options?.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      if (globalSpeechId === thisCallId) {
        options?.onError?.(e);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis speak exception:", e);
      options?.onError?.(e);
    }
  };

  // Check if voice is already loaded synchronously
  const syncVoices = window.speechSynthesis.getVoices();
  const currentBest =
    cachedTargetVoice ||
    (syncVoices && syncVoices.length > 0 ? getBestChineseVoice(syncVoices) : null);

  if (currentBest) {
    cachedTargetVoice = currentBest;
    applyVoiceAndSpeak(currentBest);
  } else {
    // Cold mount: Wait for voices to load before speaking so we NEVER play with an arbitrary system voice
    resolveChineseVoice().then((v) => {
      applyVoiceAndSpeak(v);
    });
  }

  return utterance;
}

export function stopSystemSpeech(): void {
  globalSpeechId++;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
