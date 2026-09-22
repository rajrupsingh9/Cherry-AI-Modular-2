/**
 * audioCaptureManager.ts
 * Manages user microphone capture, 16kHz PCM encoding, and WebSocket audio streaming.
 */

import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import { arrayBufferToBase64 } from "./audioPlaybackEngine";
import { SessionState } from "../../types";

export interface AudioCaptureRefs {
  micStreamRef: MutableRefObject<MediaStream | null>;
  micCtxRef: MutableRefObject<AudioContext | null>;
  processorRef: MutableRefObject<ScriptProcessorNode | null>;
  userVolSmoothed: MutableRefObject<number>;
  sessionStateRef: MutableRefObject<SessionState>;
  teachingPhaseRef: MutableRefObject<string>;
}

export interface AudioCaptureCallbacks {
  setIsMicActive: (active: boolean) => void;
  setUserVolume: (vol: number) => void;
  setSessionState: Dispatch<SetStateAction<SessionState>>;
  onToast: (message: string, type: "info" | "success" | "error") => void;
}

export async function setupMicrophoneStream(
  refs: AudioCaptureRefs,
  callbacks: AudioCaptureCallbacks,
  ws: WebSocket
): Promise<void> {
  let stream: MediaStream | null = null;
  let fallbackMic = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    refs.micStreamRef.current = stream;
    callbacks.setIsMicActive(true);
  } catch (micErr) {
    fallbackMic = true;
    callbacks.setIsMicActive(false);
    callbacks.onToast("Speaker-Only Mode active! (Mic access blocked). You can still listen and type questions! 🔊💬", "info");
  }

  if (!fallbackMic && stream) {
    const micCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    refs.micCtxRef.current = micCtx;
    if (micCtx.state === "suspended") await micCtx.resume();

    const sourceNode = micCtx.createMediaStreamSource(stream);
    const scriptProcessor = micCtx.createScriptProcessor(2048, 1, 1);
    refs.processorRef.current = scriptProcessor;
    sourceNode.connect(scriptProcessor);
    scriptProcessor.connect(micCtx.destination);

    scriptProcessor.onaudioprocess = (e) => {
      const floatData = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < floatData.length; i++) sum += floatData[i] * floatData[i];
      const rms = Math.sqrt(sum / floatData.length);
      refs.userVolSmoothed.current = refs.userVolSmoothed.current * 0.75 + rms * 0.25;
      callbacks.setUserVolume(refs.userVolSmoothed.current);

      if (rms > 0.02) {
        callbacks.setSessionState((prev) => (prev === "idle" ? "listening" : prev));
      }

      const pcm16Buffer = new Int16Array(floatData.length);
      for (let i = 0; i < floatData.length; i++) {
        const sample = Math.max(-1, Math.min(1, floatData[i]));
        pcm16Buffer[i] = sample < 0 ? sample * 32768 : sample * 32767;
      }

      if (ws.readyState === WebSocket.OPEN) {
        if ((refs.teachingPhaseRef.current || "intro").toLowerCase() === "concept" && refs.sessionStateRef.current === "speaking") {
          return;
        }
        ws.send(JSON.stringify({ type: "audio", data: arrayBufferToBase64(pcm16Buffer.buffer) }));
      }
    };
  }
}
