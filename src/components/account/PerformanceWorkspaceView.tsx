import React from "react";
import { HelpCircle } from "lucide-react";
import { ANALYTICS_SUITE_TABS } from "./accountTypes";
import { MacroPerformanceView } from "./MacroPerformanceView";
import { MicroDiagnosticsView } from "./MicroDiagnosticsView";
import { RetentionMemoryView } from "./RetentionMemoryView";
import { CognitiveAgilityView } from "./CognitiveAgilityView";
import { CurriculumBlindspotTracker } from "../CurriculumBlindspotTracker";
import { PrerequisiteGapFinder } from "../PrerequisiteGapFinder";
import { ExamSpeedSprintSimulator } from "../ExamSpeedSprintSimulator";

export interface PerformanceWorkspaceViewProps {
  performanceWorkspaceTab: string;
  setPerformanceWorkspaceTab: (tab: any) => void;
  isEnglish: boolean;
  dashboardStats: any;
  subject: string;
  grade: any;
  board: string;
  studentName: string;
  t: any;
  pastSessions: any[];
  snapshots: any[];
  quizAttempts: any[];
  masteredCards?: Record<string, boolean>;
  mediumOfLearning?: string;
  onEnterClassroom?: () => void;
  onDiscussWithCherry?: (topic: string) => void;
  onOpenReportCard: () => void;
  onOpenKiaraVoice: () => void;
}

