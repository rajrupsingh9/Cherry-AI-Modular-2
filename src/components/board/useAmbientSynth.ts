/**
 * useAmbientSynth.ts
 * Multi-oscillator ambient chord synthesizer for study atmosphere
 */
import { useState, useRef, useEffect } from "react";

export function useAmbientSynth() {
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<any>(null);
  const synthNodesRef = useRef<any[]>([]);

  const startSynth = () => {
    try {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterVolume = ctx.createGain();
      masterVolume.gain.setValueAtTime(0.08, ctx.currentTime);

      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.setValueAtTime(280, ctx.currentTime);
      biquadFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      masterVolume.connect(biquadFilter);
      biquadFilter.connect(ctx.destination);

      const frequencies = [130.81, 196.00, 261.63, 329.63];
      const oscillators: any[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.25 + idx * 0.08, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.03, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterVolume);

        osc.start();
        lfo.start();

        oscillators.push(osc, lfo);
      });

      synthNodesRef.current = oscillators;
      setIsSynthPlaying(true);
    } catch (err) {
      console.warn("Failed to start pre-class ambient synthesizer:", err);
    }
  };

  const stopSynth = () => {
    try {
      synthNodesRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      synthNodesRef.current = [];

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
      setIsSynthPlaying(false);
    } catch (e) {
      console.warn("Failed to stop synthesizer:", e);
    }
  };

  const toggleSynth = () => {
    if (isSynthPlaying) {
      stopSynth();
    } else {
      startSynth();
    }
  };

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, []);

  return {
    isSynthPlaying,
    startSynth,
    stopSynth,
    toggleSynth
  };
}
