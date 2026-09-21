/**
 * seniorScienceCurriculumData.ts
 * Senior Secondary (Classes 11 & 12) Physics, Chemistry, and Biology curriculum datasets.
 */
import { ChapterCurriculum } from "../curriculumTypes";

export const SENIOR_SCIENCE_CURRICULUM: ChapterCurriculum[] = [
  // Physics Class 12
  {
    id: "phy-optics",
    chapterNumber: 9,
    title: "Ray Optics & Optical Instruments",
    hindiTitle: "किरण प्रकाशिकी एवं प्रकाशिक यंत्र",
    subject: "Physics",
    grade: 12,
    boardWeightageMarks: 9,
    tier: "critical",
    subtopics: [
      {
        id: "phy-optics-1",
        title: "Snell's Law & Total Internal Reflection (TIR)",
        hindiTitle: "स्नैल का नियम एवं पूर्ण आंतरिक परावर्तन",
        weightagePercent: 35,
        keyFormula: "\\sin \\theta_c = \\frac{n_{\\text{rarer}}}{n_{\\text{denser}}}",
        difficulty: "easy",
        examType: "2-Mark Theory & Prism Application",
        coreTakeaway: "TIR occurs when light travels from denser to rarer medium with angle > critical angle.",
        hindiCoreTakeaway: "पूर्ण आंतरिक परावर्तन तब होता है जब प्रकाश सघन से विरल माध्यम में क्रांतिक कोण से अधिक कोण पर जाता है।"
      },
      {
        id: "phy-optics-2",
        title: "Lens Maker's Formula & Thin Lens Combinations",
        hindiTitle: "लेंस मेकर सूत्र एवं पतले लेंस संयोजन",
        weightagePercent: 40,
        keyFormula: "\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)",
        difficulty: "hard",
        examType: "5-Mark Derivation with Sign Convention",
        coreTakeaway: "Cartesian sign convention (+/-) on curvature radii determines focal length sign.",
        hindiCoreTakeaway: "वक्रता त्रिज्याओं (R1, R2) पर कार्तीय चिह्न परिपाटी से फोकस दूरी का सही चिह्न तय होता है।"
      },
      {
        id: "phy-optics-3",
        title: "Compound Microscope & Astronomical Telescope Magnification",
        hindiTitle: "संयुक्त सूक्ष्मदर्शी एवं खगोलीय दूरदर्शी आवर्धन",
        weightagePercent: 25,
        keyFormula: "m = -\\frac{L}{f_o} \\cdot \\frac{D}{f_e}",
        difficulty: "medium",
        examType: "3-Mark Ray Diagram & Numerical",
        coreTakeaway: "Ray diagrams with labeled focal points and virtual/real image orientation.",
        hindiCoreTakeaway: "किरण आरेख में फ़ोकस बिंदुओं और वास्तविक/आभासी प्रतिबिंब की दिशा का स्पष्ट अंकन करें।"
      }
    ]
  },
  {
    id: "phy-elec",
    chapterNumber: 3,
    title: "Current Electricity & Circuit Networks",
    hindiTitle: "विद्युत धारा एवं परिपथ नेटवर्क",
    subject: "Physics",
    grade: 12,
    boardWeightageMarks: 8,
    tier: "high",
    subtopics: [
      {
        id: "phy-elec-1",
        title: "Drift Velocity, Current Density & Ohm's Microscopic Law",
        hindiTitle: "अपवाह वेग, धारा घनत्व एवं सूक्ष्म ओम नियम",
        weightagePercent: 30,
        keyFormula: "I = n e A v_d, \\quad v_d = \\frac{e E \\tau}{m}",
        difficulty: "medium",
        examType: "3-Mark Derivation",
        coreTakeaway: "Direct proportionality between relaxation time τ and temperature conductivity.",
        hindiCoreTakeaway: "विश्रांति काल τ तापमान बढ़ने पर घटता है, जिससे चालकों का प्रतिरोध बढ़ता है।"
      },
      {
        id: "phy-elec-2",
        title: "Kirchhoff's Laws (KCL & KVL) & Mesh Analysis",
        hindiTitle: "किरचॉफ के नियम (KCL एवं KVL) व लूप विश्लेषण",
        weightagePercent: 45,
        keyFormula: "\\sum I = 0 \\quad (\\text{Charge}), \\quad \\sum \\Delta V = 0 \\quad (\\text{Energy})",
        difficulty: "hard",
        examType: "5-Mark Complex Loop Numerical",
        coreTakeaway: "Loop direction conventions determine battery EMF and resistor IR potential drops.",
        hindiCoreTakeaway: "KCL आवेश संरक्षण पर आधारित है तथा KVL ऊर्जा संरक्षण पर; लूप दिशा चिह्नों का ध्यान रखें।"
      },
      {
        id: "phy-elec-3",
        title: "Balanced Wheatstone Bridge & Potentiometer Sensitivity",
        hindiTitle: "संतुलित व्हीटस्टोन सेतु एवं विभवमापी सुग्राहिता",
        weightagePercent: 25,
        keyFormula: "\\frac{P}{Q} = \\frac{R}{S} \\implies I_{\\text{galv}} = 0",
        difficulty: "easy",
        examType: "3-Mark Null-Point Calculation",
        coreTakeaway: "Null-point bridge nullifies internal meter resistance for exact potential measurement.",
        hindiCoreTakeaway: "शून्य-विक्षेप स्थिति में गैल्वेनोमीटर में कोई धारा नहीं बहती, जिससे सटीक मापन होता है।"
      }
    ]
  },

  // Chemistry Class 11
  {
    id: "chem-bond",
    chapterNumber: 4,
    title: "Chemical Bonding & Molecular Orbital Theory",
    hindiTitle: "रासायनिक आबंधन एवं आण्विक कक्षक सिद्धांत",
    subject: "Chemistry",
    grade: 11,
    boardWeightageMarks: 7,
    tier: "high",
    subtopics: [
      {
        id: "chem-bond-1",
        title: "VSEPR Theory & Hybridization (sp, sp², sp³, dsp³)",
        hindiTitle: "VSEPR सिद्धांत एवं संकरण (sp, sp², sp³, dsp³)",
        weightagePercent: 40,
        difficulty: "medium",
        examType: "3-Mark Molecular Geometry",
        coreTakeaway: "Lone pair - lone pair repulsions compress ideal bond angles (e.g. NH3 107°, H2O 104.5°).",
        hindiCoreTakeaway: "एकाकी युग्म-एकाकी युग्म प्रतिकर्षण आदर्श बंध कोण को संकुचित करता है (NH3 107°, H2O 104.5°)।"
      },
      {
        id: "chem-bond-2",
        title: "Molecular Orbital Theory (MOT) & Magnetic Properties",
        hindiTitle: "आण्विक कक्षक सिद्धांत (MOT) एवं चुंबकीय प्रकृति",
        weightagePercent: 40,
        keyFormula: "\\text{Bond Order} = \\frac{N_b - N_a}{2}",
        difficulty: "hard",
        examType: "4-Mark Energy Diagram & Paramagnetism",
        coreTakeaway: "Unpaired electrons in degenerate antibonding π* orbitals explain O2 paramagnetism.",
        hindiCoreTakeaway: "अयुग्मित इलेक्ट्रॉनों की उपस्थिति के कारण O2 अणु अनुचुंबकीय (paramagnetic) होता है।"
      },
      {
        id: "chem-bond-3",
        title: "Intermolecular Forces & Hydrogen Bonding Effects",
        hindiTitle: "अंतराआण्विक बल एवं हाइड्रोजन आबंधन के प्रभाव",
        weightagePercent: 20,
        difficulty: "easy",
        examType: "2-Mark Boiling Point Reasoning",
        coreTakeaway: "Intramolecular vs intermolecular H-bonding directly controls volatility and solubility.",
        hindiCoreTakeaway: "अंतरा-आण्विक हाइड्रोजन बंध क्वथनांक व विलेयता को उल्लेखनीय रूप से बढ़ा देता है।"
      }
    ]
  },
  {
    id: "chem-thermo",
    chapterNumber: 6,
    title: "Chemical Thermodynamics & Gibbs Free Energy",
    hindiTitle: "रासायनिक ऊष्मागतिकी एवं गिब्स मुक्त ऊर्जा",
    subject: "Chemistry",
    grade: 11,
    boardWeightageMarks: 8,
    tier: "critical",
    subtopics: [
      {
        id: "chem-thermo-1",
        title: "First Law of Thermodynamics & Enthalpy of Reaction",
        hindiTitle: "ऊष्मागतिकी का प्रथम नियम एवं अभिक्रिया एन्थैल्पी",
        weightagePercent: 30,
        keyFormula: "\\Delta U = q + w, \\quad \\Delta H = \\Delta U + \\Delta n_g R T",
        difficulty: "medium",
        examType: "3-Mark State Function Numerical",
        coreTakeaway: "Work w = -P_ext ΔV in reversible/irreversible gas expansions.",
        hindiCoreTakeaway: "गैस के प्रसार में कार्य w = -P_ext ΔV होता है; एन्थैल्पी एक अवस्था फलन है।"
      },
      {
        id: "chem-thermo-2",
        title: "Hess's Law of Constant Heat Summation",
        hindiTitle: "हेस का स्थिर ऊष्मा संकलन का नियम",
        weightagePercent: 30,
        keyFormula: "\\Delta H_r^\\circ = \\sum \\Delta H_f^\\circ(\\text{Products}) - \\sum \\Delta H_f^\\circ(\\text{Reactants})",
        difficulty: "easy",
        examType: "3-Mark Thermochemical Addition",
        coreTakeaway: "Total enthalpy change is path-independent; flip signs when reversing equations.",
        hindiCoreTakeaway: "अभिक्रिया की कुल एन्थैल्पी पथ पर निर्भर नहीं करती; समीकरण उलटने पर चिह्न पलट दें।"
      },
      {
        id: "chem-thermo-3",
        title: "Second Law, Entropy (ΔS) & Gibbs Spontaneity Criterion",
        hindiTitle: "द्वितीय नियम, एन्ट्रॉपी (ΔS) व स्वतःप्रवर्तिता कसौटी",
        weightagePercent: 40,
        keyFormula: "\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ < 0",
        difficulty: "hard",
        examType: "4-Mark Feasibility Prediction",
        coreTakeaway: "Negative ΔG dictates strictly spontaneous reactions; at equilibrium ΔG = 0.",
        hindiCoreTakeaway: "स्वतःप्रवर्तित अभिक्रिया के लिए ΔG ऋणात्मक होना अनिवार्य है; साम्यावस्था पर ΔG = 0 होता है।"
      }
    ]
  },

  // Biology Class 12
  {
    id: "bio-gen",
    chapterNumber: 5,
    title: "Principles of Inheritance & Genetics",
    hindiTitle: "वंशागति तथा विविधता के सिद्धांत",
    subject: "Biology",
    grade: 12,
    boardWeightageMarks: 10,
    tier: "critical",
    subtopics: [
      {
        id: "bio-gen-1",
        title: "Mendelian Monohybrid & Dihybrid Crosses (3:1, 9:3:3:1)",
        hindiTitle: "मेंडेल के एकसंकर एवं द्विसंकर संकरण (3:1, 9:3:3:1)",
        weightagePercent: 35,
        difficulty: "easy",
        examType: "3-Mark Punnett Square Cross",
        coreTakeaway: "Law of Segregation and Independent Assortment govern unlinked allele distribution.",
        hindiCoreTakeaway: "पृथक्करण का नियम एवं स्वतंत्र अपव्यूहन का नियम एलील्स के वितरण को नियंत्रित करते हैं।"
      },
      {
        id: "bio-gen-2",
        title: "Chromosomal Linkage & Morgan's Drosophila Experiments",
        hindiTitle: "सहलग्नता एवं मॉर्गन के ड्रोसोफिला प्रयोग",
        weightagePercent: 40,
        keyFormula: "\\text{Recombination Freq (cM)} = \\frac{\\text{Recombinants}}{\\text{Total}} \\times 100",
        difficulty: "hard",
        examType: "5-Mark Genetic Mapping Problem",
        coreTakeaway: "Tight linkage reduces recombination frequency, violating independent assortment.",
        hindiCoreTakeaway: "सघन सहलग्नता पुनर्संयोजन आवृत्ति को कम करती है, जो स्वतंत्र अपव्यूहन का अपवाद है।"
      },
      {
        id: "bio-gen-3",
        title: "Sex Determination, Pedigree Analysis & Mendelian Disorders",
        hindiTitle: "लिंग निर्धारण, वंशावली विश्लेषण एवं मेंडेलीय विकार",
        weightagePercent: 25,
        difficulty: "medium",
        examType: "4-Mark Pedigree Chart Interpretation",
        coreTakeaway: "Tracing Autosomal vs X-linked recessive patterns (Hemophilia, Sickle Cell Anemia).",
        hindiCoreTakeaway: "अलिंगसूत्री बनाम X-सहलग्न अप्रभावी विकारों (हीमोफीलिया, सिकल सेल एनीमिया) का वंशावली चार्ट।"
      }
    ]
  }
];
