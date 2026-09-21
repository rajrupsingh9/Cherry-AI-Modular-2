/**
 * scienceCurriculumData.ts
 * Class 10 Integrated Science curriculum (Physics, Chemistry, and Biology).
 */
import { ChapterCurriculum } from "../curriculumTypes";

export const SCIENCE_CLASS10_CURRICULUM: ChapterCurriculum[] = [
  {
    id: "phy-light-10",
    chapterNumber: 10,
    title: "Light - Reflection & Refraction",
    hindiTitle: "प्रकाश - परावर्तन तथा अपवर्तन",
    subject: "Physics",
    grade: 10,
    boardWeightageMarks: 8,
    tier: "critical",
    subtopics: [
      {
        id: "phy-light-1",
        title: "Spherical Mirrors & Mirror Formula",
        hindiTitle: "गोलीय दर्पण एवं दर्पण सूत्र",
        weightagePercent: 35,
        keyFormula: "\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}, \\quad m = -\\frac{v}{u}",
        difficulty: "medium",
        examType: "3-Mark Ray Diagram & Numerical",
        coreTakeaway: "New Cartesian sign convention: u is always negative; concave mirror focal length is negative.",
        hindiCoreTakeaway: "कार्तीय चिह्न परिपाटी: वस्तु दूरी u सदैव ऋणात्मक तथा अवतल दर्पण का f ऋणात्मक होता है।"
      },
      {
        id: "phy-light-2",
        title: "Refraction through Glass Slab & Snell's Law",
        hindiTitle: "कांच के स्लैब से अपवर्तन व स्नैल का नियम",
        weightagePercent: 30,
        keyFormula: "n = \\frac{\\sin i}{\\sin r} = \\frac{c}{v}",
        difficulty: "easy",
        examType: "2-Mark Concept & Lateral Displacement",
        coreTakeaway: "Light bends toward the normal when entering a denser medium; lateral shift depends on slab thickness.",
        hindiCoreTakeaway: "सघन माध्यम में प्रकाश अभिलंब की ओर झुकता है; पार्श्व विस्थापन स्लैब की मोटाई पर निर्भर करता है।"
      },
      {
        id: "phy-light-3",
        title: "Lens Formula & Power of a Lens",
        hindiTitle: "लेंस सूत्र एवं लेंस की क्षमता",
        weightagePercent: 35,
        keyFormula: "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}, \\quad P = \\frac{1}{f(\\text{m})}",
        difficulty: "hard",
        examType: "5-Mark Derivation & Dioptre Numerical",
        coreTakeaway: "Power is measured in Dioptres (D) with focal length strictly in metres; convex lens power is positive.",
        hindiCoreTakeaway: "क्षमता P = 1/f(मीटर) डायोप्टर में होती है; उत्तल लेंस की क्षमता धनात्मक होती है।"
      }
    ]
  },
  {
    id: "chem-rxn-10",
    chapterNumber: 1,
    title: "Chemical Reactions & Equations",
    hindiTitle: "रासायनिक अभिक्रियाएँ एवं समीकरण",
    subject: "Chemistry",
    grade: 10,
    boardWeightageMarks: 6,
    tier: "high",
    subtopics: [
      {
        id: "chem-rxn-1",
        title: "Balancing Chemical Equations (Hit & Trial)",
        hindiTitle: "रासायनिक समीकरणों को संतुलित करना",
        weightagePercent: 40,
        keyFormula: "3\\text{Fe} + 4\\text{H}_2\\text{O} \\to \\text{Fe}_3\\text{O}_4 + 4\\text{H}_2",
        difficulty: "easy",
        examType: "2-Mark Direct Balancing",
        coreTakeaway: "Law of conservation of mass: number of atoms of each element must remain constant on both sides.",
        hindiCoreTakeaway: "द्रव्यमान संरक्षण नियम: दोनों ओर प्रत्येक तत्व के परमाणुओं की संख्या समान होनी चाहिए।"
      },
      {
        id: "chem-rxn-2",
        title: "Types of Reactions: Combination, Decomposition, Displacement",
        hindiTitle: "अभिक्रियाओं के प्रकार (संयोजन, वियोजन, विस्थापन)",
        weightagePercent: 35,
        difficulty: "medium",
        examType: "3-Mark Identification & Color Change",
        coreTakeaway: "Observe characteristic color shifts (e.g., Fe in CuSO4 turns pale green; heating FeSO4 gives brown Fe2O3).",
        hindiCoreTakeaway: "रंग परिवर्तन याद रखें (CuSO4 में लोहे की कील डालने पर रंग नीला से हल्का हरा हो जाता है)।"
      },
      {
        id: "chem-rxn-3",
        title: "Redox Reactions, Corrosion & Rancidity",
        hindiTitle: "उपचयन-अपचयन (रेडॉक्स), संक्षारण एवं विकृतगंधिता",
        weightagePercent: 25,
        difficulty: "medium",
        examType: "3-Mark Identifying Oxidizing/Reducing Agent",
        coreTakeaway: "Oxidation is gain of oxygen/loss of electrons; reduction is loss of oxygen/gain of electrons.",
        hindiCoreTakeaway: "ऑक्सीजन का जुड़ना उपचयन है, और ऑक्सीजन का हटना या हाइड्रोजन का जुड़ना अपचयन है।"
      }
    ]
  },
  {
    id: "bio-life-10",
    chapterNumber: 6,
    title: "Life Processes & Physiological Systems",
    hindiTitle: "जैव प्रक्रम एवं शारीरिक तंत्र",
    subject: "Biology",
    grade: 10,
    boardWeightageMarks: 9,
    tier: "critical",
    subtopics: [
      {
        id: "bio-life-1",
        title: "Autotrophic Nutrition & Stomatal Regulation",
        hindiTitle: "स्वपोषी पोषण एवं रंध्रों की कार्यप्रणाली",
        weightagePercent: 30,
        keyFormula: "6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\xrightarrow{\\text{Light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 + 6\\text{H}_2\\text{O}",
        difficulty: "easy",
        examType: "3-Mark Diagram & Chlorophyll Experiment",
        coreTakeaway: "Guard cells swell when water flows in, opening the stomatal pore; transpiration generates suction pull.",
        hindiCoreTakeaway: "द्वार कोशिकाओं में जल भरने से रंध्र खुलते हैं; वाष्पोत्सर्जन से जल ऊपर खिंचता है।"
      },
      {
        id: "bio-life-2",
        title: "Human Circulatory System & Double Circulation",
        hindiTitle: "मानव परिसंचरण तंत्र एवं दोहरा परिसंचरण",
        weightagePercent: 40,
        difficulty: "medium",
        examType: "5-Mark Heart Diagram & Pathway Description",
        coreTakeaway: "Blood passes twice through the heart per complete cycle (pulmonary and systemic circulation).",
        hindiCoreTakeaway: "एक पूरे चक्र में रक्त हृदय से दो बार गुजरता है (फुफ्फुसीय व दैहिक परिसंचरण)।"
      },
      {
        id: "bio-life-3",
        title: "Excretion & Nephron Structure",
        hindiTitle: "उत्सर्जन तंत्र एवं वृक्काणु (नेफ्रॉन) की संरचना",
        weightagePercent: 30,
        difficulty: "hard",
        examType: "4-Mark Nephron Working & Ultrafiltration",
        coreTakeaway: "Glomerular filtration separates nitrogenous waste; selective reabsorption recovers glucose, amino acids, and water.",
        hindiCoreTakeaway: "बोमन सम्पुट में निस्यंदन होता है; आवश्यक ग्लूकोज, लवण व जल का पुनरावशोषण होता है।"
      }
    ]
  }
];
