import { ThemeType } from "../../types";

export interface UseLiveSessionProps {
  onThemeChange: (theme: ThemeType) => void;
  onToast: (message: string, type: "info" | "success" | "error") => void;
  onNextTopic?: () => void;
  onClassComplete?: () => void;
  onTeachingPhaseChange?: (phase: string) => void;
  onUpdateWhiteboard?: (content: string, append: boolean) => void;
  studentName?: string;
  grade?: string;
  board?: string;
  mediumOfLearning?: string;
  subject?: string;
  activeTopicIndex?: number;
  sessionId?: string;
  [key: string]: any;
}
