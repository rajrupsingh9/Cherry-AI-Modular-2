/**
 * physicsPrereqData.ts
 * Physics Prerequisite Dependency Chains (Lens Maker Formula & Kirchhoff Network Laws).
 */
import { ConceptDependencyChain } from "../prerequisiteTypes";

export const PHYSICS_PREREQUISITE_CHAINS: ConceptDependencyChain[] = [
  // Physics 1: Ray Optics Lens Maker
  {
    id: "chain-phy-lens-maker",
    targetConcept: "Lens Maker's Formula & Curved Refracting Surfaces",
    hindiTargetConcept: "लेंस मेकर सूत्र व वक्र अपवर्तक पृष्ठ (Lens Maker's Formula)",
    subject: "Physics",
    grade: 12,
    chapterName: "Ray Optics",
    hindiChapterName: "किरण प्रकाशिकी एवं प्रकाशिक यंत्र",
    importance: "critical",
    boardMarksAtRisk: 5,
    summaryDiagnosis: "Struggling with lens maker derivations is 90% due to shaky Cartesian sign conventions learned in Grade 10 reflection/refraction.",
    hindiSummaryDiagnosis: "लेंस मेकर सूत्र के डेरिवेशन में कठिनाई का 90% कारण कक्षा 10 में सीखी गई कार्तीय चिह्न परिपाटी (Cartesian Sign Convention) की कमजोरी है।",
    nodes: [
      {
        id: "node-o1",
        title: "Cartesian Sign Convention & Pole Origin",
        hindiTitle: "कार्तीय निर्देशांक चिह्न परिपाटी व प्रकाशिक केंद्र",
        gradeLevel: 10,
        type: "root_foundation",
        subject: "Physics",
        description: "All distances measured from optical centre; along incident ray = (+), opposite = (-).",
        hindiDescription: "सभी दूरियाँ प्रकाशिक केंद्र से मापी जाती हैं; आपतित किरण की दिशा में (+), विपरीत दिशा में (-)।",
        keyFormula: "u < 0 \\quad (\\text{Real Object in front of lens})",
        commonTrap: "Assuming focal length is always positive regardless of convex or concave lens shape.",
        hindiCommonTrap: "उत्तल या अवतल लेंस की परवाह किए बिना फोकस दूरी को हमेशा धनात्मक मान लेना।"
      },
      {
        id: "node-o2",
        title: "Refraction at Single Spherical Surface",
        hindiTitle: "एकल गोलीय पृष्ठ पर प्रकाश का अपवर्तन",
        gradeLevel: 12,
        type: "bridge_concept",
        subject: "Physics",
        description: "Deriving the fundamental interface equation connecting object distance u, image distance v, and radius R.",
        hindiDescription: "वस्तु दूरी u, प्रतिबिम्ब दूरी v और वक्रता त्रिज्या R को जोड़ने वाले मूल सूत्र का निगमन।",
        keyFormula: "\\frac{n_2}{v} - \\frac{n_1}{u} = \\frac{n_2 - n_1}{R}",
        commonTrap: "Swapping medium refractive indices n₁ and n₂ when light enters glass from air vs exiting back to air.",
        hindiCommonTrap: "प्रकाश के वायु से काँच या काँच से वायु में जाने पर माध्यमों के अपवर्तनांक n₁ व n₂ को आपस में बदल देना।"
      },
      {
        id: "node-o3",
        title: "Double Curved Lens Maker Synthesis",
        hindiTitle: "द्वि-उत्तल पतले लेंस हेतु लेंस मेकर सूत्र का संश्लेषण",
        gradeLevel: 12,
        type: "target_mastery",
        subject: "Physics",
        description: "Adding two surface equations to obtain the universal thin lens fabrication formula.",
        hindiDescription: "दोनों गोलीय पृष्ठों के अपवर्तन समीकरणों को जोड़कर सार्वत्रिक लेंस मेकर सूत्र प्राप्त करना।",
        keyFormula: "\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)",
        commonTrap: "Using R₁ and R₂ with identical signs for biconvex lens where R₁ > 0 and R₂ < 0.",
        hindiCommonTrap: "द्वि-उत्तल लेंस में R₁ और R₂ दोनों को धनात्मक ले लेना (जबकि R₁ > 0 तथा R₂ < 0 होता है)।"
      }
    ]
  },

  // Physics 2: Kirchhoff's Laws
  {
    id: "chain-phy-kirchhoff",
    targetConcept: "Multi-Loop Network Analysis (Kirchhoff's KVL & KCL)",
    hindiTargetConcept: "किरचॉफ के नियम व परिपथ जाल विश्लेषण (KVL व KCL)",
    subject: "Physics",
    grade: 12,
    chapterName: "Current Electricity",
    hindiChapterName: "विद्युत धारा",
    importance: "critical",
    boardMarksAtRisk: 5,
    summaryDiagnosis: "Loop analysis fails when students do not understand potential drops across resistors vs battery EMF directions.",
    hindiSummaryDiagnosis: "लूप विश्लेषण में विफलता तब होती है जब छात्र प्रतिरोधक में विभव पतन (IR) और सेल के विद्युत वाहक बल (EMF) के चिह्नों में भ्रमित होते हैं।",
    nodes: [
      {
        id: "node-k1",
        title: "Conservation of Charge & Node Branching (KCL)",
        hindiTitle: "आवेश संरक्षण व संधि नियम (किरचॉफ का प्रथम नियम / KCL)",
        gradeLevel: 10,
        type: "root_foundation",
        subject: "Physics",
        description: "Current entering any junction must equal current leaving (no charge accumulation).",
        hindiDescription: "किसी भी संधि पर मिलने वाली समस्त धाराओं का बीजीय योग शून्य होता है (आवेश का कोई संचय नहीं)।",
        keyFormula: "\\sum I_{\\text{in}} = \\sum I_{\\text{out}}",
        commonTrap: "Forgetting that currents in parallel branches split inversely with resistance values.",
        hindiCommonTrap: "यह भूल जाना कि समांतर शाखाओं में धारा प्रतिरोध के व्युत्क्रमानुपाती विभाजित होती है।"
      },
      {
        id: "node-k2",
        title: "Potential Difference & Resistor Voltage Drops (IR)",
        hindiTitle: "विभवांतर व प्रतिरोधक में विभव ह्रास (-IR)",
        gradeLevel: 12,
        type: "bridge_concept",
        subject: "Physics",
        description: "Traversing in direction of current = (-IR) potential drop; against current = (+IR).",
        hindiDescription: "धारा की दिशा में चलने पर विभव पतन (-IR) और धारा के विपरीत चलने पर विभव वृद्धि (+IR)।",
        keyFormula: "\\Delta V = -I R",
        commonTrap: "Assigning battery sign based on current flow rather than the physical polarity (+/- terminal).",
        hindiCommonTrap: "बैटरी का चिह्न धारा की दिशा से तय करना, जबकि यह टर्मिनल की ध्रुवता (- से + = +E) पर निर्भर करता है।"
      },
      {
        id: "node-k3",
        title: "Simultaneous Multi-Loop Matrix Equations",
        hindiTitle: "बहु-लूप समीकरण व किरचॉफ का द्वितीय नियम (KVL)",
        gradeLevel: 12,
        type: "target_mastery",
        subject: "Physics",
        description: "Setting up independent closed loop equations and solving 2 or 3 variable algebraic systems.",
        hindiDescription: "स्वतंत्र बंद लूपों के लिए समीकरण बनाना तथा अज्ञात धाराओं के मान ज्ञात करना।",
        keyFormula: "\\sum \\Delta V_{\\text{closed loop}} = 0",
        commonTrap: "Writing redundant loop equations that are linear combinations of each other.",
        hindiCommonTrap: "ऐसे लूप समीकरण लिखना जो एक-दूसरे पर आश्रित हों, जिससे समीकरण हल नहीं हो पाता।"
      }
    ]
  }
];
