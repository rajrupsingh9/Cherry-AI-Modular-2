/**
 * chemistryPrereqData.ts
 * Chemistry Prerequisite Dependency Chains (Thermodynamics Gibbs Energy & Electrochemistry Nernst Equation).
 */
import { ConceptDependencyChain } from "../prerequisiteTypes";

export const CHEMISTRY_PREREQUISITE_CHAINS: ConceptDependencyChain[] = [
  // Chemistry 1: Chemical Thermodynamics & Gibbs
  {
    id: "chain-chem-thermo-gibbs",
    targetConcept: "Gibbs Free Energy (ΔG) & Reaction Spontaneity",
    hindiTargetConcept: "गिब्स मुक्त ऊर्जा (ΔG) व अभिक्रिया की स्वतःप्रवर्तिता",
    subject: "Chemistry",
    grade: 11,
    chapterName: "Thermodynamics",
    hindiChapterName: "ऊष्मागतिकी",
    importance: "critical",
    boardMarksAtRisk: 6,
    summaryDiagnosis: "Confusion over spontaneity occurs when students treat Enthalpy (ΔH) alone as the criterion, ignoring Entropy (TΔS) temperature dependence.",
    hindiSummaryDiagnosis: "स्वतःप्रवर्तिता में भ्रम तब होता है जब छात्र केवल एन्थैल्पी (ΔH) को आधार मानते हैं और एन्ट्रॉपी (TΔS) व तापमान के प्रभाव को नजरअंदाज करते हैं।",
    nodes: [
      {
        id: "node-t1",
        title: "First Law, Enthalpy (ΔH) & Exothermic vs Endothermic",
        hindiTitle: "प्रथम नियम, एन्थैल्पी (ΔH) व ऊष्माक्षेपी/ऊष्माशोषी अभिक्रियाएं",
        gradeLevel: 11,
        type: "root_foundation",
        subject: "Chemistry",
        description: "Heat exchanged at constant pressure. Negative ΔH indicates exothermic heat release.",
        hindiDescription: "स्थिर दाब पर ऊष्मा परिवर्तन। ऋणात्मक ΔH ऊष्माक्षेपी प्रक्रम दर्शाता है।",
        keyFormula: "\\Delta H = \\Delta U + P\\Delta V",
        commonTrap: "Assuming all exothermic reactions are automatically spontaneous at all temperatures.",
        hindiCommonTrap: "यह मान लेना कि सभी ऊष्माक्षेपी अभिक्रियाएं प्रत्येक तापमान पर स्वतःप्रवर्तित होती हैं।"
      },
      {
        id: "node-t2",
        title: "Entropy (ΔS) & Statistical Disorder",
        hindiTitle: "एन्ट्रॉपी (ΔS) व आण्विक अव्यवस्था का माप",
        gradeLevel: 11,
        type: "bridge_concept",
        subject: "Chemistry",
        description: "Degree of randomness. Gas phase transitions (s → l → g) drastically increase entropy.",
        hindiDescription: "अव्यवस्था की माप। ठोस से द्रव व गैस में रूपांतरण पर एन्ट्रॉपी तेजी से बढ़ती है।",
        keyFormula: "\\Delta S = \\frac{q_{\\text{rev}}}{T}",
        commonTrap: "Forgetting to convert units of ΔS (J/K·mol) to match ΔH (kJ/mol) by dividing by 1000.",
        hindiCommonTrap: "ΔS (J/K·mol) को kJ/mol में बदलने के लिए 1000 से भाग देना भूल जाना।"
      },
      {
        id: "node-t3",
        title: "Gibbs-Helmholtz Equation & Equilibrium T_eq",
        hindiTitle: "गिब्स-हेल्महोल्ट्ज़ समीकरण व साम्यावस्था तापमान T_eq",
        gradeLevel: 11,
        type: "target_mastery",
        subject: "Chemistry",
        description: "Combining driving forces to evaluate spontaneity condition ΔG < 0.",
        hindiDescription: "स्वतःप्रवर्तिता की शर्त ΔG < 0 ज्ञात करने हेतु दोनों चालकों को संयोजित करना।",
        keyFormula: "\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ, \\quad T_{\\text{eq}} = \\frac{\\Delta H^\\circ}{\\Delta S^\\circ}",
        commonTrap: "Failing to recognize temperature ranges where ΔH > 0 and ΔS > 0 becomes spontaneous only at high T.",
        hindiCommonTrap: "यह न पहचान पाना कि जब ΔH > 0 व ΔS > 0 हों, तो अभिक्रिया केवल उच्च तापमान पर स्वतःप्रवर्तित होती है।"
      }
    ]
  },

  // Chemistry 2: Electrochemistry Nernst Equation
  {
    id: "chain-chem-nernst",
    targetConcept: "Nernst Equation & Cell Potential Under Non-Standard Conditions",
    hindiTargetConcept: "नेर्नस्ट समीकरण व गैर-मानक परिस्थितियों में सेल विभव",
    subject: "Chemistry",
    grade: 12,
    chapterName: "Electrochemistry",
    hindiChapterName: "वैद्युतरसायन",
    importance: "critical",
    boardMarksAtRisk: 5,
    summaryDiagnosis: "Errors in Nernst equation calculations stem from incorrectly identifying number of electrons transferred (n) or flipping the reaction quotient Q.",
    hindiSummaryDiagnosis: "नेर्नस्ट समीकरण में गलतियाँ स्थानांतरित इलेक्ट्रॉनों की संख्या (n) की गलत पहचान या अभिक्रिया भागफल Q [उत्पाद]/[अभिकारक] को उलटने से होती हैं।",
    nodes: [
      {
        id: "node-ne1",
        title: "Redox Oxidation States & Electron Balancing",
        hindiTitle: "रेडॉक्स अभिक्रियाएं व इलेक्ट्रॉन संतुलन (n)",
        gradeLevel: 11,
        type: "root_foundation",
        subject: "Chemistry",
        description: "Splitting into oxidation and reduction half-cells to determine transferred electrons n.",
        hindiDescription: "ऑक्सीकरण और अपचयन अर्ध-सेल में विभाजित करके कुल स्थानांतरित इलेक्ट्रॉनों (n) का निर्धारण।",
        keyFormula: "\\text{Net Redox}: \\text{Zn} + \\text{Cu}^{2+} \\rightarrow \\text{Zn}^{2+} + \\text{Cu} \\quad (n=2)",
        commonTrap: "Confusing stoichiometric coefficients with transferred electrons n in unequal half-reactions.",
        hindiCommonTrap: "असमान अर्ध-अभिक्रियाओं में रससमीकरणमितीय गुणांक और स्थानांतरित इलेक्ट्रॉन n में उलझ जाना।"
      },
      {
        id: "node-ne2",
        title: "Standard Electrode Potential & Electrochemical Series",
        hindiTitle: "मानक इलेक्ट्रोड विभव E°cell व विद्युत रासायनिक श्रेणी",
        gradeLevel: 12,
        type: "bridge_concept",
        subject: "Chemistry",
        description: "Calculating standard EMF: E°cell = E°cathode - E°anode using standard reduction potentials.",
        hindiDescription: "मानक अपचयन विभवों का उपयोग कर E°cell = E°कैथोड - E°एनोड की गणना।",
        keyFormula: "E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}",
        commonTrap: "Adding signs twice when standard reduction potential of anode is already negative.",
        hindiCommonTrap: "जब एनोड का मानक अपचयन विभव पहले से ऋणात्मक हो, तो माइनस (-) चिह्न दोबारा जोड़ देना।"
      },
      {
        id: "node-ne3",
        title: "Non-Standard Nernst EMF & Reaction Quotient Q",
        hindiTitle: "नेर्नस्ट समीकरण व अभिक्रिया भागफल Q का अनुप्रयोग",
        gradeLevel: 12,
        type: "target_mastery",
        subject: "Chemistry",
        description: "Accounting for ion concentrations at 298 K using log10 [Products]/[Reactants].",
        hindiDescription: "298 K पर आयन सांद्रताओं के प्रभाव की गणना: log10 [उत्पाद]/[अभिकारक]।",
        keyFormula: "E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10} Q",
        commonTrap: "Including solid metal electrodes in the reaction quotient Q calculation.",
        hindiCommonTrap: "अभिक्रिया भागफल Q की गणना में ठोस धातु इलेक्ट्रोड [Pure Solids = 1] की सांद्रता शामिल करना।"
      }
    ]
  }
];
