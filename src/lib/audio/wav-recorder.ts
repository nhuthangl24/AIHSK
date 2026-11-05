/**
 * Lightweight in-browser WAV Audio Recorder (16kHz Mono 16-bit PCM)
 * Optimized for LLM Multimodal Speech Analysis (Gemini 3.6 Flash / Whisper / CTI Exam).
 * Works across all modern browsers (Chrome, Firefox, Safari, Edge, Mobile Safari).
 */

export interface RecordedAudioResult {
  blob: Blob;
  base64: string;
  durationSeconds: number;
  sampleRate: number;
}

export class WavRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private totalSamples = 0;
  private startTime = 0;
  private isRecording = false;
  private targetSampleRate = 16000;

  /**
   * Start recording from a MediaStream.
   */
  start(stream: MediaStream, targetSampleRate = 16000): void {
    if (this.isRecording) {
      this.stop();
    }

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("AudioContext is not supported on this browser.");
        return;
      }

      this.targetSampleRate = targetSampleRate;
      this.audioCtx = new AudioContextClass();
      this.pcmChunks = [];
      this.totalSamples = 0;
      this.startTime = Date.now();
      this.isRecording = true;

      this.mediaStreamSource = this.audioCtx.createMediaStreamSource(stream);

      // ScriptProcessorNode with bufferSize 4096 (1 channel in, 1 channel out)
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Copy chunk
        const chunk = new Float32Array(inputData.length);
        chunk.set(inputData);
        this.pcmChunks.push(chunk);
        this.totalSamples += chunk.length;
      };

      this.mediaStreamSource.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);
    } catch (err) {
      console.warn("Failed to initialize WavRecorder:", err);
      this.isRecording = false;
    }
  }

  /**
   * Stop recording and return WAV blob and base64 string.
   */
  async stop(): Promise<RecordedAudioResult | null> {
    if (!this.isRecording && this.pcmChunks.length === 0) {
      return null;
    }

    this.isRecording = false;
    const elapsedSeconds = Math.max(0.5, (Date.now() - this.startTime) / 1000);

    // Disconnect audio nodes
    try {
      if (this.processorNode) {
        this.processorNode.disconnect();
        this.processorNode.onaudioprocess = null;
        this.processorNode = null;
      }
      if (this.mediaStreamSource) {
        this.mediaStreamSource.disconnect();
        this.mediaStreamSource = null;
      }
      if (this.audioCtx && this.audioCtx.state !== "closed") {
        await this.audioCtx.close().catch(() => null);
        this.audioCtx = null;
      }
    } catch (e) {
      console.warn("Error disconnecting audio recorder:", e);
    }

    if (this.pcmChunks.length === 0 || this.totalSamples === 0) {
      return null;
    }

    // Merge PCM chunks
    const fullPcm = new Float32Array(this.totalSamples);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      fullPcm.set(chunk, offset);
      offset += chunk.length;
    }
    this.pcmChunks = [];

    // Resample to targetSampleRate (typically 16000Hz for speech models)
    const nativeSampleRate = 44100; // default fallback if context is closed
    const currentSampleRate = this.audioCtx?.sampleRate || nativeSampleRate;
    const resampledPcm = this.resamplePcm(
      fullPcm,
      currentSampleRate,
      this.targetSampleRate
    );

    // Encode to WAV format
    const wavBuffer = this.encodeWavMono16Bit(resampledPcm, this.targetSampleRate);
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    const base64 = await this.blobToBase64(blob);

    return {
      blob,
      base64,
      durationSeconds: Math.round(elapsedSeconds * 10) / 10,
      sampleRate: this.targetSampleRate,
    };
  }

  get recording(): boolean {
    return this.isRecording;
  }

  /**
   * Resamples PCM float samples using linear interpolation.
   */
  private resamplePcm(
    source: Float32Array,
    fromRate: number,
    toRate: number
  ): Float32Array {
    if (fromRate === toRate || source.length === 0) {
      return source;
    }
    const ratio = fromRate / toRate;
    const newLength = Math.round(source.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const indexFloor = Math.floor(srcIndex);
      const indexCeil = Math.min(source.length - 1, indexFloor + 1);
      const weight = srcIndex - indexFloor;
      result[i] =
        source[indexFloor] * (1 - weight) + source[indexCeil] * weight;
    }
    return result;
  }

  /**
   * Encodes 32-bit Float PCM to 16-bit Mono RIFF/WAVE ArrayBuffer.
   */
  private encodeWavMono16Bit(
    samples: Float32Array,
    sampleRate: number
  ): ArrayBuffer {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = samples.length * (bitsPerSample / 8);
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, "WAVE");

    // "fmt " sub-chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Write 16-bit signed PCM samples with clipping protection
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      const val = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, Math.round(val), true);
      offset += 2;
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Strip data:audio/wav;base64,
        const base64 = dataUrl.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
