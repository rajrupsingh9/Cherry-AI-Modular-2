import React from "react";
import { KiaraCounselor } from "../KiaraCounselor";

export interface KiaraCounselorTabWrapperProps {
  studentName?: string;
  grade?: any;
  subject?: string;
  board?: string;
  mediumOfLearning?: string;
  dashboardStats: any;
  quizAttempts?: any[];
  pastSessions?: any[];
  snapshots?: any[];
  lowestMetric?: string;
  onEnterClassroom?: () => void;
  onStartVoiceCall: (topic?: string) => void;
  onClose: () => void;
}

export const KiaraCounselorTabWrapper: React.FC<KiaraCounselorTabWrapperProps> = ({
  studentName = "Student",
  grade,
  subject,
  board,
  mediumOfLearning,
  dashboardStats,
  quizAttempts = [],
  pastSessions = [],
  snapshots = [],
  lowestMetric,
  onEnterClassroom,
  onStartVoiceCall,
  onClose,
}) => {
  return (
    <div className="flex-1 min-h-[620px] text-left">
      <KiaraCounselor
        studentName={studentName}
        grade={grade}
        subject={subject}
        board={board}
        mediumOfLearning={mediumOfLearning}
        analytics={{
          conceptClarity: dashboardStats.conceptClarity,
          theoreticalCore: dashboardStats.theoreticalCore,
          calculationPrecision: dashboardStats.calculationPrecision,
          formulaRecall: dashboardStats.formulaRecall,
          socraticStamina: dashboardStats.socraticStamina,
          strengths: dashboardStats.strengths,
          growths: dashboardStats.growths,
          totalQuizzes: quizAttempts?.length || 0,
          classesCompleted: pastSessions?.length || 0,
          snapshotsSaved: snapshots?.length || 0,
          lowestMetric: lowestMetric,
        }}
        onNavigateToClassroom={onEnterClassroom}
        onStartVoiceCall={onStartVoiceCall}
        onClose={onClose}
      />
    </div>
  );
};
