/**
 * CurriculumMotivationFooter.tsx
 * Educational callout explaining why blueprint-synchronized blindspot tracking ensures board exam success.
 */
import React from "react";
import { Award } from "lucide-react";

interface CurriculumMotivationFooterProps {
  isEng: boolean;
}

export const CurriculumMotivationFooter: React.FC<CurriculumMotivationFooterProps> = ({ isEng }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex items-start gap-3.5 text-left text-slate-600 text-[11.5px] leading-relaxed shadow-2xs">
      <Award className="w-5 h-5 text-[#796AEF] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[10px]">
          {isEng
            ? "Why Blueprint-Synchronized Blindspot Elimination Wins Exams:"
            : "Why Blueprint-Synchronized Blindspot Elimination Wins Exams • बोर्ड ब्लूप्रिंट से सिंक की गई तैयारी क्यों जीतती है:"}
        </span>
        {!isEng && (
          <p>
            छात्र अक्सर वही चैप्टर्स दोहराते हैं जिनमें वे पहले से सहज महसूस करते हैं, जबकि बोर्ड व प्रतियोगी परीक्षाओं में छूटे हुए विषयों (Blindspots) के कारण सबसे अधिक अंक कटते हैं। चेरी क्लासरूम हर उप-विषय को आधिकारिक बोर्ड ब्लूप्रिंट से जोड़ता है ताकि परीक्षा हॉल में कोई भी अप्रत्याशित प्रश्न आपके सामने न आए।
          </p>
        )}
        <p className="text-slate-500 text-[11px]">
          Unlike open-ended revision where students repeatedly practice comfortable topics, board exams penalize skipped chapters. By mapping every single subtopic against the official marks blueprint, Cherry Classroom ensures zero surprise questions in the exam hall.
        </p>
      </div>
    </div>
  );
};
