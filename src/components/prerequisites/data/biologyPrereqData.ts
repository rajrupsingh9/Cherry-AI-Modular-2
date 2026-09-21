/**
 * biologyPrereqData.ts
 * Biology Prerequisite Dependency Chains (Genetics Linkage & Recombination).
 */
import { ConceptDependencyChain } from "../prerequisiteTypes";

export const BIOLOGY_PREREQUISITE_CHAINS: ConceptDependencyChain[] = [
  // Biology 1: Genetics Recombination
  {
    id: "chain-bio-linkage",
    targetConcept: "Chromosomal Linkage & Morgan's Drosophila Recombination",
    hindiTargetConcept: "गुणसूत्रीय सहलग्नता व मॉर्गन का ड्रोसोफिला पुनर्योजन (Linkage)",
    subject: "Biology",
    grade: 12,
    chapterName: "Principles of Inheritance",
    hindiChapterName: "वंशागति तथा विविधता के सिद्धांत",
    importance: "high",
    boardMarksAtRisk: 5,
    summaryDiagnosis: "Linkage problems confuse students when they try to apply Mendel's 9:3:3:1 ratio to genes situated closely on the same chromosome.",
    hindiSummaryDiagnosis: "सहलग्नता के प्रश्नों में भ्रम तब होता है जब छात्र एक ही गुणसूत्र पर स्थित पास-पास के जीनों पर मेंडल के 9:3:3:1 अनुपात को जबरन लागू करने का प्रयास करते हैं।",
    nodes: [
      {
        id: "node-b1",
        title: "Mendelian Dihybrid Cross & Law of Independent Assortment",
        hindiTitle: "मेंडल का द्विसंकर संकरण व स्वतंत्र अपव्यूहन का नियम",
        gradeLevel: 10,
        type: "root_foundation",
        subject: "Biology",
        description: "Alleles of two different unlinked genes segregate independently during gamete formation (9:3:3:1).",
        hindiDescription: "दो भिन्न असहग्न जीनों के युग्मविकल्पी युग्मक निर्माण के समय स्वतंत्र रूप से अपव्यूहित होते हैं (9:3:3:1)।",
        keyFormula: "\\text{Phenotypic Ratio} = 9:3:3:1",
        commonTrap: "Assuming Mendel's law holds true even when genes are located on the same physical chromosome.",
        hindiCommonTrap: "यह मान लेना कि मेंडल का नियम तब भी लागू होगा जब जीन एक ही भौतिक गुणसूत्र पर बहुत पास स्थित हों।"
      },
      {
        id: "node-b2",
        title: "Meiotic Crossing Over & Homologous Recombination",
        hindiTitle: "अर्धसूत्री विभाजन में जीन विनिमय (Crossing Over)",
        gradeLevel: 11,
        type: "bridge_concept",
        subject: "Biology",
        description: "Physical exchange of chromatid segments during Pachytene stage of Meiosis I.",
        hindiDescription: "अर्धसूत्री विभाजन I की पैकिटीन (Pachytene) अवस्था में क्रोमैटिड खंडों का भौतिक विनिमय।",
        keyFormula: "\\text{Recombinant Frequency} = \\frac{\\text{Recombinants}}{\\text{Total Offspring}} \\times 100",
        commonTrap: "Confusing sister chromatids with non-sister chromatids of homologous pairs during chiasma.",
        hindiCommonTrap: "काएज्मेटा निर्माण के समय समजात गुणसूत्रों के गैर-सिस्टर क्रोमैटिड और सिस्टर क्रोमैटिड में भ्रमित होना।"
      },
      {
        id: "node-b3",
        title: "Genetic Mapping & CentiMorgan (cM) Distance",
        hindiTitle: "जीन मानचित्रण व सेंटीमॉर्गन (cM) दूरी",
        gradeLevel: 12,
        type: "target_mastery",
        subject: "Biology",
        description: "Constructing linear gene chromosome maps where 1% recombination frequency equals 1 map unit (cM).",
        hindiDescription: "रेखीय गुणसूत्र मानचित्र तैयार करना जहाँ 1% पुनर्योजन आवृत्ति = 1 मानचित्र इकाई (cM)।",
        keyFormula: "1\\% \\text{ Recombination} = 1\\text{ cM (centiMorgan)}",
        commonTrap: "Forgetting that maximum observable recombination frequency between any two genes cannot exceed 50%.",
        hindiCommonTrap: "यह भूल जाना कि किन्हीं दो जीनों के बीच अधिकतम प्रेक्षणीय पुनर्योजन आवृत्ति 50% से अधिक नहीं हो सकती।"
      }
    ]
  }
];
