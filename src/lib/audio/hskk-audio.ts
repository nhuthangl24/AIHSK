"use client";

import {
  speakWithSystemSettings,
  stopSystemSpeech,
  getSystemAudioSettings,
} from "@/lib/audio/system-audio-settings";

/**
 * Web Audio API Beep Synthesizer for Authentic HSKK Examinations.
 * Reproduces the official 1000Hz CTI examination tone.
 */
class HskkAudioEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => null);
    }
    return this.audioCtx;
  }

  /**
   * Play the legendary HSKK "嘀" (Beep) starting signal (1000Hz, 400ms)
   */
  public playPromptBeep(frequency = 1000, durationMs = 400): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return resolve();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Soft attack & decay to prevent clipping clicks
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
        gain.gain.setValueAtTime(0.35, now + durationMs / 1000 - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + durationMs / 1000);

        setTimeout(() => resolve(), durationMs);
      } catch (e) {
        console.warn("AudioContext beep failed:", e);
        resolve();
      }
    });
  }

  /**
   * Play a lower ending tone (600Hz, 300ms) when speaking time expires
   */
  public playEndingBeep(): Promise<void> {
    return this.playPromptBeep(600, 300);
  }

  /**
   * Play a section transition chime (Triad chord: 523Hz - 659Hz - 784Hz)
   */
  public playSectionChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return resolve();

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        const now = ctx.currentTime;

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.45);
        });

        setTimeout(() => resolve(), 700);
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * Text to Speech using unified System Audio Settings
   */
  public speakChinese(
    text: string,
    options?: {
      rate?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    const sysSettings = getSystemAudioSettings();
    speakWithSystemSettings(text, {
      speedOverride: options?.rate ?? sysSettings.playbackSpeed,
      voiceNameOverride: options?.voiceName ?? sysSettings.voiceName,
      onStart: options?.onStart,
      onEnd: options?.onEnd,
      onError: options?.onError,
    });
  }

  public stopSpeaking(): void {
    stopSystemSpeech();
  }
}

export const hskkAudio = new HskkAudioEngine();
