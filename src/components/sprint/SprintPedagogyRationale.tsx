/**
 * SprintPedagogyRationale.tsx
 * Scientific & pedagogical rationale card for exam time pacing and rapid drills.
 */
import React from "react";
import { Award } from "lucide-react";

interface SprintPedagogyRationaleProps {
  isEng: boolean;
}

export const SprintPedagogyRationale: React.FC<SprintPedagogyRationaleProps> = ({ isEng }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex items-start gap-3.5 text-left text-slate-600 text-xs leading-relaxed">
      <Award className="w-5 h-5 text-[#796AEF] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[10px]">
          {isEng
            ? "Scientific Importance of Time Pacing & 7-Day Score Booster:"
            : "टाइम-पेसिंग व 7-दिवसीय स्कोर बूस्टर की वैज्ञानिक महत्ता:"}
        </span>
        <p>
          {isEng
            ? "In board exams, high scores stem not merely from studying more hours, but from disciplined time management and exam shortcuts. Spending just 15 minutes daily on high-yield focused drills ensures you stay panic-free in the exam hall and easily bank a 25+ minute buffer to thoroughly review your entire answer sheet."
            : "बोर्ड परीक्षा में अच्छे अंक केवल अधिक पढ़ाई से नहीं, बल्कि समय के सही प्रबंधन और शॉर्टकट ट्रिक्स से आते हैं। प्रतिदिन केवल 15 मिनट उच्च-भार वाले विषयों पर केंद्रित अभ्यास करने से आप परीक्षा हॉल में पैनिक-फ्री रहते हैं और पूरे प्रश्नपत्र की जाँच के लिए 25+ मिनट का बफ़र समय आसानी से बचा लेते हैं।"}
        </p>
      </div>
    </div>
  );
};