export const PerformanceWorkspaceView: React.FC<PerformanceWorkspaceViewProps> = ({
  performanceWorkspaceTab,
  setPerformanceWorkspaceTab,
  isEnglish,
  dashboardStats,
  subject,
  grade,
  board,
  studentName,
  t,
  pastSessions,
  snapshots,
  quizAttempts,
  masteredCards = {},
  mediumOfLearning,
  onEnterClassroom,
  onDiscussWithCherry,
  onOpenReportCard,
  onOpenKiaraVoice,
}) => {
  return (
              <div className="space-y-4 animate-fade-in text-left">
                {/* Performance Workspace Mode Sub-Tabs - Clean Mobile-First Navigation */}
                <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#EFF1F5] shadow-xs select-none space-y-2.5 text-left">
                  {/* Top Bar with Status and Current Dimension Indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#796AEF] animate-pulse"></span>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] font-sans">
                        Analytics & Diagnostic Suite
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-200/50">
                        7 Modules
                      </span>
                    </div>
                    <span className="text-[11px] text-[#4A4E5A] font-medium hidden sm:inline">
                      Swipe to switch diagnostic views • 100% Student-Centric
                    </span>
                  </div>

                  {/* Active Tab Explanatory Guidance Banner */}
                  {(() => {
                    const activeTabInfo = ANALYTICS_SUITE_TABS.find(
                      (t) => t.id === performanceWorkspaceTab
                    );
                    return activeTabInfo ? (
                      <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 border border-indigo-100/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#796AEF] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                            {activeTabInfo.num}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {isEnglish ? (activeTabInfo.descEn || activeTabInfo.desc) : activeTabInfo.desc}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#796AEF] bg-white px-2 py-0.5 rounded-md border border-indigo-200/60 shrink-0">
                          Active View
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* Scrollable Mobile-First Sub-Tabs Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 px-0.5 scrollbar-thin">
                    {ANALYTICS_SUITE_TABS.map((tab) => {
                      const isActive = performanceWorkspaceTab === tab.id;
                      const IconComp = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPerformanceWorkspaceTab(tab.id)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border min-h-[44px] ${
                            isActive
                              ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-bold"
                              : "text-[#4A4E5A] hover:text-[#1E293B] bg-[#F6F7FB] hover:bg-slate-100/80 border-[#EFF1F5]"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-200/80 text-slate-700"
                            }`}
                          >
                            {tab.num}
                          </span>
                          <IconComp
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-white" : "text-[#796AEF]"
                            }`}
                          />
                          <div className="flex flex-col text-left leading-tight">
                            <span className="whitespace-nowrap font-bold">
                              {tab.label}
                            </span>
                            <span
                              className={`text-[9.5px] font-normal ${
                                isActive ? "text-indigo-100" : "text-slate-500"
                              }`}
                            >
                              {isEnglish ? (tab.subtitleEn || tab.subtitle) : tab.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {performanceWorkspaceTab === "macro" ? (
                  /* EXECUTIVE MACRO PERFORMANCE & LEARNING CONTINUUM DASHBOARD (Modularized) */
                  <MacroPerformanceView
                    dashboardStats={dashboardStats}
                    subject={subject}
                    grade={grade}
                    board={board}
                    studentName={studentName}
                    isEnglish={isEnglish}
                    t={t}
                    pastSessions={pastSessions}
                    snapshots={snapshots}
                    quizAttempts={quizAttempts}
                    masteredCards={masteredCards}
                    onEnterClassroom={onEnterClassroom}
                    onOpenReportCard={onOpenReportCard}
                    onOpenKiaraVoice={onOpenKiaraVoice}
                  />
                ) : performanceWorkspaceTab === "micro" ? (
                  /* PHASE 1: MICRO OVERVIEW & ERROR CLASSIFICATION MATRIX VIEW (Modularized) */
                  <MicroDiagnosticsView
                    quizAttempts={quizAttempts}
                    subject={subject}
                    grade={grade}
                    dashboardStats={dashboardStats}
                    studentName={studentName}
                    onDiscussWithCherry={onDiscussWithCherry}
                    onEnterClassroom={onEnterClassroom}
                  />
                ) : performanceWorkspaceTab === "retention" ? (
                  /* PHASE 2: COGNITIVE RETENTION & EBBINGHAUS SPACED REPETITION VIEW (Modularized) */
                  <RetentionMemoryView
                    subject={subject}
                    grade={grade}
                    studentName={studentName}
                    isEnglish={isEnglish}
                    onDiscussWithCherry={onDiscussWithCherry}
                    onEnterClassroom={onEnterClassroom}
                  />
                ) : performanceWorkspaceTab === "agility" ? (
                  /* PHASE 3: COGNITIVE AGILITY, SPEED-ACCURACY QUADRANT & PREDICTIVE EXAM READINESS VIEW (Modularized) */
                  <CognitiveAgilityView
                    subject={subject}
                    grade={grade}
                    studentName={studentName}
                    isEnglish={isEnglish}
                    t={t}
                    onDiscussWithCherry={onDiscussWithCherry}
                    onEnterClassroom={onEnterClassroom}
                  />
                ) :                 performanceWorkspaceTab === "curriculum" ? (
                  <CurriculumBlindspotTracker
                    studentName={studentName || "Student"}
                    studentGrade={typeof grade === "number" ? grade : (parseInt(String(grade).replace(/\D/g, ""), 10) || 10)}
                    pastSessions={pastSessions}
                    quizAttempts={quizAttempts}
                    snapshots={snapshots}
                    mediumOfLearning={mediumOfLearning}
                    isEnglish={isEnglish}
                    onDiscussWithCherry={onDiscussWithCherry}
                    onEnterClassroom={onEnterClassroom}
                  />
                ) : performanceWorkspaceTab === "prerequisites" ? (
                  /* PHASE 5: PREREQUISITE DEPENDENCY GAP FINDER & KNOWLEDGE GRAPH */
                  <PrerequisiteGapFinder
                    studentName={studentName || "Student"}
                    studentGrade={typeof grade === "number" ? grade : (parseInt(String(grade).replace(/\D/g, ""), 10) || 10)}
                    pastSessions={pastSessions}
                    quizAttempts={quizAttempts}
                    snapshots={snapshots}
                    mediumOfLearning={mediumOfLearning}
                    isEnglish={isEnglish}
                    onDiscussWithCherry={onDiscussWithCherry}
                    onEnterClassroom={onEnterClassroom}
                  />
                ) : (
                  /* PHASE 6: EXAM SPEED SPRINT & TIME-PACING SIMULATOR */
                  <ExamSpeedSprintSimulator
                    studentName={studentName || "Student"}
                    studentGrade={typeof grade === "number" ? grade : (parseInt(String(grade).replace(/\D/g, ""), 10) || 10)}
                    pastSessions={pastSessions}
                    quizAttempts={quizAttempts}
                    snapshots={snapshots}
                    mediumOfLearning={mediumOfLearning}
                    isEnglish={isEnglish}
                    onDiscussWithCherry={onDiscussWithCherry}
                    onEnterClassroom={onEnterClassroom}
                  />
                )}


                {/* Dashboard bottom educational advice summary */}
                <div className="bg-[#F6F7FB] border border-[#EFF1F5] p-4.5 rounded-2xl flex items-start gap-3.5 text-left text-slate-500 text-[11.5px] leading-relaxed">
                  <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[10px]">
                      Why Cognitive Radar-Bento Hub?
                    </span>
                    <p>
                      According to educational psychometrics, learning progress
                      is multi-dimensional. Standard scores mask where a student
                      is stumbling (e.g. they might understand the core theory
                      but fail multi-step algebra calculation precision). By
                      breaking down your performance into{" "}
                      <strong className="text-slate-700">Concept Clarity</strong>
                      ,{" "}
                      <strong className="text-slate-700">
                        Theoretical core definitions
                      </strong>
                      , and{" "}
                      <strong className="text-slate-700">
                        Calculation precision
                      </strong>
                      , this board-book synchronizes with your active lectures
                      in real-time, giving you an edge of smart
                      spaced-repetition.
                    </p>
                  </div>
                </div>
              </div>
  );
};
