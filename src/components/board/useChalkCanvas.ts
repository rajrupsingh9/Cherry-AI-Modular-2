/**
 * useChalkCanvas.ts
 * Canvas drawing engine with chalk texture jitter & touch support
 */
import React, { useState, useRef, useEffect } from "react";

interface UseChalkCanvasProps {
  primaryColor: string;
  isLightBg: boolean;
  state: string;
  onCanvasRef?: (canvas: HTMLCanvasElement | null) => void;
}

export function useChalkCanvas({
  primaryColor,
  isLightBg,
  state,
  onCanvasRef
}: UseChalkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chalkColor, setChalkColor] = useState<string>("#ffffff");
  const [chalkWidth, setChalkWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  useEffect(() => {
    if (isLightBg) {
      setChalkColor("#0f172a"); // Charcoal dark chalk
    } else {
      setChalkColor("#ffffff"); // White chalk
    }
  }, [primaryColor, isLightBg]);

  const drawChalkLine = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = chalkColor;
    ctx.lineWidth = chalkWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Chalk texture effect: draw with partial opacity + multiple faint brush offsets
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 3; i++) {
      const offset = (Math.random() - 0.5) * 1.5;
      ctx.beginPath();
      ctx.moveTo(x1 + offset, y1 + offset);
      ctx.lineTo(x2 + offset, y2 + offset);
      ctx.stroke();
    }

    // Core bold line
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastXRef.current = x;
    lastYRef.current = y;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawChalkLine(lastXRef.current, lastYRef.current, x, y);

    lastXRef.current = x;
    lastYRef.current = y;
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    lastXRef.current = x;
    lastYRef.current = y;
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    drawChalkLine(lastXRef.current, lastYRef.current, x, y);

    lastXRef.current = x;
    lastYRef.current = y;
  };

  // Adjust canvas width/height on mount/render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || 240;
  }, [canvasRef, state]);

  // Propagate canvas ref to parent
  useEffect(() => {
    if (onCanvasRef) {
      onCanvasRef(canvasRef.current);
    }
  }, [canvasRef, onCanvasRef]);

  return {
    canvasRef,
    chalkColor,
    setChalkColor,
    chalkWidth,
    setChalkWidth,
    clearCanvas,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasTouchStart,
    handleCanvasTouchMove
  };
}
