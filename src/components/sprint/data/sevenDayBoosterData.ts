/**
 * sevenDayBoosterData.ts
 * Curated 7-Day Board Exam Score Booster Curriculum (+23 Board Marks in 15 mins/day)
 */
import { SevenDayBoosterDay } from "../sprintTypes";

export const SEVEN_DAY_BOOSTER_PLAN: SevenDayBoosterDay[] = [
  {
    dayNumber: 1,
    title: "Ray Optics & Sign Convention Mastery",
    hindiTitle: "किरण प्रकाशिकी व लेंस परिपाटी में पूर्ण अंक",
    subject: "Physics",
    targetMarks: 3,
    minutesBudget: 15,
    keyTopics: [
      "Thin Lens Formula & Power Addition (P = P₁ + P₂)",
      "Cartesian Sign Convention for Virtual Images",
      "Critical Angle & Total Internal Reflection Shortcuts"
    ],
    hindiKeyTopics: [
      "पतला लेंस सूत्र व क्षमता संयोजन (P = P₁ + P₂)",
      "आभासी व वास्तविक प्रतिबिम्ब हेतु कार्तीय चिह्न परिपाटी",
      "क्रांतिक कोण व पूर्ण आंतरिक परावर्तन का 5-सेकंड नियम"
    ],
    highYieldTrick: "Critical angle is ALWAYS sin θ_c = μ_rarer / μ_denser. Since sin θ ≤ 1, simply put the smaller index on the numerator in 2 seconds.",
    hindiHighYieldTrick: "क्रांतिक कोण सूत्र में हमेशा छोटा अपवर्तनांक ऊपर आता है: sin θ_c = छोटा / बड़ा। 2 सेकंड में उत्तर निश्चित!",
    diagnosticTrap: "Mixing focal length signs: Convex lens f is always positive (+), Concave lens f is always negative (-).",
    hindiDiagnosticTrap: "उत्तल लेंस की फोकस दूरी हमेशा धनात्मक (+) और अवतल लेंस की ऋणात्मक (-) होती है। यहाँ 70% छात्र चिह्न भूलते हैं।",
    drillQuestion: "If a convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 25 cm, what is the power of the combination?",
    classroomPrompt: "Cherry Ma'am, let's practice Day 1 Sprint: Lens combinations and Cartesian sign conventions on the digital blackboard!"
  },
  {
    dayNumber: 2,
    title: "Definite Integrals & King's Property Sprints",
    hindiTitle: "निश्चित समाकलन व किंग प्रॉपर्टी के स्पीड शॉर्टकट",
    subject: "Mathematics",
    targetMarks: 4,
    minutesBudget: 15,
    keyTopics: [
      "King's Property: ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx",
      "Symmetric Bounds: ∫₋ₐᵃ f(x)dx (Odd vs Even Functions)",
      "Direct Result: I = (Upper Bound - Lower Bound) / 2"
    ],
    hindiKeyTopics: [
      "किंग्स प्रॉपर्टी: ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx का अनुप्रयोग",
      "सममित सीमाएं: ∫₋ₐᵃ f(x)dx (विषम फलन = 0)",
      "सीधा परिणाम: I = (उच्च सीमा - निम्न सीमा) / 2"
    ],
    highYieldTrick: "Whenever numerator is f(x) and denominator is f(x) + f(a-x) over [0, a], answer is ALWAYS a/2. No lengthy integration needed!",
    hindiHighYieldTrick: "जब भी अंश f(x) और हर f(x) + f(a-x) सममित हों, तो उत्तर हमेशा (b - a)/2 = a/2 होता है। कलम चलाए बिना हल!",
    diagnosticTrap: "Attempting trigonometric identities or integration by parts on symmetric limits instead of applying King's property directly.",
    hindiDiagnosticTrap: "सममित सीमाओं में लंबे त्रिकोणमितीय सूत्रों को हल करने में 8-10 मिनट व्यर्थ गँवाना।",
    drillQuestion: "Evaluate ∫₀^(π/2) (sin⁴ x / (sin⁴ x + cos⁴ x)) dx in under 20 seconds.",
    classroomPrompt: "Cherry Ma'am, let's master King's Property for Definite Integrals on the chalkboard for Day 2 Sprint!"
  },
  {
    dayNumber: 3,
    title: "Chemical Kinetics & Half-Life Calculation Blitz",
    hindiTitle: "रासायनिक बलगतिकी व अर्ध-आयुकाल की तेज गणना",
    subject: "Chemistry",
    targetMarks: 3,
    minutesBudget: 15,
    keyTopics: [
      "First Order Integrated Rate Law: k = (2.303/t) log(R₀/R)",
      "t₉₉% = 2 × t₉₀% and t₉₀% = 3.32 × t₅₀%",
      "Arrhenius Equation Temperature Coefficient (Ea Shortcuts)"
    ],
    hindiKeyTopics: [
      "प्रथम कोटि समाकलित वेग नियम: k = (2.303/t) log(R₀/R)",
      "अर्ध-आयु संबंध: t₉₉% = 2 × t₉₀% और t₉₀% = 3.32 × t₅₀%",
      "सक्रियण ऊर्जा (Ea) व ताप गुणांक के तेज संख्यात्मक नियम"
    ],
    highYieldTrick: "For first order reactions, every 90% completion takes exactly (2.303/k). 99% completion takes exactly double of 90% (2 × 2.303/k).",
    hindiHighYieldTrick: "प्रथम कोटि में 99% पूर्ण होने का समय 90% का ठीक 2 गुना होता है (t₉₉% = 2 × t₉₀%)। लंबे लॉग टेबल की कोई आवश्यकता नहीं।",
    diagnosticTrap: "Confusing zero order (t₁/₂ ∝ [A]₀) with first order (t₁/₂ is independent of initial concentration [A]₀).",
    hindiDiagnosticTrap: "शून्य कोटि (t₁/₂ ∝ R₀) और प्रथम कोटि (t₁/₂ प्रारंभिक सांद्रता से स्वतंत्र) के सूत्रों में भ्रमित होना।",
    drillQuestion: "A first order reaction takes 40 minutes for 30% decomposition. Calculate its half-life t₁/₂ without extensive log tables.",
    classroomPrompt: "Cherry Ma'am, let's solve first-order kinetics rate law shortcuts together for Day 3 Board Booster!"
  },
  {
    dayNumber: 4,
    title: "Current Electricity & Kirchhoff Loop Network Sprints",
    hindiTitle: "विद्युत धारा व किरचॉफ लूप विश्लेषण में समय की बचत",
    subject: "Physics",
    targetMarks: 3,
    minutesBudget: 15,
    keyTopics: [
      "Kirchhoff's Voltage Law (KVL) Sign Conventions",
      "Stretched Wire Resistance Law: R' = R(1 + x%)² ≈ R(1 + 2x%)",
      "Internal Resistance & Terminal Potential Difference (V = E - Ir)"
    ],
    hindiKeyTopics: [
      "किरचॉफ का वोल्टता नियम (KVL) व विभव पतन (+/- परिपाटी)",
      "तार खींचने पर प्रतिरोध परिवर्तन: R ∝ L² (आयतन स्थिर)",
      "आंतरिक प्रतिरोध व टर्मिनल विभवांतर (V = E - Ir)"
    ],
    highYieldTrick: "When a wire is stretched by x% (small change), resistance increases by ~2x%. If stretched by 10%, R increases by (1.1)² = +21%.",
    hindiHighYieldTrick: "यदि तार को x% खींचा जाए तो प्रतिरोध लगभग 2x% बढ़ता है (10% खिंचाव = 1.1² = +21% प्रतिरोध)।",
    diagnosticTrap: "Forgetting that volume remains constant during stretching, so cross-sectional area decreases proportionately.",
    hindiDiagnosticTrap: "छात्र केवल लंबाई बढ़ाते हैं और भूल जाते हैं कि आयतन स्थिर रहने से अनुप्रस्थ काट का क्षेत्रफल घट जाता है।",
    drillQuestion: "Two cells of EMF 2V and 1V with internal resistances 1Ω and 2Ω are connected in parallel. What is their effective EMF?",
    classroomPrompt: "Cherry Ma'am, please explain the nodal analysis shortcut for Kirchhoff loops on the chalkboard for Day 4 Sprint!"
  },
  {
    dayNumber: 5,
    title: "Matrices, Determinants & Inverse Properties Blitz",
    hindiTitle: "आव्यूह, सारणिक व प्रतिलोम के 10-सेकंड शॉर्टकट",
    subject: "Mathematics",
    targetMarks: 3,
    minutesBudget: 15,
    keyTopics: [
      "|k A| = kⁿ |A| for n × n matrix",
      "|adj(A)| = |A|ⁿ⁻¹ and |A · adj(A)| = |A|ⁿ",
      "A⁻¹ = adj(A) / |A| Existence Condition (|A| ≠ 0)"
    ],
    hindiKeyTopics: [
      "अदिश गुणा सारणिक: |k A| = kⁿ |A| (जहाँ n कोटि है)",
      "सहखंडज सारणिक: |adj(A)| = |A|ⁿ⁻¹ और |adj(adj(A))| = |A|⁽ⁿ⁻¹⁾²",
      "व्युत्क्रम आव्यूह की शर्त व 2×2 आव्यूह का सीधा व्युत्क्रम"
    ],
    highYieldTrick: "For a 3×3 matrix, |2 adj(A)| = 2³ × |adj(A)| = 8 × |A|². If |A| = 3, result is 8 × 9 = 72 in 5 seconds without finding adj(A)!",
    hindiHighYieldTrick: "3×3 आव्यूह में |2 adj(A)| = 2³ × |A|² = 8 × |A|²। बिना सहखंडज निकाले 5 सेकंड में मौखिक हल!",
    diagnosticTrap: "Pulling a scalar k out of a matrix determinant as k instead of kⁿ (where n is the matrix order).",
    hindiDiagnosticTrap: "सारणिक से संख्या k बाहर निकालते समय kⁿ के बजाय केवल k लिखना सबसे आम 1-अंक की गलती है।",
    drillQuestion: "If A is a 3×3 matrix with |A| = -2, find the value of |-3 adj(A)|.",
    classroomPrompt: "Cherry Ma'am, let's practice Day 5 determinant property shortcuts on the digital blackboard!"
  },
  {
    dayNumber: 6,
    title: "Electrochemistry & Nernst Equation Rapid Pacing",
    hindiTitle: "वैद्युतरसायन व नेर्नस्ट समीकरण के सटीक संख्यात्मक",
    subject: "Chemistry",
    targetMarks: 3,
    minutesBudget: 15,
    keyTopics: [
      "Nernst Equation: E_cell = E°_cell - (0.0591/n) log Q",
      "Reaction Quotient Q = [Anode Ions]ᵃ / [Cathode Ions]ᶜ",
      "Gibbs Free Energy & Equilibrium: ΔG° = -n F E°_cell = -2.303 RT log K_c"
    ],
    hindiKeyTopics: [
      "नेर्नस्ट समीकरण: E_cell = E°_cell - (0.0591/n) log Q",
      "अभिक्रिया भागफल Q = [एनोड आयन सांद्रता] / [कैथोड आयन सांद्रता]",
      "गिब्स मुक्त ऊर्जा संबंध: ΔG° = -n F E°_cell"
    ],
    highYieldTrick: "At 298K, (0.0591/n) ≈ 0.06/n. For a 2-electron transfer with Q = 10⁻², the correction is - (0.06/2)(-2) = +0.06 V added to E°!",
    hindiHighYieldTrick: "298K पर (0.0591/n) को 0.06/n मानें। यदि Q = 10⁻² हो तो सीधा +0.06 V जोड़ें। समय व गणना की बचत!",
    diagnosticTrap: "Inverting Q by placing cathode products over anode ions, leading to the opposite sign in EMF calculation.",
    hindiDiagnosticTrap: "Q लिखते समय एनोड और कैथोड के आयनों को उलट देना, जिससे +0.03V के स्थान पर -0.03V घट जाता है।",
    drillQuestion: "Calculate the EMF of Daniell cell Zn|Zn²⁺(0.01M)||Cu²⁺(1.0M)|Cu given E°_cell = 1.10 V at 298 K in 45 seconds.",
    classroomPrompt: "Cherry Ma'am, let's solve Nernst equation concentration cells together for Day 6 Board Booster!"
  },
  {
    dayNumber: 7,
    title: "Full-Length Multi-Subject Grand Sprint & Exam Time Pacing",
    hindiTitle: "संपूर्ण मॉक स्पीड स्प्रिंट व बोर्ड परीक्षा टाइम-मैनेजमेंट",
    subject: "Mathematics",
    targetMarks: 4,
    minutesBudget: 20,
    keyTopics: [
      "Section-by-Section Time Allocation (MCQ: 1 min, 2-Mark: 3 min, 5-Mark: 8 min)",
      "First 15-Minute Reading Period Strategy & Easy-Pick Question Tagging",
      "Last 15-Minute Sanity Check: Calculation Units & Sign Verification"
    ],
    hindiKeyTopics: [
      "खंड-वार समय आबंटन (MCQ: 1 मिनट, 2-अंक: 3 मिनट, 5-अंक: 8 मिनट)",
      "प्रश्नपत्र पढ़ने के पहले 15 मिनट की सही रणनीति व प्राथमिक चयन",
      "अंतिम 15 मिनट: मात्रक (Units), ऋणात्मक चिह्न व गणना री-चेकिंग"
    ],
    highYieldTrick: "Spend the initial 15-min reading time marking questions into Tier 1 (100% known), Tier 2 (needs step thought), and Tier 3 (calculation heavy). Solve Tier 1 first to bank 40 marks in 45 minutes!",
    hindiHighYieldTrick: "शुरुआती 15 मिनट में प्रश्नों को 3 श्रेणियों में बाँटें। सबसे पहले आसान प्रश्न हल करके 45 मिनट में 40 अंक सुरक्षित करें। पैनिक पूरी तरह समाप्त!",
    diagnosticTrap: "Getting stuck on a single 1-mark tricky MCQ for 8 minutes and running out of time on a 5-mark straightforward theorem.",
    hindiDiagnosticTrap: "किसी 1 अंक के कठिन MCQ पर 8 मिनट अड़े रहना और अंत में 5 अंक के आसान डेरिवेशन के लिए समय न बचना।",
    drillQuestion: "Simulate a 5-question multi-topic speed blitz under 4 minutes with zero calculation traps.",
    classroomPrompt: "Cherry Ma'am, let's do the Day 7 Grand Sprint and finalize my 3-hour board exam time-allocation blueprint!"
  }
];
