/**
 * readerThemeConfig.ts
 * Theme definitions and typography token mappings for the In-App Book Reader.
 */
import {
  ReaderTheme,
  ReaderFontSize,
  ReaderFontFamily,
  ThemeStyleClasses,
} from "./readerTypes";

export const THEME_CLASSES: Record<ReaderTheme, ThemeStyleClasses> = {
  chalkboard: {
    modalBg: "bg-[#041411] text-emerald-50",
    headerBg: "bg-[#061f19] border-teal-900/60 text-teal-100",
    sidebarBg: "bg-[#031310] border-teal-900/50 text-teal-200",
    contentBg:
      "bg-gradient-to-br from-[#061e18] via-[#07241d] to-[#041712] text-teal-50",
    sidebarItemActive:
      "bg-teal-800/60 border-teal-400/60 text-[#c4f500] font-black shadow-inner",
    sidebarItemInactive:
      "hover:bg-teal-950/60 text-teal-300/80 hover:text-white border-transparent",
    accentBadge: "bg-teal-900/80 text-[#c4f500] border-teal-600/40",
    cardBorder: "border-teal-800/40",
    mathText: "text-white",
    highlightCallout: "bg-teal-950/80 border-teal-700/60 text-teal-200",
    formulaCard: "bg-[#061f19]/90 border-teal-800/50 text-teal-100",
    scrollbarColor: "scrollbar-thumb-teal-800",
    pageRuler: "border-teal-900/40",
    secondaryBtn:
      "bg-teal-900/40 hover:bg-teal-800/60 border-teal-700/40 text-teal-200",
    primaryBtn: "bg-[#0a3641] hover:bg-teal-800 text-white",
  },
  paper: {
    modalBg: "bg-[#f5f2eb] text-slate-900",
    headerBg: "bg-[#faf8f5] border-amber-200/80 text-[#0a3641]",
    sidebarBg: "bg-[#f3eee5] border-amber-200/70 text-slate-700",
    contentBg: "bg-[#fcfbf9] text-slate-900",
    sidebarItemActive:
      "bg-amber-100/90 border-teal-600 text-teal-950 font-black shadow-xs",
    sidebarItemInactive:
      "hover:bg-amber-50 text-slate-600 hover:text-slate-900 border-transparent",
    accentBadge: "bg-teal-100 text-teal-900 border-teal-300",
    cardBorder: "border-amber-200/80",
    mathText: "text-slate-950 font-semibold",
    highlightCallout: "bg-amber-50 border-amber-300/80 text-amber-950",
    formulaCard: "bg-white border-amber-200 text-slate-900 shadow-2xs",
    scrollbarColor: "scrollbar-thumb-amber-300",
    pageRuler: "border-amber-200/60",
    secondaryBtn: "bg-white hover:bg-amber-50 border-amber-200 text-slate-700",
    primaryBtn: "bg-[#0a3641] hover:bg-teal-900 text-white",
  },
  obsidian: {
    modalBg: "bg-[#070b12] text-slate-100",
    headerBg: "bg-[#0b101c] border-slate-800 text-slate-200",
    sidebarBg: "bg-[#060910] border-slate-800 text-slate-300",
    contentBg: "bg-gradient-to-b from-[#090e18] to-[#060910] text-slate-100",
    sidebarItemActive:
      "bg-indigo-950/70 border-cyan-400 text-cyan-300 font-black shadow-inner",
    sidebarItemInactive:
      "hover:bg-slate-900/80 text-slate-400 hover:text-white border-transparent",
    accentBadge: "bg-cyan-950/80 text-cyan-300 border-cyan-700/50",
    cardBorder: "border-slate-800",
    mathText: "text-white",
    highlightCallout: "bg-slate-900/80 border-slate-700 text-slate-200",
    formulaCard: "bg-slate-900/90 border-slate-800 text-slate-100",
    scrollbarColor: "scrollbar-thumb-slate-700",
    pageRuler: "border-slate-800",
    secondaryBtn:
      "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200",
    primaryBtn: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold",
  },
};

export const FONT_CLASSES: Record<ReaderFontSize, string> = {
  sm: "text-xs sm:text-sm leading-relaxed",
  base: "text-sm sm:text-base leading-relaxed",
  lg: "text-base sm:text-lg leading-relaxed",
  xl: "text-lg sm:text-xl leading-relaxed",
};

export const FONT_FAMILY_CLASSES: Record<ReaderFontFamily, string> = {
  sans: "font-sans",
  serif: "font-serif tracking-normal leading-loose",
  mono: "font-mono tracking-tight text-[13.5px]",
};
