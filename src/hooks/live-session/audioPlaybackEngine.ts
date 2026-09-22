import type { MutableRefObject } from "react";

/**
 * audioPlaybackEngine.ts
 * Audio conversion, gapless PCM audio buffer scheduling, and RMS volume analysis for live assistant.
 */

// Converts signed 16-bit PCM buffer to standard Float32Array
export function pcm16ToFloat32(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const length = buffer.byteLength / 2;
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const val = view.getInt16(i * 2, true);
    result[i] = val / 32768.0;
  }
  return result;
}

// Converts binary ArrayBuffer to Base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface PlaybackEngineRefs {
  playbackCtxRef: MutableRefObject<AudioContext | null>;
  playbackAnalyserRef: MutableRefObject<AnalyserNode | null>;
  activeSources: MutableRefObject<AudioBufferSourceNode[]>;
  nextStartTimeRef: MutableRefObject<number>;
  cherryVolSmoothed: MutableRefObject<number>;
}

export async function queueAudioPlayback(
  base64AudioData: string,
  refs: PlaybackEngineRefs,
  onQueueEmpty: () => void
): Promise<void> {
  const ctx = refs.playbackCtxRef.current;
  if (!ctx) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  // Convert PCM byte array data to playable Float32Array
  const binary = atob(base64AudioData);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const float32Data = pcm16ToFloat32(bytes.buffer);

  // Build audio buffer
  const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
  audioBuffer.getChannelData(0).set(float32Data);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  if (refs.playbackAnalyserRef.current) {
    source.connect(refs.playbackAnalyserRef.current);
  } else {
    source.connect(ctx.destination);
  }

  // Schedule gapless playback
  const currentTime = ctx.currentTime;
  if (refs.nextStartTimeRef.current < currentTime) {
    refs.nextStartTimeRef.current = currentTime + 0.05; // 50ms startup smoothing pad
  }

  source.start(refs.nextStartTimeRef.current);

  refs.activeSources.current.push(source);
  source.onended = () => {
    refs.activeSources.current = refs.activeSources.current.filter((s) => s !== source);
    if (refs.activeSources.current.length === 0) {
      onQueueEmpty();
    }
  };

  refs.nextStartTimeRef.current += audioBuffer.duration;
}

export function stopAllPlayback(
  refs: PlaybackEngineRefs,
  setCherryVolume: (vol: number) => void
): void {
  refs.activeSources.current.forEach((src) => {
    try {
      src.stop();
    } catch (_) {}
  });
  refs.activeSources.current = [];
  refs.nextStartTimeRef.current = 0;
  setCherryVolume(0);
  refs.cherryVolSmoothed.current = 0;
}
