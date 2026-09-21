/**
 * scienceSubtopics.ts
 * Physics, Chemistry, and Biology granular sub-topic diagnostic catalog items.
 */
import { SubtopicCatalogItem } from "../microTypes";

export const SCIENCE_SUBTOPICS: SubtopicCatalogItem[] = [
  // Physics
  {
    id: "phy-kin-1",
    name: "Kinematic Equations & Projectile Motion",
    chapter: "Kinematics",
    subject: "Physics",
    defaultMastery: 62,
    benchmarkLatencySec: 50,
    dominantMistake: "calculation",
    keyFormulas: [
      "v = u + at",
      "s = ut + \\frac{1}{2}at^2",
      "R = \\frac{u^2 \\sin 2\\theta}{g}",
    ],
    prescriptionHint:
      "Separate horizontal and vertical components completely before applying acceleration g.",
    typicalQuestion:
      "A stone is thrown horizontally at 15 m/s from a 20m high ledge. How far does it land?",
    explanation:
      "Vertical fall time t = sqrt(2h/g) = 2s; horizontal distance = 15 * 2 = 30m.",
  },
  {
    id: "phy-elec-1",
    name: "Current Electricity: Kirchhoff's Laws & Circuit Loops",
    chapter: "Current Electricity",
    subject: "Physics",
    defaultMastery: 48,
    benchmarkLatencySec: 75,
    dominantMistake: "conceptual",
    keyFormulas: [
      "\\sum I_{\\text{junction}} = 0",
      "\\sum \\Delta V_{\\text{loop}} = 0",
      "V = IR",
    ],
    prescriptionHint:
      "Assign loop current arrows consistently and do not flip EMF signs mid-calculation.",
    typicalQuestion:
      "Find current in a two-battery circuit loop with internal resistance.",
    explanation:
      "Traversal in direction of current gives -IR drop; traversing from negative to positive plate gives +E.",
  },
  {
    id: "phy-opt-1",
    name: "Lens Formula & Sign Convention (Ray Optics)",
    chapter: "Ray & Wave Optics",
    subject: "Physics",
    defaultMastery: 54,
    benchmarkLatencySec: 60,
    dominantMistake: "formula",
    keyFormulas: [
      "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}",
      "m = \\frac{v}{u}",
      "P = \\frac{1}{f(\\text{in m})}",
    ],
    prescriptionHint:
      "Real object distance u is always negative according to Cartesian sign convention.",
    typicalQuestion:
      "A convex lens of focal length 15 cm forms an image at 30 cm behind lens. Find object distance u.",
    explanation:
      "1/15 = 1/30 - 1/u => 1/u = 1/30 - 1/15 = -1/30 => u = -30 cm.",
  },
  {
    id: "phy-thermo-1",
    name: "First Law of Thermodynamics & Heat Engines",
    chapter: "Thermodynamics",
    subject: "Physics",
    defaultMastery: 65,
    benchmarkLatencySec: 55,
    dominantMistake: "speed",
    keyFormulas: [
      "\\Delta Q = \\Delta U + \\Delta W",
      "W = P\\Delta V",
      "\\eta = 1 - \\frac{T_C}{T_H}",
    ],
    prescriptionHint:
      "Always convert temperatures to absolute Kelvin before computing Carnot efficiency.",
    typicalQuestion:
      "What is maximum possible efficiency of heat engine operating between 27°C and 327°C?",
    explanation:
      "T_C = 300K, T_H = 600K; eta = 1 - 300/600 = 50%.",
  },

  // Chemistry
  {
    id: "chem-bond-1",
    name: "VSEPR Theory, Molecular Geometry & Hybridization",
    chapter: "Chemical Bonding",
    subject: "Chemistry",
    defaultMastery: 55,
    benchmarkLatencySec: 45,
    dominantMistake: "conceptual",
    keyFormulas: [
      "\\text{Steric No.} = \\frac{1}{2}(V + M - C + A)",
      "\\text{sp}^3 = \\text{Tetrahedral } (109.5^\\circ)",
    ],
    prescriptionHint:
      "Remember lone pairs exert greater repulsion than bonded pairs, reducing standard bond angles.",
    typicalQuestion:
      "Explain why water (H2O) has a bent shape (104.5°) instead of linear.",
    explanation:
      "Oxygen has 2 bonding pairs and 2 lone pairs (Steric Number 4), leading to lp-lp repulsion.",
  },
  {
    id: "chem-thermo-1",
    name: "Gibbs Free Energy & Spontaneity (ΔG = ΔH - TΔS)",
    chapter: "Thermodynamics",
    subject: "Chemistry",
    defaultMastery: 49,
    benchmarkLatencySec: 65,
    dominantMistake: "formula",
    keyFormulas: [
      "\\Delta G = \\Delta H - T\\Delta S",
      "\\Delta G^\\circ = -RT \\ln K",
    ],
    prescriptionHint:
      "Match units: convert ΔH (kJ/mol) to Joules or divide ΔS by 1000 before subtracting.",
    typicalQuestion:
      "If ΔH = -40 kJ/mol and ΔS = -80 J/K·mol, is reaction spontaneous at 298 K?",
    explanation:
      "ΔG = -40 - 298*(-0.080) = -40 + 23.84 = -16.16 kJ/mol < 0; spontaneous.",
  },
  {
    id: "chem-org-1",
    name: "Nucleophilic Substitution (SN1 vs SN2 Mechanisms)",
    chapter: "Organic Chemistry",
    subject: "Chemistry",
    defaultMastery: 50,
    benchmarkLatencySec: 60,
    dominantMistake: "conceptual",
    keyFormulas: [
      "\\text{SN1: 3}^\\circ > 2^\\circ > 1^\\circ \\text{ (Carbocation)}",
      "\\text{SN2: 1}^\\circ > 2^\\circ > 3^\\circ \\text{ (Inversion)}",
    ],
    prescriptionHint:
      "Check substrate hindrance: tertiary halides favor SN1 racemization, primary favor SN2 Walden inversion.",
    typicalQuestion:
      "Why does 2-bromo-2-methylpropane undergo substitution primarily via SN1 mechanism?",
    explanation:
      "Tertiary carbocation formed is stabilized by 9 hyperconjugative alpha-hydrogens.",
  },

  // Biology
  {
    id: "bio-gen-1",
    name: "Mendelian Dihybrid Cross & Independent Assortment",
    chapter: "Genetics & Inheritance",
    subject: "Biology",
    defaultMastery: 70,
    benchmarkLatencySec: 50,
    dominantMistake: "speed",
    keyFormulas: [
      "\\text{Phenotypic Ratio} = 9:3:3:1",
      "\\text{Testcross} = 1:1:1:1",
    ],
    prescriptionHint:
      "Confirm alleles are on different chromosomes to verify Independent Assortment holds without linkage.",
    typicalQuestion:
      "In a cross RrYy x RrYy, what proportion of progeny will be homozygous recessive for both traits (rryy)?",
    explanation:
      "Probability = (1/4 rr) * (1/4 yy) = 1/16.",
  },
  {
    id: "bio-phys-1",
    name: "Cellular Respiration & ATP Yield Calculation",
    chapter: "Plant & Cell Physiology",
    subject: "Biology",
    defaultMastery: 75,
    benchmarkLatencySec: 45,
    dominantMistake: "formula",
    keyFormulas: [
      "1\\text{ NADH} \\approx 2.5\\text{ ATP}",
      "1\\text{ FADH}_2 \\approx 1.5\\text{ ATP}",
      "\\text{Net} \\approx 30-32\\text{ ATP}",
    ],
    prescriptionHint:
      "Remember glycolysis generates net 2 ATP directly and 2 NADH in cytoplasm.",
    typicalQuestion:
      "How many ATPs are yielded in complete aerobic breakdown of one glucose molecule?",
    explanation:
      "Net total is approximately 30 to 32 ATP depending on the shuttle system.",
  },
];
