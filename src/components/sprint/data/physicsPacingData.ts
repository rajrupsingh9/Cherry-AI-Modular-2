/**
 * physicsPacingData.ts
 * Exam Pacing Profile & Rapid Speed Questions for Physics (Track A).
 */
import { ExamPacingProfile } from "../sprintTypes";

export const PHYSICS_PACING_PROFILE: ExamPacingProfile = {
  id: "pacing-jee-neet-phy",
  examName: "CBSE & NEET Physics Speed Drill",
  hindiExamName: "कक्षा 12 भौतिकी • स्पीड व टाइम-पेसिंग ड्रिल",
  subject: "Physics",
  totalExamQuestions: 45,
  totalExamMinutes: 45,
  targetSecondsPerQuestion: 60,
  paceBand: "rapid_mcq",
  description: "Rapid dimensional analysis, ratio scaling, and mental shortcut elimination for high-pressure Physics MCQs.",
  hindiDescription: "विमीय विश्लेषण, अनुपात विधि और 10-सेकंड मानसिक शॉर्टकट से भौतिकी के बहुविकल्पीय प्रश्नों को तेज हल करें।",
  questions: [
    {
      id: "q-phy-1",
      subject: "Physics",
      topic: "Current Electricity & Resistance",
      hindiTopic: "विद्युत धारा व तार खिंचाव प्रतिरोध",
      questionText: "A uniform cylindrical wire of resistance R is stretched uniformly so that its length increases by 10%. What is the new approximate resistance?",
      hindiQuestionText: "प्रतिरोध R के एक समान बेलनाकार तार को एकसमान रूप से खींचा जाता है जिससे उसकी लंबाई 10% बढ़ जाती है। नया अनुमानित प्रतिरोध क्या होगा?",
      idealSeconds: 40,
      options: [
        { label: "A", text: "1.10 R (+10%)", hindiText: "1.10 R (+10%)" },
        { label: "B", text: "1.21 R (+21%)", hindiText: "1.21 R (+21%)" },
        { label: "C", text: "0.90 R (-10%)", hindiText: "0.90 R (-10%)" },
        { label: "D", text: "1.44 R (+44%)", hindiText: "1.44 R (+44%)" }
      ],
      correctIndex: 1,
      speedTrap: "Students multiply only length L by 1.10 and forget that volume is constant, so area A shrinks by factor of 1.10.",
      hindiSpeedTrap: "छात्र केवल लंबाई L को 1.10 से गुणा करते हैं और भूल जाते हैं कि आयतन स्थिर होने से क्षेत्रफल A भी 1.10 गुना घट जाता है।",
      shortcutTip: "Use percentage shortcut: For small stretch x%, R increases by ~2x% (exact: R' = R(1+x/100)² = 1.1² = 1.21R). Takes 5 seconds!",
      hindiShortcutTip: "सीधा प्रतिशत नियम: R ∝ L² (आयतन स्थिर)। अतः नया प्रतिरोध = 1.10² × R = 1.21 R (+21%)। मात्र 5 सेकंड का काम!",
      explanation: "Volume V = A · L = constant. When L' = 1.10 L, A' = A / 1.10. Therefore R' = ρ L' / A' = ρ (1.10 L) / (A / 1.10) = 1.21 (ρL/A) = 1.21 R.",
      hindiExplanation: "आयतन V = A × L = स्थिर। जब L' = 1.10 L हो, तो A' = A / 1.10। अतः R' = ρ L' / A' = 1.21 R (+21% वृद्धि)।"
    },
    {
      id: "q-phy-2",
      subject: "Physics",
      topic: "Ray Optics & Total Internal Reflection",
      hindiTopic: "किरण प्रकाशिकी व क्रांतिक कोण",
      questionText: "A ray of light enters from glass (μ = 1.5) into water (μ = 4/3). The critical angle θ_c for this interface is:",
      hindiQuestionText: "प्रकाश की एक किरण काँच (μ = 1.5) से जल (μ = 4/3) में प्रवेश करती है। इस अंतरापृष्ठ के लिए क्रांतिक कोण θ_c क्या होगा?",
      idealSeconds: 45,
      options: [
        { label: "A", text: "sin⁻¹(8/9)", hindiText: "sin⁻¹(8/9)" },
        { label: "B", text: "sin⁻¹(9/8)", hindiText: "sin⁻¹(9/8)" },
        { label: "C", text: "sin⁻¹(1/2)", hindiText: "sin⁻¹(1/2)" },
        { label: "D", text: "sin⁻¹(2/3)", hindiText: "sin⁻¹(2/3)" }
      ],
      correctIndex: 0,
      speedTrap: "Dividing glass index by water index (1.5 / 1.33 = 9/8 > 1), which gives an undefined sine value.",
      hindiSpeedTrap: "काँच के अपवर्तनांक को जल के अपवर्तनांक से भाग देना (1.5 / 1.33 = 9/8 > 1), जिससे साइन का मान 1 से बड़ा होकर अमान्य हो जाता है।",
      shortcutTip: "Critical angle is ALWAYS sin θ_c = (μ_rarer / μ_denser). Since sine cannot exceed 1, smaller number goes on top: (4/3) / (3/2) = 8/9.",
      hindiShortcutTip: "गोल्डन नियम: साइन का मान कभी 1 से बड़ा नहीं हो सकता, इसलिए हमेशा छोटा मान ऊपर और बड़ा मान नीचे रखें: (4/3) ÷ (3/2) = 8/9।",
      explanation: "By Snell's Law at critical angle: μ₁ sin θ_c = μ₂ sin 90°. (3/2) sin θ_c = (4/3)(1) ⟹ sin θ_c = (4/3) × (2/3) = 8/9 ⟹ θ_c = sin⁻¹(8/9).",
      hindiExplanation: "स्नेल के नियम से: μ₁ sin θ_c = μ₂ sin 90° ⟹ (3/2) sin θ_c = 4/3 ⟹ sin θ_c = 8/9 ⟹ θ_c = sin⁻¹(8/9)।"
    },
    {
      id: "q-phy-3",
      subject: "Physics",
      topic: "Gravitation & Acceleration due to Gravity",
      hindiTopic: "गुरुत्वाकर्षण व त्रिज्या संकुचन में g का मान",
      questionText: "If the radius of the Earth shrinks by 1% while its mass remains constant, the acceleration due to gravity 'g' on its surface will:",
      hindiQuestionText: "यदि पृथ्वी का द्रव्यमान स्थिर रखते हुए उसकी त्रिज्या में 1% का संकुचन (कमी) हो जाए, तो सतह पर गुरुत्वीय त्वरण 'g' का मान:",
      idealSeconds: 35,
      options: [
        { label: "A", text: "Decrease by 1%", hindiText: "1% घटेगा" },
        { label: "B", text: "Increase by 2%", hindiText: "2% बढ़ेगा" },
        { label: "C", text: "Decrease by 2%", hindiText: "2% घटेगा" },
        { label: "D", text: "Increase by 1%", hindiText: "1% बढ़ेगा" }
      ],
      correctIndex: 1,
      speedTrap: "Writing out full Newton calculations with numerical values G, M, R instead of power differentiation.",
      hindiSpeedTrap: "संख्यात्मक मान G, M, R रखकर लंबा गुणा-भाग करना, जिससे 3-4 मिनट नष्ट हो जाते हैं।",
      shortcutTip: "Formula g = GM / R⁻². Log differentiation: Δg/g = -2(ΔR/R). If R shrinks by -1%, g increases by -2(-1%) = +2%. Done in 4 seconds.",
      hindiShortcutTip: "अवकलन शॉर्टकट: g = GM / R² ⟹ dg/g = -2 (dR/R)। यदि त्रिज्या -1% घटे, तो g में -2 × (-1%) = +2% की वृद्धि होगी। मात्र 4 सेकंड!",
      explanation: "g = GM/R². Differentiating for small fractional changes: dg/g = -2(dR/R). Given dR/R = -1%, dg/g = -2(-1%) = +2% increase.",
      hindiExplanation: "g = GM/R²। भिन्नात्मक परिवर्तन हेतु: dg/g = -2(dR/R)। dR/R = -1% रखने पर dg/g = +2% वृद्धि।"
    }
  ]
};
