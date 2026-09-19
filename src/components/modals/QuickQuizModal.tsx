import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, XCircle } from "lucide-react";
import { QuickQuizView } from "../QuickQuizView";

interface QuickQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentSubject?: string;
  studentGrade?: string;
  state: any;
  onInjectPrompt: (promptText: string) => void;
  onToast: (message: string, type: "info" | "success" | "error") => void;
  topics: string[];
  activeTopicIndex: number;
  customBoardContent: string;
  topicBoardsContent: Record<number, string>;
  sessionId?: string | null;
}

export const QuickQuizModal: React.FC<QuickQuizModalProps> = ({
  isOpen,
  onClose,
  studentSubject,
  studentGrade,
  state,
  onInjectPrompt,
  onToast,
  topics,
  activeTopicIndex,
  customBoardContent,
  topicBoardsContent,
  sessionId,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-55 flex flex-col justify-center items-center p-0 md:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FFFFFF] md:rounded-[24px] w-full h-full md:h-auto max-w-none md:max-w-lg shadow-2xl border-0 md:border border-[#EFF1F5] flex flex-col max-h-screen md:max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-10 pb-4 md:pt-4 border-b border-[#EFF1F5] bg-[#FFFFFF] text-[#1E293B] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#796AEF]/10 p-1.5 rounded-xl border border-[#796AEF]/20">
                  <Brain className="w-4 h-4 text-[#796AEF] font-black" />
                </div>
                <div className="text-left">
                  <h3 className="text-[12px] sm:text-[13px] font-black uppercase tracking-wider text-[#1E293B] leading-none">Quick Quiz Desk</h3>
                  <p className="text-[10px] sm:text-[10.5px] text-[#4A4E5A] font-bold tracking-wide mt-0.5 uppercase">Test your knowledge live!</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 active:scale-95 text-[#4A4E5A] hover:text-[#1E293B] rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5"
              >
                <span className="text-[10px] uppercase font-extrabold tracking-widest mr-0.5 hidden sm:inline">Close</span>
                <XCircle className="w-5 h-5 text-rose-500 hover:text-rose-600 transition-colors" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar flex-1 bg-[#F6F7FB]">
              <QuickQuizView
                subject={studentSubject}
                grade={studentGrade}
                state={state}
                onInjectPrompt={onInjectPrompt}
                onToast={onToast}
                topics={topics}
                activeTopicIndex={activeTopicIndex}
                customBoardContent={customBoardContent}
                topicBoardsContent={topicBoardsContent}
                sessionId={sessionId}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#EFF1F5] bg-[#FFFFFF] text-center shrink-0">
              <span className="text-[9.5px] sm:text-[10px] font-mono font-extrabold tracking-widest text-[#4A4E5A] uppercase">
                CHERRY MA'AM CLASSROOM • LEARN WITH FUN
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
