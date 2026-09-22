import { useState, useRef, useEffect, useCallback } from "react";
import { SessionState, LiveTranscription } from "../types";
import {
  queueAudioPlayback,
  stopAllPlayback,
} from "./live-session/audioPlaybackEngine";
import { dispatchToolCalls } from "./live-session/toolCallDispatcher";
import { setupMicrophoneStream } from "./live-session/audioCaptureManager";
import { useVolumeMonitor } from "./live-session/useVolumeMonitor";
import { UseLiveSessionProps } from "./live-session/types";

export function useLiveSession({
  onThemeChange,
  onToast,
  onNextTopic,
  onClassComplete,
  onTeachingPhaseChange,
  onUpdateWhiteboard,
  studentName,
  grade,
  board,
  mediumOfLearning,
  subject,
  activeTopicIndex,
}: UseLiveSessionProps) {
  const [sessionState, setSessionState] = useState<SessionState>("disconnected");
  const sessionStateRef = useRef<SessionState>("disconnected");
  useEffect(() => { sessionStateRef.current = sessionState; }, [sessionState]);

  const [teachingPhase, setTeachingPhase] = useState<string>("intro");
  const teachingPhaseRef = useRef<string>("intro");
  useEffect(() => { teachingPhaseRef.current = teachingPhase; }, [teachingPhase]);

  const nextTopicRef = useRef(onNextTopic);
  const classCompleteRef = useRef(onClassComplete);
  const updateWhiteboardRef = useRef(onUpdateWhiteboard);
  const lastActiveTopicIndexRef = useRef<number | undefined>(activeTopicIndex);

  useEffect(() => { nextTopicRef.current = onNextTopic; }, [onNextTopic]);
  useEffect(() => { classCompleteRef.current = onClassComplete; }, [onClassComplete]);
  useEffect(() => { updateWhiteboardRef.current = onUpdateWhiteboard; }, [onUpdateWhiteboard]);
  useEffect(() => { lastActiveTopicIndexRef.current = activeTopicIndex; }, [activeTopicIndex]);

  const [userVolume, setUserVolume] = useState<number>(0);
  const [cherryVolume, setCherryVolume] = useState<number>(0);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);

  const [userTranscript, setUserTranscript] = useState<LiveTranscription>({ text: "", finished: true });
  const [cherryTranscript, setCherryTranscript] = useState<LiveTranscription>({ text: "", finished: true });

  const wsRef = useRef<WebSocket | null>(null);
  const cherryTurnIdRef = useRef<string | null>(null);

  const micCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const activeSources = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const userVolSmoothed = useRef<number>(0);
  const cherryVolSmoothed = useRef<number>(0);

  const playbackRefs = {
    playbackCtxRef,
    playbackAnalyserRef,
    activeSources,
    nextStartTimeRef,
    cherryVolSmoothed,
  };

  const stopPlayback = useCallback(() => {
    stopAllPlayback(playbackRefs, setCherryVolume);
  }, []);

  const disconnectSession = useCallback(() => {
    setSessionState("disconnected");
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch (_) {}
      processorRef.current = null;
    }
    stopPlayback();
    if (micCtxRef.current) {
      try { micCtxRef.current.close(); } catch (_) {}
      micCtxRef.current = null;
    }
    if (playbackCtxRef.current) {
      try { playbackCtxRef.current.close(); } catch (_) {}
      playbackCtxRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
      wsRef.current = null;
    }
    setUserVolume(0);
    userVolSmoothed.current = 0;
    setUserTranscript({ text: "", finished: true });
    setCherryTranscript({ text: "", finished: true });
    cherryTurnIdRef.current = null;
  }, [stopPlayback]);

  const handleServerMessage = useCallback(
    async (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "audio" && msg.data) {
          setSessionState("speaking");
          await queueAudioPlayback(msg.data, playbackRefs, () => {
            setSessionState((prev) => (prev === "speaking" ? "idle" : prev));
            setCherryVolume(0);
            cherryVolSmoothed.current = 0;
          });
        } else if (msg.type === "interrupted") {
          stopPlayback();
          setSessionState("listening");
          setCherryTranscript((prev) => {
            if (prev.id && prev.id === cherryTurnIdRef.current) {
              return { ...prev, finished: true };
            }
            return prev;
          });
          cherryTurnIdRef.current = null;
        } else if (msg.type === "toolCall") {
          dispatchToolCalls(msg.toolCall, {
            onThemeChange,
            onToast,
            nextTopicRef,
            classCompleteRef,
            updateWhiteboardRef,
            onTeachingPhaseChange,
            setTeachingPhase,
            teachingPhaseRef,
            lastActiveTopicIndexRef,
            activeTopicIndex,
            wsRef,
          });
        } else if (msg.type === "inputTranscription") {
          setUserTranscript({ text: msg.text, finished: msg.finished });
        } else if (msg.type === "outputTranscription") {
          if (!cherryTurnIdRef.current) {
            cherryTurnIdRef.current = "cherry-" + Math.random().toString(36).substring(2, 11);
            setCherryTranscript({ text: msg.text, finished: msg.finished, id: cherryTurnIdRef.current });
          } else {
            setCherryTranscript((prev) => {
              const currentId = cherryTurnIdRef.current || prev.id;
              const originalText = prev.id === currentId ? prev.text : "";
              return { text: originalText + msg.text, finished: msg.finished, id: currentId! };
            });
          }
          if (msg.finished) cherryTurnIdRef.current = null;
          if (!msg.finished) setSessionState("speaking");
        } else if (msg.type === "ready") {
          setSessionState("idle");
          onToast("Cherry's online! Start talking whenever you're ready. 😘", "success");
        } else if (msg.type === "restoreState") {
          if (msg.teachingPhase) {
            setTeachingPhase(msg.teachingPhase);
            if (onTeachingPhaseChange) onTeachingPhaseChange(msg.teachingPhase);
          }
          if (msg.whiteboardNotes && updateWhiteboardRef.current) {
            updateWhiteboardRef.current(msg.whiteboardNotes, false);
          }
        } else if (msg.type === "error") {
          setSessionState("error");
          onToast(msg.error || "A connection fault occurred.", "error");
        }
      } catch (err) {
        console.error("[Client Hook] WS process message failed:", err);
      }
    },
    [onThemeChange, onToast, stopPlayback, onTeachingPhaseChange, activeTopicIndex]
  );

  const connectSession = async () => {
    if (sessionState !== "disconnected") return;
    setSessionState("connecting");
    onToast("Connecting to Cherry...", "info");

    try {
      const playbackCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      playbackCtxRef.current = playbackCtx;
      if (playbackCtx.state === "suspended") await playbackCtx.resume();

      const analyser = playbackCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(playbackCtx.destination);
      playbackAnalyserRef.current = analyser;

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const params = new URLSearchParams();
      if (grade) params.append("grade", grade);
      if (board) params.append("board", board);
      if (mediumOfLearning) params.append("mediumOfLearning", mediumOfLearning);
      if (studentName) params.append("studentName", studentName);
      if (subject) params.append("subject", subject);
      if (typeof activeTopicIndex === "number") params.append("activeTopicIndex", String(activeTopicIndex));

      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/live?${params.toString()}`);
      wsRef.current = ws;
      ws.onmessage = handleServerMessage;
      ws.onclose = () => disconnectSession();
      ws.onerror = () => {
        setSessionState("error");
        onToast("Mic socket disconnected. Is server running?", "error");
      };

      await setupMicrophoneStream(
        { micStreamRef, micCtxRef, processorRef, userVolSmoothed, sessionStateRef, teachingPhaseRef },
        { setIsMicActive, setUserVolume, setSessionState, onToast },
        ws
      );

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, 15000);
      ws.addEventListener("close", () => clearInterval(pingInterval));
    } catch (err: any) {
      setSessionState("error");
      onToast(err.message || "Failed initializing audio streams.", "error");
      disconnectSession();
    }
  };

  useEffect(() => () => disconnectSession(), [disconnectSession]);

  useVolumeMonitor({
    playbackAnalyserRef,
    sessionState,
    cherryVolSmoothed,
    setCherryVolume,
  });

  const injectPromptText = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "injectPrompt", text }));
    }
  }, []);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && typeof activeTopicIndex === "number") {
      wsRef.current.send(JSON.stringify({ type: "syncActiveTopic", activeTopicIndex }));
    }
  }, [activeTopicIndex]);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1);

  const pauseTeaching = useCallback(() => {
    setIsPaused(true);
    stopPlayback();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "pauseTeaching" }));
    }
  }, [stopPlayback]);

  const resumeTeaching = useCallback(() => {
    setIsPaused(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "resumeTeaching" }));
    }
  }, []);

  const togglePauseTeaching = useCallback(() => {
    if (isPaused) resumeTeaching();
    else pauseTeaching();
  }, [isPaused, resumeTeaching, pauseTeaching]);

  return {
    state: sessionState,
    isPaused,
    pauseTeaching,
    resumeTeaching,
    togglePauseTeaching,
    userVolume,
    cherryVolume,
    userTranscript,
    cherryTranscript,
    connect: connectSession,
    disconnect: disconnectSession,
    stopPlayback,
    injectPromptText,
    speechSpeed,
    setSpeechSpeed,
    isMicActive,
    teachingPhase,
    setTeachingPhase,
    micStream: micStreamRef.current,
    playbackStream: null as MediaStream | null,
  };
}
