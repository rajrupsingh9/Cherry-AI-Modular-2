/**
 * PrerequisiteRationaleCard.tsx
 * Educational callout explaining the pedagogical value of upstream foundation recovery.
 */
import React from "react";
import { Award } from "lucide-react";

interface PrerequisiteRationaleCardProps {
  isEng: boolean;
}

export const PrerequisiteRationaleCard: React.FC<PrerequisiteRationaleCardProps> = ({ isEng }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex items-start gap-3.5 text-left text-slate-600 text-xs leading-relaxed">
      <Award className="w-5 h-5 text-[#796AEF] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[10px]">
          {isEng ? "Why the Prerequisite Knowledge Graph Works:" : "प्रिरिक्विज़िट नॉलेज ग्राफ क्यों महत्वपूर्ण है? (Why it works):"}
        </span>
        <p>
          {isEng
            ? "In STEM subjects, memorizing Class 12 formulas without solid Class 9 & 10 fundamentals leads students to stumble on novel exam variations. By pinpointing the exact broken link in the upstream chain, you can reinforce your foundation in 5 minutes and secure full marks across the entire chapter."
            : "विज्ञान व गणित में कक्षा 9 व 10 की बुनियादी समझ के बिना कक्षा 12 के जटिल सूत्रों को रटने से छात्र बोर्ड परीक्षा के नए अनुप्रयोगों में अटक जाते हैं। इस अवधारणा श्रृंखला (Concept Chain) के टूटे हुए लिंक को पहचानकर, आप केवल 5 मिनट में अपनी जड़ मजबूत कर सकते हैं और पूरे अध्याय में पूर्ण अंक सुनिश्चित कर सकते हैं।"}
        </p>
      </div>
    </div>
  );
};
