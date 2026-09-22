import type { Dispatch, SetStateAction } from "react";
import type { ThemeType } from "../../types";

export interface UseClassroomControllerProps {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  user: any;
  studentDetails: {
    name?: string;
    grade?: string;
    board?: string;
    mediumOfLearning?: string;
    subject?: string;
    [key: string]: any;
  };
  setStudentDetails: Dispatch<SetStateAction<any>>;

  // Blackboard & Topic Content
  customBoardContent: string;
  setCustomBoardContent: Dispatch<SetStateAction<string>>;
  topicBoardsContent: Record<number, string>;
  setTopicBoardsContent: Dispatch<SetStateAction<Record<number, string>>>;
  activeTopicIndex: number;
  setActiveTopicIndex: Dispatch<SetStateAction<number>>;
  topics: string[];
  activeDocument: any;
  setActiveDocument: Dispatch<SetStateAction<any>>;

  // UI Flow & Screen States
  currentScreen: any;
  setCurrentScreen: any;
  showBrandSplash: boolean;
  showIntroWalkthrough: boolean;
  showEnrollmentScreen: boolean;
  setUploadedButWaitingWakeup: (val: boolean) => void;

  // Modals & Extras
  setPostLessonSession: (data: any) => void;
  setShowPostLessonModal: (show: boolean) => void;
  setPastSessions: Dispatch<SetStateAction<any[]>>;

  // Feedback Callbacks
  addToast: (message: string, type: "info" | "success" | "error") => void;
  handleThemeChange: (theme: ThemeType) => void;
  autoCaptureSnapshot: (topicIndex: number, boardContent: string, isManual?: boolean) => Promise<void>;
}
