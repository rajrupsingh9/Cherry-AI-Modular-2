import confetti from "canvas-confetti";

export function triggerCelebrationConfetti(options?: confetti.Options): void {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#796aef", "#c4f500", "#0a3641", "#ff4081", "#00e5ff"],
      ...options,
    });
  } catch (err) {
    console.warn("Confetti animation failed:", err);
  }
}
