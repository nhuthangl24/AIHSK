/**
 * Battle-tested in-browser WAV Audio Recorder (16kHz Mono 16-bit PCM).
 * Uses native MediaRecorder + decodeAudioData for maximum stability and audio clarity,
 * with ScriptProcessorNode fallback for legacy environments.
 * Optimized for Gemini 3.6 Flash / OpenAI Multimodal Audio APIs.
 */

export interface RecordedAudioResult {
  blob: Blob;
  base64: string;
  durationSeconds: number;
  sampleRate: number;
}

export class WavRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private startTime = 0;
  private isRecording = false;
  private targetSampleRate = 16000;

  // Fallback Web Audio fields
  private audioCtx: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private totalSamples = 0;

  /**
   * Start recording from a MediaStream.
   */
  start(stream: MediaStream, targetSampleRate = 16000): void {
    if (this.isRecording) {
      this.stop();
    }

    this.targetSampleRate = targetSampleRate;
    this.recordedChunks = [];
    this.pcmChunks = [];
    this.totalSamples = 0;
    this.startTime = Date.now();
    this.isRecording = true;

    // 1. Primary: Try native MediaRecorder
    if (typeof window !== "undefined" && typeof MediaRecorder !== "undefined") {
      try {
        let mimeType = "";
        const candidates = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
          "",
        ];
        for (const c of candidates) {
          if (!c || MediaRecorder.isTypeSupported(c)) {
            mimeType = c;
            break;
          }
        }

        const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
        const mr = new MediaRecorder(stream, options);
        this.mediaRecorder = mr;

        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };

        mr.start(100); // 100ms slice
        return;
      } catch (mrErr) {
        console.warn("MediaRecorder failed, falling back to Web Audio API:", mrErr);
        this.mediaRecorder = null;
      }
    }

    // 2. Fallback: Web Audio API ScriptProcessorNode
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => null);
      }

      this.mediaStreamSource = this.audioCtx.createMediaStreamSource(stream);
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const chunk = new Float32Array(inputData.length);
        chunk.set(inputData);
        this.pcmChunks.push(chunk);
        this.totalSamples += chunk.length;
      };

      // Mute gain to prevent microphone audio loopback echo
      const muteGain = this.audioCtx.createGain();
      muteGain.gain.value = 0;

      this.mediaStreamSource.connect(this.processorNode);
      this.processorNode.connect(muteGain);
      muteGain.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn("WavRecorder fallback initialization error:", e);
    }
  }

  /**
   * Stop recording and return WAV blob and base64 string.
   */
  async stop(): Promise<RecordedAudioResult | null> {
    if (!this.isRecording && this.recordedChunks.length === 0 && this.pcmChunks.length === 0) {
      return null;
    }

    this.isRecording = false;
    const elapsedSeconds = Math.max(0.5, (Date.now() - this.startTime) / 1000);

    // 1. Process MediaRecorder if used
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        await new Promise<void>((resolve) => {
          if (!this.mediaRecorder) return resolve();
          this.mediaRecorder.onstop = () => resolve();
          this.mediaRecorder.stop();
        });
      } catch (e) {
        console.warn("Error stopping MediaRecorder:", e);
      }
    }

    if (this.recordedChunks.length > 0) {
      try {
        const rawBlob = new Blob(this.recordedChunks, {
          type: this.recordedChunks[0]?.type || "audio/webm",
        });
        this.recordedChunks = [];

        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const decodeCtx = new AudioContextClass();
          const arrayBuf = await rawBlob.arrayBuffer();
          const audioBuffer = await decodeCtx.decodeAudioData(arrayBuf);
          const channelData = audioBuffer.getChannelData(0);
          const srcRate = audioBuffer.sampleRate;

          await decodeCtx.close().catch(() => null);

          const resampled = this.resamplePcm(channelData, srcRate, this.targetSampleRate);
          const wavBuffer = this.encodeWavMono16Bit(resampled, this.targetSampleRate);
          const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
          const base64 = await this.blobToBase64(wavBlob);

          return {
            blob: wavBlob,
            base64,
            durationSeconds: Math.round(elapsedSeconds * 10) / 10,
            sampleRate: this.targetSampleRate,
          };
        }
      } catch (decodeErr) {
        console.warn("decodeAudioData failed, checking PCM fallback:", decodeErr);
      }
    }

    // 2. Process ScriptProcessorNode fallback
    const nativeSampleRate = this.audioCtx?.sampleRate || 48000;

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
    } catch {}

    if (this.pcmChunks.length === 0 || this.totalSamples === 0) {
      return null;
    }

    const fullPcm = new Float32Array(this.totalSamples);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      fullPcm.set(chunk, offset);
      offset += chunk.length;
    }
    this.pcmChunks = [];

    const resampled = this.resamplePcm(fullPcm, nativeSampleRate, this.targetSampleRate);
    const wavBuffer = this.encodeWavMono16Bit(resampled, this.targetSampleRate);
    const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
    const base64 = await this.blobToBase64(wavBlob);

    return {
      blob: wavBlob,
      base64,
      durationSeconds: Math.round(elapsedSeconds * 10) / 10,
      sampleRate: this.targetSampleRate,
    };
  }

  get recording(): boolean {
    return this.isRecording;
  }

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

    // RIFF identifier
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, "WAVE");

    // fmt chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Write samples
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
        const base64 = dataUrl.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
