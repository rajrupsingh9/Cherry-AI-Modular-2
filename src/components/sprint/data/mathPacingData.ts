/**
 * mathPacingData.ts
 * Exam Pacing Profile & Rapid Speed Questions for Mathematics (Track B).
 */
import { ExamPacingProfile } from "../sprintTypes";

export const MATH_PACING_PROFILE: ExamPacingProfile = {
  id: "pacing-math-calculus-speed",
  examName: "Class 12 Board Maths Blitz Sprint",
  hindiExamName: "कक्षा 12 गणित • कैलकुलस व बीजगणित ब्लिट्ज़",
  subject: "Mathematics",
  totalExamQuestions: 38,
  totalExamMinutes: 180,
  targetSecondsPerQuestion: 75,
  paceBand: "balanced_application",
  description: "Calculus limits, matrix determinant properties, and quick vectors where eliminating steps saves 20+ exam minutes.",
  hindiDescription: "कैलकुलस, आव्यूह सारणिक और सदिश बीजगणित में व्यर्थ गणनाएँ हटाकर परीक्षा में 20+ मिनट बचाएं।",
  questions: [
    {
      id: "q-math-1",
      subject: "Mathematics",
      topic: "Matrices & Determinants",
      hindiTopic: "आव्यूह व सहखंडज सारणिक गुणधर्म",
      questionText: "If A is a 3 × 3 non-singular matrix and |A| = 4, then the determinant |2 adj(A)| is equal to:",
      hindiQuestionText: "यदि A एक 3 × 3 व्युत्क्रमणीय आव्यूह है और |A| = 4 है, तो सारणिक |2 adj(A)| का मान किसके बराबर होगा?",
      idealSeconds: 50,
      options: [
        { label: "A", text: "32", hindiText: "32" },
        { label: "B", text: "64", hindiText: "64" },
        { label: "C", text: "128", hindiText: "128" },
        { label: "D", text: "16", hindiText: "16" }
      ],
      correctIndex: 2,
      speedTrap: "Pulling 2 out as 2¹ instead of 2ⁿ = 2³ = 8, or misremembering |adj(A)| = |A|ⁿ⁻¹ = 4² = 16.",
      hindiSpeedTrap: "संख्या 2 को सारणिक से बाहर निकालते समय 2ⁿ = 2³ = 8 की जगह केवल 2 बाहर निकालना।",
      shortcutTip: "Two quick rules: |k M| = kⁿ |M| (here 2³ = 8) and |adj(A)| = |A|ⁿ⁻¹ (here 4² = 16). Result = 8 × 16 = 128. Mental math only.",
      hindiShortcutTip: "दो आसान नियम: |k M| = k³ |M| = 8 |M|, और |adj(A)| = |A|³⁻¹ = 4² = 16। कुल उत्तर = 8 × 16 = 128। केवल मौखिक गणना!",
      explanation: "For an n × n matrix, |k B| = kⁿ |B|. Here n=3, so |2 adj(A)| = 2³ |adj(A)|. Since |adj(A)| = |A|ⁿ⁻¹ = |A|² = 4² = 16, total = 8 × 16 = 128.",
      hindiExplanation: "n × n आव्यूह के लिए |k B| = kⁿ |B|। यहाँ n=3, अतः |2 adj(A)| = 2³ × |adj(A)| = 8 × |A|² = 8 × 16 = 128।"
    },
    {
      id: "q-math-2",
      subject: "Mathematics",
      topic: "Definite Integrals (King's Property)",
      hindiTopic: "निश्चित समाकलन (किंग्स प्रॉपर्टी)",
      questionText: "The value of the definite integral ∫₀^(π/2) (sin³ x / (sin³ x + cos³ x)) dx is:",
      hindiQuestionText: "निश्चित समाकलन ∫₀^(π/2) (sin³ x / (sin³ x + cos³ x)) dx का मान क्या होगा?",
      idealSeconds: 30,
      options: [
        { label: "A", text: "π / 2", hindiText: "π / 2" },
        { label: "B", text: "π / 4", hindiText: "π / 4" },
        { label: "C", text: "1", hindiText: "1" },
        { label: "D", text: "0", hindiText: "0" }
      ],
      correctIndex: 1,
      speedTrap: "Trying to perform trigonometric substitution or integration by parts on sin³ x.",
      hindiSpeedTrap: "sin³ x पर त्रिकोणमितीय प्रतिस्थापन या खंडशः समाकलन (By Parts) करने का प्रयास करना।",
      shortcutTip: "King's symmetry property: Whenever numerator f(x) and denominator f(x)+f(a-x) are symmetric over [a, b], integral is ALWAYS (b - a)/2 = (π/2 - 0)/2 = π/4.",
      hindiShortcutTip: "सममित नियम: जब भी हर में f(x) + f(a-x) हो और सीमाएं 0 से a हों, उत्तर हमेशा a/2 = (π/2) ÷ 2 = π/4 होता है। 5 सेकंड में पूरा!",
      explanation: "Using property ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx: 2I = ∫₀^(π/2) 1 dx = π/2 ⟹ I = π/4.",
      hindiExplanation: "गुणधर्म ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx से: 2I = ∫₀^(π/2) 1 dx = π/2 ⟹ I = π/4।"
    },
    {
      id: "q-math-3",
      subject: "Mathematics",
      topic: "Vector Dot Product & Magnitudes",
      hindiTopic: "सदिश अदिश गुणनफल व परिमाण",
      questionText: "If unit vectors a⃗ and b⃗ satisfy |a⃗ + b⃗| = √3, then the value of (2a⃗ - 5b⃗) · (3a⃗ + b⃗) is:",
      hindiQuestionText: "यदि इकाई सदिश a⃗ व b⃗ के लिए |a⃗ + b⃗| = √3 है, तो (2a⃗ - 5b⃗) · (3a⃗ + b⃗) का मान होगा:",
      idealSeconds: 60,
      options: [
        { label: "A", text: "-11/2", hindiText: "-11/2" },
        { label: "B", text: "-9/2", hindiText: "-9/2" },
        { label: "C", text: "5/2", hindiText: "5/2" },
        { label: "D", text: "-13/2", hindiText: "-13/2" }
      ],
      correctIndex: 0,
      speedTrap: "Trying to find individual angles θ for each vector in space instead of finding a⃗ · b⃗ directly from |a⃗ + b⃗|².",
      hindiSpeedTrap: "सदिशों के बीच का कोण अलग से निकालने की कोशिश करना, बजाय सीधे |a⃗ + b⃗|² का विस्तार करने के।",
      shortcutTip: "Square |a⃗+b⃗|: 1 + 1 + 2(a⃗·b⃗) = 3 ⟹ a⃗·b⃗ = 1/2. Expand target: 6|a⃗|² - 13(a⃗·b⃗) - 5|b⃗|² = 6(1) - 13(0.5) - 5(1) = 1 - 6.5 = -5.5 = -11/2.",
      hindiShortcutTip: "|a⃗ + b⃗|² = 1 + 1 + 2(a⃗·b⃗) = 3 ⟹ a⃗·b⃗ = 1/2। लक्ष्य का विस्तार: 6(1) - 13(1/2) - 5(1) = 1 - 6.5 = -11/2।",
      explanation: "|a⃗ + b⃗|² = |a⃗|² + |b⃗|² + 2(a⃗·b⃗) = 1 + 1 + 2(a⃗·b⃗) = 3 ⟹ a⃗·b⃗ = 1/2. Target: 6|a⃗|² - 13(a⃗·b⃗) - 5|b⃗|² = 6 - 6.5 - 5 = -5.5 = -11/2.",
      hindiExplanation: "|a⃗ + b⃗|² = 1 + 1 + 2(a⃗·b⃗) = 3 ⟹ a⃗·b⃗ = 1/2। विस्तार करने पर: 6(1) - 13(0.5) - 5 = -5.5 = -11/2।"
    }
  ]
};
