/**
 * biologyPacingData.ts
 * Exam Pacing Profile & Rapid Speed Questions for Biology (Track D).
 * Covers Chargaff's Rule, Dihybrid Test Cross, Hardy-Weinberg Equilibrium,
 * and Codon Degeneracy.
 */
import { ExamPacingProfile } from "../sprintTypes";

export const BIOLOGY_PACING_PROFILE: ExamPacingProfile = {
  id: "pacing-bio-genetics-speed",
  examName: "Biology NEET & Board Rapid Blitz",
  hindiExamName: "कक्षा 12 जीवविज्ञान • आनुवंशिकी व स्पीड रिकॉल",
  subject: "Biology",
  totalExamQuestions: 45,
  totalExamMinutes: 35,
  targetSecondsPerQuestion: 40,
  paceBand: "rapid_mcq",
  description: "Genetics Punnett ratios, Chargaff base-pair calculations, and pedigree analysis solved in 20-30 seconds.",
  hindiDescription: "आनुवंशिकी अनुपात, चारगाफ नियम व पेडिग्री चार्ट के प्रश्नों को 25 सेकंड में सटीक हल करें।",
  questions: [
    {
      id: "q-bio-1",
      subject: "Biology",
      topic: "Molecular Basis of Inheritance & Chargaff Rule",
      hindiTopic: "चारगाफ का नियम व डीएनए क्षार युग्म गणना",
      questionText: "If a double-stranded DNA molecule has 20% Cytosine, what will be the percentage of Adenine in this DNA?",
      hindiQuestionText: "यदि एक द्विरज्जुक डीएनए (dsDNA) अणु में 20% साइटोसिन (C) है, तो इसमें एडेनिन (A) का प्रतिशत क्या होगा?",
      idealSeconds: 25,
      options: [
        { label: "A", text: "20%", hindiText: "20%" },
        { label: "B", text: "30%", hindiText: "30%" },
        { label: "C", text: "40%", hindiText: "40%" },
        { label: "D", text: "60%", hindiText: "60%" }
      ],
      correctIndex: 1,
      speedTrap: "Assuming C + A = 50% without understanding G = C pairs, or dividing 80% by 4.",
      hindiSpeedTrap: "C = A मान लेना या 80% को सीधे 4 से भाग देकर 20% पर गलत निशान लगाना।",
      shortcutTip: "Chargaff Rule: G = C = 20%. So G + C = 40%. Remaining is A + T = 60%. Since A = T, Adenine = 60% / 2 = 30%. Takes 5 seconds.",
      hindiShortcutTip: "चारगाफ नियम: C = G = 20%, अतः C + G = 40%। शेष 60% A और T में बराबर बंटेगा: A = 60% ÷ 2 = 30%। 5 सेकंड में हल!",
      explanation: "By Chargaff's rule, %G = %C = 20%. Therefore %(G + C) = 40%. The remaining %(A + T) = 100% - 40% = 60%. Since %A = %T, %A = 60% / 2 = 30%.",
      hindiExplanation: "चारगाफ के नियमानुसार G = C = 20%। अतः G + C = 40%। शेष A + T = 60%। चूंकि A = T, अतः A = 30%।"
    },
    {
      id: "q-bio-2",
      subject: "Biology",
      topic: "Principles of Inheritance & Dihybrid Test Cross",
      hindiTopic: "द्विसंकर टेस्ट क्रॉस अनुपात व स्वतंत्र अपव्यूहन",
      questionText: "In a test cross of a dihybrid plant (AaBb × aabb), the expected phenotypic ratio of the offspring is:",
      hindiQuestionText: "एक द्विसंकर पौधे के टेस्ट क्रॉस (AaBb × aabb) में संततियों का अपेक्षित लक्षणप्ररूपी अनुपात क्या होगा?",
      idealSeconds: 30,
      options: [
        { label: "A", text: "9 : 3 : 3 : 1", hindiText: "9 : 3 : 3 : 1" },
        { label: "B", text: "1 : 1 : 1 : 1", hindiText: "1 : 1 : 1 : 1" },
        { label: "C", text: "3 : 1", hindiText: "3 : 1" },
        { label: "D", text: "1 : 2 : 1", hindiText: "1 : 2 : 1" }
      ],
      correctIndex: 1,
      speedTrap: "Picking 9:3:3:1 which is the F2 selfing ratio (AaBb × AaBb), not the test cross ratio.",
      hindiSpeedTrap: "स्व-परागण अनुपात (9:3:3:1) को टेस्ट क्रॉस समझकर जल्दबाजी में चुन लेना।",
      shortcutTip: "Test cross with homozygous recessive (aabb) ALWAYS reflects the gamete frequencies directly. Dihybrid produces 4 equal gametes (AB, Ab, aB, ab), so ratio is 1:1:1:1.",
      hindiShortcutTip: "गोल्डन टेस्ट क्रॉस नियम: अप्रभावी जनक से क्रॉस कराने पर अनुपात युग्मक के समान 1:1:1:1 आता है। 3 सेकंड में उत्तर!",
      explanation: "A dihybrid organism (AaBb) produces four types of gametes in equal proportions (1/4 AB, 1/4 Ab, 1/4 aB, 1/4 ab). Crossing with homozygous recessive (aabb) yields a phenotypic ratio of 1:1:1:1.",
      hindiExplanation: "AaBb चार प्रकार के युग्मक 1:1:1:1 में बनाता है। aabb केवल एक प्रकार (ab) देता है। अतः संततियों का अनुपात 1:1:1:1 प्राप्त होता है।"
    },
    {
      id: "q-bio-3",
      subject: "Biology",
      topic: "Evolution & Hardy-Weinberg Principle",
      hindiTopic: "हार्डी-वीनबर्ग साम्यावस्था व अलील आवृत्ति",
      questionText: "In a population at Hardy-Weinberg equilibrium, the frequency of a recessive allele (q) is 0.3. What is the frequency of heterozygous carriers (2pq)?",
      hindiQuestionText: "हार्डी-वीनबर्ग साम्यावस्था वाली समष्टि में अप्रभावी अलील (q) की आवृत्ति 0.3 है। विषमयुग्मजी वाहकों (2pq) की आवृत्ति क्या होगी?",
      idealSeconds: 30,
      options: [
        { label: "A", text: "0.09", hindiText: "0.09" },
        { label: "B", text: "0.49", hindiText: "0.49" },
        { label: "C", text: "0.42", hindiText: "0.42" },
        { label: "D", text: "0.21", hindiText: "0.21" }
      ],
      correctIndex: 2,
      speedTrap: "Calculating only p × q = 0.21 and forgetting the factor of 2 in 2pq.",
      hindiSpeedTrap: "p × q = 0.21 निकाल कर 2 से गुणा करना भूल जाना।",
      shortcutTip: "p = 1 - q = 1 - 0.3 = 0.7. Heterozygote frequency = 2pq = 2 × 0.7 × 0.3 = 2 × 0.21 = 0.42. 4 seconds mental arithmetic.",
      hindiShortcutTip: "p = 1 - 0.3 = 0.7। विषमयुग्मजी = 2pq = 2 × 0.7 × 0.3 = 0.42। मौखिक हल!",
      explanation: "In Hardy-Weinberg equilibrium, p + q = 1. If q = 0.3, then p = 0.7. The heterozygous genotype frequency is 2pq = 2(0.7)(0.3) = 0.42 (42%).",
      hindiExplanation: "p + q = 1 से p = 0.7। विषमयुग्मजी (Aa) की आवृत्ति = 2pq = 2 × 0.7 × 0.3 = 0.42।"
    },
    {
      id: "q-bio-4",
      subject: "Biology",
      topic: "Molecular Genetics & Translation Start/Stop Codons",
      hindiTopic: "आण्विक आनुवंशिकी व प्रारंभन/समापन प्रकूट (Codons)",
      questionText: "Which of the following triplets is NOT a termination (stop) codon in standard mRNA translation?",
      hindiQuestionText: "निम्नलिखित में से कौन सा ट्रिपलेट mRNA अनुवाद में समापन (स्टॉप) प्रकूट नहीं है?",
      idealSeconds: 20,
      options: [
        { label: "A", text: "UAA (Ochre)", hindiText: "UAA" },
        { label: "B", text: "UAG (Amber)", hindiText: "UAG" },
        { label: "C", text: "UGA (Opal)", hindiText: "UGA" },
        { label: "D", text: "AUG", hindiText: "AUG" }
      ],
      correctIndex: 3,
      speedTrap: "Confusing AUG (the universal initiation codon for Methionine) with stop codons.",
      hindiSpeedTrap: "AUG (जो कि मेथियोनीन हेतु प्रारंभक कोडॉन है) और स्टॉप कोडॉन में भ्रमित होना।",
      shortcutTip: "Mnemonic for stop codons: U Go Away (UGA), U Are Away (UAA), U Are Gone (UAG). AUG is the START codon for Methionine. Instantly select AUG.",
      hindiShortcutTip: "याद रखने की ट्रिक: 3 स्टॉप कोडॉन UAA, UAG, UGA हैं। AUG प्रकूट अनुवाद प्रारंभ (Start) करता है और मेथियोनीन को कोड करता है।",
      explanation: "The three nonsense/stop codons that signal termination of polypeptide synthesis are UAA, UAG, and UGA. In contrast, AUG is the initiator codon and codes for Methionine.",
      hindiExplanation: "UAA, UAG और UGA समापन कोडॉन हैं। AUG प्रारंभक कोडॉन है जो मेथियोनीन को कोड करता है।"
    }
  ]
};
