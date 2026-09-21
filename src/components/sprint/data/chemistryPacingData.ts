/**
 * chemistryPacingData.ts
 * Exam Pacing Profile & Rapid Speed Questions for Chemistry (Track C - Option C).
 * Covers Chemical Kinetics, Electrochemistry Nernst Equation, Solutions & Van 't Hoff factor,
 * Chemical Thermodynamics, and Coordination Compounds.
 */
import { ExamPacingProfile } from "../sprintTypes";

export const CHEMISTRY_PACING_PROFILE: ExamPacingProfile = {
  id: "pacing-chem-physical-inorganic",
  examName: "Chemistry Speed Calculation & Elimination",
  hindiExamName: "कक्षा 12 रसायन • गति व विकल्प निष्कासन ड्रिल",
  subject: "Chemistry",
  totalExamQuestions: 40,
  totalExamMinutes: 60,
  targetSecondsPerQuestion: 50,
  paceBand: "rapid_mcq",
  description: "Nernst potentials, rate laws, and valence oxidation states designed for lightning-fast elimination.",
  hindiDescription: "नेर्नस्ट विभव, वेग नियम और ऑक्सीकरण अवस्थाओं को बिना लंबे लॉग के तेजी से हल करें।",
  questions: [
    {
      id: "q-chem-1",
      subject: "Chemistry",
      topic: "Chemical Kinetics & Half Life",
      hindiTopic: "रासायनिक बलगतिकी व 90% पूर्ण होने का समय",
      questionText: "A first-order reaction has a rate constant k = 2.303 × 10⁻³ s⁻¹. The time required for 90% completion of the reaction is approximately:",
      hindiQuestionText: "प्रथम कोटि की अभिक्रिया हेतु वेग स्थिरांक k = 2.303 × 10⁻³ s⁻¹ है। अभिक्रिया के 90% पूर्ण होने में लगा समय होगा:",
      idealSeconds: 45,
      options: [
        { label: "A", text: "500 s", hindiText: "500 s" },
        { label: "B", text: "1000 s", hindiText: "1000 s" },
        { label: "C", text: "2303 s", hindiText: "2303 s" },
        { label: "D", text: "300 s", hindiText: "300 s" }
      ],
      correctIndex: 1,
      speedTrap: "Plugging all natural logs into paper calculations without noticing 2.303 cancellation.",
      hindiSpeedTrap: "संख्या 2.303 को 2.303 से काटने के बजाय विस्तृत लॉग तालिका खोजने में समय गँवाना।",
      shortcutTip: "For 90% completion, [R]/[R]₀ = 10/100 = 1/10. t₉₀% = (2.303 / k) log(10) = (2.303 / 2.303×10⁻³) × 1 = 1000 seconds. 6 seconds flat.",
      hindiShortcutTip: "90% पूर्ण होने पर सांद्रता 1/10 बचती है। log(10) = 1। अतः t = (2.303 / 2.303×10⁻³) × 1 = 10³ = 1000 सेकंड। सीधा उत्तर!",
      explanation: "t = (2.303 / k) log (100 / (100 - 90)) = (2.303 / 2.303 × 10⁻³) log(10) = 10³ × 1 = 1000 s.",
      hindiExplanation: "t = (2.303 / k) log(100 / 10) = (2.303 / 2.303 × 10⁻³) × 1 = 1000 सेकंड।"
    },
    {
      id: "q-chem-2",
      subject: "Chemistry",
      topic: "Electrochemistry & Cell EMF",
      hindiTopic: "वैद्युतरसायन व नेर्नस्ट सेल विभव",
      questionText: "For the cell reaction Zn + Cu²⁺(0.1 M) → Zn²⁺(0.01 M) + Cu with E°_cell = 1.10 V at 298 K, the actual cell EMF is:",
      hindiQuestionText: "सेल अभिक्रिया Zn + Cu²⁺(0.1 M) → Zn²⁺(0.01 M) + Cu (E°_cell = 1.10 V) हेतु 298 K पर सेल का वास्तविक EMF क्या होगा?",
      idealSeconds: 50,
      options: [
        { label: "A", text: "1.10 V", hindiText: "1.10 V" },
        { label: "B", text: "1.13 V", hindiText: "1.13 V" },
        { label: "C", text: "1.07 V", hindiText: "1.07 V" },
        { label: "D", text: "0.98 V", hindiText: "0.98 V" }
      ],
      correctIndex: 1,
      speedTrap: "Writing Q = [Cu²⁺]/[Zn²⁺] (inverted ratio) and subtracting 0.03 V instead of adding.",
      hindiSpeedTrap: "Q = [Cu²⁺]/[Zn²⁺] उल्टा लिख देना और 0.03 V जोड़ने के बजाय घटा देना।",
      shortcutTip: "Q = [Zn²⁺]/[Cu²⁺] = 0.01 / 0.1 = 10⁻¹. log Q = -1. Term is - (0.059/2)(-1) = +0.0295 V ≈ +0.03 V. So E = 1.10 + 0.03 = 1.13 V.",
      hindiShortcutTip: "Q = 0.01 / 0.1 = 10⁻¹। log(10⁻¹) = -1। अतः पद - (0.06/2)(-1) = +0.03 V। 1.10 + 0.03 = 1.13 V। मौखिक उत्तर!",
      explanation: "E = E° - (0.0591/n) log ([Zn²⁺]/[Cu²⁺]) = 1.10 - (0.0591/2) log(0.01/0.1) = 1.10 - 0.0295(-1) = 1.10 + 0.0295 ≈ 1.13 V.",
      hindiExplanation: "E = 1.10 - (0.0591/2) log(0.01/0.1) = 1.10 - 0.0295(-1) = 1.10 + 0.03 = 1.13 V।"
    },
    {
      id: "q-chem-3",
      subject: "Chemistry",
      topic: "Solutions & Colligative Properties (Van 't Hoff Factor)",
      hindiTopic: "विलयन व वांट हॉफ गुणांक (i)",
      questionText: "Which of the following 0.1 M aqueous solutions will exhibit the highest boiling point elevation ΔT_b?",
      hindiQuestionText: "निम्नलिखित में से किस 0.1 M जलीय विलयन का क्वथनांक उन्नयन (ΔT_b) सर्वाधिक होगा?",
      idealSeconds: 35,
      options: [
        { label: "A", text: "0.1 M Glucose (C₆H₁₂O₆)", hindiText: "0.1 M ग्लूकोज" },
        { label: "B", text: "0.1 M NaCl", hindiText: "0.1 M NaCl" },
        { label: "C", text: "0.1 M BaCl₂", hindiText: "0.1 M BaCl₂" },
        { label: "D", text: "0.1 M Al₂(SO₄)₃", hindiText: "0.1 M Al₂(SO₄)₃" }
      ],
      correctIndex: 3,
      speedTrap: "Assuming all 0.1 M solutions produce identical colligative effects without checking ionic dissociation.",
      hindiSpeedTrap: "सभी विलयनों की मोलरता समान (0.1 M) देखकर आयनों की संख्या की उपेक्षा करना।",
      shortcutTip: "ΔT_b ∝ i · m. Compare Van 't Hoff factor 'i': Glucose (i=1), NaCl (i=2), BaCl₂ (i=3), Al₂(SO₄)₃ (i=2+3=5). Maximum i = 5 gives highest elevation in 3 seconds!",
      hindiShortcutTip: "सीधा नियम: ΔT_b ∝ i। आयनों की संख्या: ग्लूकोज (1), NaCl (2), BaCl₂ (3), Al₂(SO₄)₃ (2 Al³⁺ + 3 SO₄²⁻ = 5 आयन)। सर्वाधिक i = 5, उत्तर D!",
      explanation: "Elevation in boiling point is a colligative property: ΔT_b = i · K_b · m. For complete dissociation: Glucose i=1, NaCl i=2, BaCl₂ i=3, Al₂(SO₄)₃ produces 2 Al³⁺ + 3 SO₄²⁻ (i=5). Highest i produces highest ΔT_b.",
      hindiExplanation: "क्वथनांक उन्नयन एक अणुसंख्य गुणधर्म है: ΔT_b = i · K_b · m। Al₂(SO₄)₃ में कुल 5 आयन (i = 5) बनते हैं, अतः इसका ΔT_b सर्वाधिक होगा।"
    },
    {
      id: "q-chem-4",
      subject: "Chemistry",
      topic: "Chemical Thermodynamics & Spontaneity",
      hindiTopic: "ऊष्मागतिकी व गिब्स ऊर्जा से स्वतःप्रवर्तिता",
      questionText: "For an endothermic reaction with ΔH = +60 kJ/mol and ΔS = +150 J/(K·mol), the reaction becomes spontaneous above what temperature?",
      hindiQuestionText: "एक ऊष्माशोषी अभिक्रिया हेतु ΔH = +60 kJ/mol तथा ΔS = +150 J/(K·mol) है। यह अभिक्रिया किस ताप से ऊपर स्वतःप्रवर्तित होगी?",
      idealSeconds: 40,
      options: [
        { label: "A", text: "250 K", hindiText: "250 K" },
        { label: "B", text: "400 K", hindiText: "400 K" },
        { label: "C", text: "600 K", hindiText: "600 K" },
        { label: "D", text: "900 K", hindiText: "900 K" }
      ],
      correctIndex: 1,
      speedTrap: "Mixing kJ and J units (dividing 60 by 150 = 0.4 K instead of converting 60 kJ to 60,000 J).",
      hindiSpeedTrap: "किलो-जूल (kJ) को जूल (J) में बदले बिना 60 ÷ 150 = 0.4 K निकाल देना।",
      shortcutTip: "Spontaneous when ΔG = ΔH - TΔS < 0 ⟹ T > ΔH / ΔS. Mental math: 60,000 / 150 = 6000 / 15 = 400 K. Done in 5 seconds!",
      hindiShortcutTip: "संतुलन ताप T = ΔH / ΔS = 60,000 J ÷ 150 J/K = 400 K। अतः 400 K से अधिक ताप पर अभिक्रिया स्वतः होगी।",
      explanation: "At equilibrium ΔG = 0 ⟹ T_eq = ΔH / ΔS = (60 × 10³ J/mol) / (150 J/(K·mol)) = 400 K. Since ΔH > 0 and ΔS > 0, reaction becomes spontaneous (ΔG < 0) when T > 400 K.",
      hindiExplanation: "स्वतःप्रवर्तिता हेतु ΔG < 0 होना चाहिए। T = ΔH / ΔS = 60,000 / 150 = 400 K। 400 K से उच्च ताप पर ΔG ऋणात्मक होगा।"
    },
    {
      id: "q-chem-5",
      subject: "Chemistry",
      topic: "Coordination Compounds & Spin Magnetic Moment",
      hindiTopic: "उपसहसंयोजन यौगिक व अयुग्मित इलेक्ट्रॉन",
      questionText: "The spin-only magnetic moment of [Fe(H₂O)₆]²⁺ (Fe atomic number = 26) is approximately:",
      hindiQuestionText: "[Fe(H₂O)₆]²⁺ (Fe परमाणु क्रमांक = 26) का केवल चक्रण चुंबकीय आघूर्ण (Spin-only magnetic moment) क्या होगा?",
      idealSeconds: 45,
      options: [
        { label: "A", text: "1.73 BM", hindiText: "1.73 BM" },
        { label: "B", text: "2.84 BM", hindiText: "2.84 BM" },
        { label: "C", text: "4.90 BM", hindiText: "4.90 BM" },
        { label: "D", text: "5.92 BM", hindiText: "5.92 BM" }
      ],
      correctIndex: 2,
      speedTrap: "Treating H₂O as a strong field ligand and forcing pairing of d-electrons to give n = 0.",
      hindiSpeedTrap: "H₂O को प्रबल क्षेत्र लिगैंड मानकर इलेक्ट्रॉनों का युग्मन कर देना और चुंबकीय आघूर्ण शून्य मान लेना।",
      shortcutTip: "H₂O is weak field (spectrochemical series). Fe²⁺ is 3d⁶ with 4 unpaired electrons (n=4). Quick mnemonic: For n unpaired electrons, μ ≈ n.89 BM. For n=4, answer is ~4.9 BM. Zero calculations!",
      hindiShortcutTip: "गोल्डन शॉर्टकट: n अयुग्मित इलेक्ट्रॉन होने पर चुंबकीय आघूर्ण हमेशा n.8 से n.9 BM होता है। Fe²⁺ (3d⁶) में n=4 अयुग्मित इलेक्ट्रॉन ⟹ μ ≈ 4.90 BM। सीधा टिक करें!",
      explanation: "Fe (Z=26) is [Ar] 3d⁶ 4s². Fe²⁺ is 3d⁶. H₂O is a weak-field ligand, so pairing does not occur: t₂g⁴ eg² has n = 4 unpaired electrons. μ = √(n(n+2)) = √(4 × 6) = √24 ≈ 4.90 BM.",
      hindiExplanation: "Fe²⁺ का विन्यास 3d⁶ है। H₂O दुर्बल लिगैंड है, अतः 4 अयुग्मित इलेक्ट्रॉन (n=4) रहेंगे। μ = √(4 × 6) = √24 ≈ 4.90 BM।"
    }
  ]
};
