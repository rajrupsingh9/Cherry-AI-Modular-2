import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap } from "lucide-react";

interface TipsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsDrawer: React.FC<TipsDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full bg-white border-t border-[#dae1dd] p-6 z-20"
        >
          <div className="max-w-xl mx-auto space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#dae1dd] pb-2.5">
              <h3 className="text-sm font-mono tracking-wider text-[#0a3641] uppercase flex items-center gap-1.5 font-bold">
                <GraduationCap className="w-4 h-4 text-[#0a3641]"/> Class Information & Tips
              </h3>
              <button 
                id="close-tips-btn"
                onClick={onClose} 
                className="text-xs text-[#486a73] hover:text-[#0a3641] underline cursor-pointer font-bold"
              >
                Close
              </button>
            </div>
            <ul className="text-xs text-[#486a73] space-y-2.5 list-disc pl-4 leading-relaxed p-1 font-medium">
              <li>
                <strong className="text-[#0a3641]">Live Voice Learning</strong>: Cherry Ma'am communicates strictly over live interactive audio. No boring typing inputs required—just speak casually!
              </li>
              <li>
                <strong className="text-[#0a3641]">Hinglish Medium</strong>: Ask in a blend of Hindi & English. She responds in a friendly, conversational mix of casual Hinglish, like a super-smart buddy.
              </li>
              <li>
                <strong className="text-[#0a3641]">Math & Science Formulas</strong>: Ask for Maths calculations, Physics numerical equations, or Chemical bonds. She outputs formatted LaTeX equations, rendered live in pristine blackboard style on screen!
              </li>
              <li>
                <strong className="text-[#0a3641]">Speech and Typing Parity</strong>: The blackboard typewriter automatically tracks and coordinates characters rendering dynamically matched with the exact pacing of her vocalization.
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
