/**
 * macroTypes.ts
 * Type definitions for Macro Performance View & Executive Learning Analytics.
 */

export interface MacroPerformanceViewProps {
  dashboardStats: any;
  subject: string;
  grade: string | number;
  board?: string;
  studentName?: string;
  isEnglish?: boolean;
  t?: any;
  pastSessions?: any[];
  snapshots?: any[];
  quizAttempts?: any[];
  masteredCards?: Record<string, boolean>;
  onEnterClassroom?: () => void;
  onOpenReportCard?: () => void;
  onOpenKiaraVoice?: () => void;
}
