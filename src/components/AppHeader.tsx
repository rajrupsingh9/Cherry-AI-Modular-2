import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Play,
  Pause,
  MicOff,
  Palette,
  Gauge,
  Minimize2,
  Maximize2,
  Youtube,
} from "lucide-react";
import AmbientFocusAudio from "./AmbientFocusAudio";
import { ThemeType } from "../types";

export interface AppHeaderProps {
  isFullScreenBoard: boolean;
  setIsFullScreenBoard: (val: boolean) => void;
  currentScreen: string;
  studentSubject?: string;
  studentGrade?: string;
  state: "disconnected" | "connecting" | "connected";
  handlePowerToggle: () => void;
  isPaused: boolean;
  togglePauseTeaching: () => void;
  t: any;
  theme: ThemeType;
  handleThemeChange: (newTheme: ThemeType) => void;
  THEME_CONFIGS: Record<ThemeType, any>;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;
  activeColors: { primary: string; accent: string };
  activeDocument: { filename: string; mimeType: string; markdown: string; mode?: string; detectedSubject?: string } | null;
  showMobileYtPlayer: boolean;
  setShowMobileYtPlayer: (val: boolean) => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isFullScreenBoard,
  setIsFullScreenBoard,
  currentScreen,
  studentSubject,
  studentGrade,
  state,
  handlePowerToggle,
  isPaused,
  togglePauseTeaching,
  t,
  theme,
  handleThemeChange,
  THEME_CONFIGS,
  speechSpeed,
  setSpeechSpeed,
  activeColors,
  activeDocument,
  showMobileYtPlayer,
  setShowMobileYtPlayer,
  addToast,
}) => {
  const [showThemePopover, setShowThemePopover] = useState(false);
  const themePopoverRef = useRef<HTMLDivElement | null>(null);

  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const speedPopoverRef = useRef<HTMLDivElement | null>(null);

  // Close speed popover on click outside (supporting mouse, touch, and pointer events)
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (speedPopoverRef.current && !speedPopoverRef.current.contains(e.target as Node)) {
        setShowSpeedControl(false);
      }
    };
    if (showSpeedControl) {
      document.addEventListener("pointerdown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showSpeedControl]);

  // Close theme popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (themePopoverRef.current && !themePopoverRef.current.contains(e.target as Node)) {
        setShowThemePopover(false);
      }
    };
    if (showThemePopover) {
      document.addEventListener("pointerdown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showThemePopover]);

  return (
    <header
      className={`w-full h-[52px] min-h-[52px] max-h-[52px] bg-white border-b border-slate-200/80 px-3.5 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-4 z-20 shrink-0 font-sans select-none transition-all duration-300 shadow-2xs ${
        isFullScreenBoard || currentScreen === "home" ? "hidden" : "landscape:hidden"
      }`}
    >
      {/* Left: Class Info Header */}
      <div className="flex-shrink min-w-0 flex items-center gap-2 justify-start">
        <div className="w-8 h-8 rounded-xl items-center justify-center border border-slate-200/90 bg-white text-[#796AEF] flex-shrink-0 shadow-xs flex">
          <GraduationCap className="w-4 h-4" />
        </div>

        <div className="flex flex-col min-w-0 text-left">
          <span className="text-xs sm:text-sm font-sans font-extrabold tracking-wide text-slate-900 uppercase truncate max-w-[85px] xs:max-w-[130px] sm:max-w-[240px]">
            {studentSubject || "Study Session"}
          </span>
          <span className="text-[10px] sm:text-[10.5px] font-mono tracking-wider uppercase font-bold text-slate-500 truncate">
            {studentGrade || "Grade 10"}
          </span>
        </div>
      </div>

      {/* Center: Live Control Center / Dynamic Island */}
      <div className="flex-shrink-0 flex items-center justify-center px-0.5 sm:px-1">
        {state === "disconnected" ? (
          <button
            onClick={handlePowerToggle}
            className="relative overflow-hidden px-2.5 py-1 xs:px-3.5 xs:py-1.5 sm:px-4.5 sm:py-2 rounded-full transition-all duration-300 active:scale-95 shadow-sm bg-[#796AEF] hover:bg-[#6858e0] text-white flex items-center gap-1 sm:gap-2 flex-shrink-0 cursor-pointer"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-sans font-black tracking-widest text-white uppercase leading-none mt-[1px] whitespace-nowrap">
              {t.startClass}
            </span>
          </button>
        ) : (
          <div
            className={`px-2 py-1 xs:px-2.5 xs:py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border flex items-center gap-1.5 sm:gap-2 shadow-xs transition-all duration-300 flex-shrink-0 ${
              isPaused
                ? "border-amber-300/80 bg-amber-50/90 text-amber-900"
                : "border-[#EFF1F5] bg-[#F6F7FB] text-[#1E293B]"
            }`}
          >
            {isPaused ? (
              <span className="flex items-center gap-1 shrink-0">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] sm:text-[10.5px] font-mono tracking-widest uppercase font-black text-amber-800 whitespace-nowrap">
                  PAUSED
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1 shrink-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#796AEF]" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#796AEF]" />
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-mono tracking-widest uppercase font-black text-[#1E293B] whitespace-nowrap">
                  {state === "connecting" ? t.connecting : "LIVE"}
                </span>
              </span>
            )}

            <div className="h-3.5 w-[1px] bg-slate-300" />

            {/* Pause / Resume Button */}
            <button
              onClick={togglePauseTeaching}
              className={`h-6.5 sm:h-7 px-2 xs:px-2.5 rounded-lg font-mono text-[10px] sm:text-[10.5px] font-black uppercase flex items-center gap-1 transition-all duration-200 active:scale-90 cursor-pointer shrink-0 ${
                isPaused
                  ? "bg-[#796AEF] hover:bg-[#6858e0] text-white shadow-xs"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/60"
              }`}
              title={isPaused ? "Resume Live AI Teaching (Space / P)" : "Pause Live AI Teaching (Space / P)"}
            >
              {isPaused ? (
                <>
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  <span className="hidden xs:inline">RESUME</span>
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  <span className="hidden xs:inline">PAUSE</span>
                </>
              )}
            </button>

            <div className="h-3.5 w-[1px] bg-slate-300" />

            <button
              onClick={handlePowerToggle}
              className="p-0.5 sm:p-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200 active:scale-90 cursor-pointer shrink-0"
              title="End / Halt Class Session"
            >
              <MicOff className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Glass Quick Actions Panel with Safe Touch Targets and Generous Spacing */}
      <div className="flex-shrink-0 flex items-center justify-end">
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 p-1 xs:p-1.5 sm:p-2 rounded-2xl border border-[#EFF1F5] bg-[#F6F7FB] shadow-2xs flex-shrink-0">
          {/* Change Blackboard Theme Button & Popover */}
          <div className="relative shrink-0" ref={themePopoverRef}>
            <button
              onClick={() => setShowThemePopover(!showThemePopover)}
              className={`w-8 h-8 xs:w-8.5 xs:h-8.5 sm:w-10 sm:h-10 rounded-xl text-[#1E293B] hover:bg-white active:scale-95 cursor-pointer transition-all duration-200 flex items-center justify-center bg-white border border-[#EFF1F5] shadow-2xs shrink-0 ${
                showThemePopover ? "ring-2 ring-[#796AEF] ring-offset-1 text-[#796AEF]" : ""
              }`}
              title="Change Blackboard Theme & Colors"
            >
              <Palette className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <AnimatePresence>
              {showThemePopover && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 z-[100] bg-white rounded-2xl p-4 shadow-xl border border-[#EFF1F5] w-[calc(100vw-1rem)] sm:w-80 text-left space-y-3.5 max-w-[340px] pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#EFF1F5]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B]">
                      <Palette className="w-4 h-4 text-[#796AEF]" />
                      <span>Blackboard Theme & Slate</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#796AEF]/10 text-[#796AEF]">
                      6 Themes
                    </span>
                  </div>

                  {/* Theme Grid Items */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "cherry" as ThemeType, name: "Deep Forest", desc: "Classic Chalkboard", color: "#0c201a", accent: "#c4f500" },
                      { key: "matrix" as ThemeType, name: "Matrix Green", desc: "Terminal Slate", color: "#020a05", accent: "#00ff66" },
                      { key: "cyber" as ThemeType, name: "Cyberpunk", desc: "Electric Violet", color: "#120924", accent: "#00f0ff" },
                      { key: "sunset" as ThemeType, name: "Twilight", desc: "Warm Burgundy", color: "#240a0a", accent: "#ff9900" },
                      { key: "slate" as ThemeType, name: "Graphite", desc: "Dark Charcoal", color: "#1e293b", accent: "#38bdf8" },
                      { key: "ivory" as ThemeType, name: "Ice White", desc: "Crisp White Board", color: "#ffffff", accent: "#796AEF", isLight: true },
                    ].map((item) => {
                      const isSelected = theme === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            handleThemeChange(item.key);
                            setShowThemePopover(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-1.5 relative ${
                            isSelected
                              ? "border-[#796AEF] bg-[#796AEF]/5 shadow-xs ring-1 ring-[#796AEF]"
                              : "border-[#EFF1F5] hover:border-slate-300 hover:bg-[#F6F7FB]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex items-center justify-center relative shrink-0"
                              style={{ backgroundColor: item.color }}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.accent }}
                              />
                            </div>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF]" />
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-[11px] font-bold text-[#1E293B] truncate leading-tight">
                              {item.name}
                            </div>
                            <div className="text-[9px] text-[#4A4E5A] font-mono truncate leading-tight">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Direct Color Dots Background Selector (visible on sm+) */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 border-l border-[#EFF1F5]">
            {(Object.keys(THEME_CONFIGS) as ThemeType[]).map((thmKey) => {
              const thm = THEME_CONFIGS[thmKey];
              const isActive = theme === thmKey;
              const dotColor = thmKey === "ivory" ? "#ffffff" : thm.primary;
              const borderClass = thmKey === "ivory" ? "border-zinc-300" : "border-transparent";

              return (
                <button
                  key={thmKey}
                  onClick={() => handleThemeChange(thmKey)}
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border ${borderClass} transition-all hover:scale-125 active:scale-90 cursor-pointer flex items-center justify-center relative ${
                    isActive
                      ? "ring-2 ring-[#796AEF] ring-offset-1 scale-110 shadow-xs"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: dotColor }}
                  title={`${thmKey.charAt(0).toUpperCase() + thmKey.slice(1)} Blackboard Background`}
                >
                  {isActive && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        thmKey === "ivory" ? "bg-zinc-800" : "bg-white"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Voice Playback & Blackboard Writing Speed Control Group */}
          <div
            className="relative shrink-0 flex items-center bg-white border border-[#EFF1F5] rounded-xl shadow-2xs p-0.5"
            ref={speedPopoverRef}
          >
            {/* Step Slower Button (1-Tap Quick Slow) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const presets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                const lower = [...presets].reverse().find((p) => p < speechSpeed - 0.01) ?? 0.5;
                setSpeechSpeed(lower);
                addToast(`Teaching speed slowed to ${lower}x 🐢`, "info");
              }}
              disabled={speechSpeed <= 0.5}
              className="w-6 h-7 xs:w-6.5 xs:h-7.5 sm:w-7.5 sm:h-8.5 rounded-lg text-[#4A4E5A] hover:text-[#1E293B] hover:bg-[#F6F7FB] active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all font-mono font-black text-xs"
              title="Slow Down Teaching Speed (Dheema)"
            >
              -
            </button>

            {/* Main Speed Indicator & Popover Toggle */}
            <button
              onClick={() => setShowSpeedControl(!showSpeedControl)}
              className={`h-7 xs:h-7.5 sm:h-8.5 px-1.5 xs:px-2 rounded-lg text-[#1E293B] hover:bg-[#F6F7FB] active:scale-95 cursor-pointer transition-all duration-200 flex items-center gap-1 font-mono text-[10.5px] xs:text-[11px] font-black ${
                speechSpeed !== 1.0 ? "text-[#796AEF] bg-[#796AEF]/10 font-black" : ""
              }`}
              title="Cherry Ma'am Teaching Speed (Fast / Slow) - Click for all controls"
            >
              <Gauge className={`w-3.5 h-3.5 ${speechSpeed !== 1.0 ? "text-[#796AEF]" : "text-[#4A4E5A]"}`} />
              <span className="leading-none">{speechSpeed}x</span>
            </button>

            {/* Step Faster Button (1-Tap Quick Fast) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const presets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                const higher = presets.find((p) => p > speechSpeed + 0.01) ?? 2.0;
                setSpeechSpeed(higher);
                addToast(`Teaching speed increased to ${higher}x ⚡`, "info");
              }}
              disabled={speechSpeed >= 2.0}
              className="w-6 h-7 xs:w-6.5 xs:h-7.5 sm:w-7.5 sm:h-8.5 rounded-lg text-[#4A4E5A] hover:text-[#1E293B] hover:bg-[#F6F7FB] active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all font-mono font-black text-xs"
              title="Speed Up Teaching Speed (Tez)"
            >
              +
            </button>

            <AnimatePresence>
              {showSpeedControl && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 z-[100] bg-white rounded-2xl p-4 shadow-xl border border-[#EFF1F5] w-[calc(100vw-1rem)] sm:w-80 text-left space-y-3.5 max-w-[340px] pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#EFF1F5]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B]">
                      <Gauge className="w-4 h-4 text-[#796AEF]" />
                      <span>Teaching & Voice Speed</span>
                    </div>
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-[#796AEF] text-white shadow-2xs">
                      {speechSpeed}x {speechSpeed < 0.9 ? "🐢 Dheema" : speechSpeed > 1.2 ? "⚡ Tez" : "🎯 Normal"}
                    </span>
                  </div>

                  {/* Slider Control with Step Adjusters */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const next = Math.max(0.5, Number((speechSpeed - 0.1).toFixed(2)));
                          setSpeechSpeed(next);
                        }}
                        className="px-2 py-1 bg-[#F6F7FB] hover:bg-slate-200 text-[#1E293B] rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all active:scale-95 border border-[#EFF1F5]"
                        title="Decrease by 0.1x"
                      >
                        -0.1x
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={speechSpeed}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSpeechSpeed(val);
                        }}
                        className="w-full h-2 bg-[#EFF1F5] rounded-lg appearance-none cursor-pointer accent-[#796AEF]"
                      />
                      <button
                        onClick={() => {
                          const next = Math.min(2.0, Number((speechSpeed + 0.1).toFixed(2)));
                          setSpeechSpeed(next);
                        }}
                        className="px-2 py-1 bg-[#F6F7FB] hover:bg-slate-200 text-[#1E293B] rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all active:scale-95 border border-[#EFF1F5]"
                        title="Increase by 0.1x"
                      >
                        +0.1x
                      </button>
                    </div>
                    <div className="flex justify-between text-[9.5px] font-mono text-[#4A4E5A] font-bold px-0.5">
                      <span>0.5x (Slow)</span>
                      <span>1.0x (Normal)</span>
                      <span>1.5x (Fast)</span>
                      <span>2.0x (Max)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A4E5A]">
                      Quick Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { spd: 0.75, label: "0.75x Slow 🐢" },
                        { spd: 1.0, label: "1.0x Normal 🎯" },
                        { spd: 1.25, label: "1.25x Fast ⚡" },
                        { spd: 1.5, label: "1.5x Turbo 🚀" },
                        { spd: 1.75, label: "1.75x Rapid 💨" },
                        { spd: 2.0, label: "2.0x Max 🔥" },
                      ].map(({ spd, label }) => (
                        <button
                          key={spd}
                          onClick={() => {
                            setSpeechSpeed(spd);
                            addToast(`Teaching speed set to ${spd}x 🎙️⚡`, "info");
                          }}
                          className={`px-2 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                            speechSpeed === spd
                              ? "bg-[#796AEF] text-white shadow-xs font-black"
                              : "bg-[#F6F7FB] text-[#4A4E5A] hover:bg-slate-100 hover:text-[#1E293B] border border-[#EFF1F5] active:scale-95"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#F6F7FB] border border-[#EFF1F5] text-[9.5px] text-[#1E293B] font-mono leading-relaxed">
                    💡 <strong>Live Synchronized:</strong> Cherry Ma'am ki voice speed aur chalkboard handwriting typing dono live update hoti hain.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ambient Focus Headphones Audio Button */}
          <div className="shrink-0 flex items-center justify-center">
            <AmbientFocusAudio primaryColor={activeColors.primary} accentColor={activeColors.accent} compact={true} />
          </div>

          {/* Full Screen Mode Toggle Button */}
          <button
            onClick={() => {
              setIsFullScreenBoard(!isFullScreenBoard);
              addToast(
                `Blackboard Full Fit ${!isFullScreenBoard ? "Enabled" : "Disabled"}`,
                "info"
              );
            }}
            className="w-8 h-8 xs:w-8.5 xs:h-8.5 sm:w-10 sm:h-10 rounded-xl text-[#1E293B] hover:bg-white active:scale-95 cursor-pointer transition-all duration-200 flex items-center justify-center bg-white border border-[#EFF1F5] shadow-2xs shrink-0"
            title="Toggle Full Screen Fit Mode"
          >
            {isFullScreenBoard ? (
              <Minimize2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" />
            )}
          </button>

          {/* YouTube Video Source Toggle Button */}
          {activeDocument && activeDocument.mimeType === "video/youtube" && (
            <button
              onClick={() => setShowMobileYtPlayer(!showMobileYtPlayer)}
              className={`w-8 h-8 xs:w-8.5 xs:h-8.5 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 flex items-center justify-center active:scale-95 cursor-pointer border shadow-2xs shrink-0 ${
                showMobileYtPlayer ? "bg-red-50 text-red-600 border-red-200 font-bold" : "bg-white text-[#1E293B] border-[#EFF1F5] hover:bg-[#F6F7FB]"
              }`}
              title="Watch YouTube Source Video"
            >
              <Youtube className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
