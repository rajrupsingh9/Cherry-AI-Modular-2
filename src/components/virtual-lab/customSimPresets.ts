export interface SimulationParameter {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
  symbol: string;
}

export interface SimulationOutput {
  key: string;
  label: string;
  formulaStr: string;
  unit: string;
  description: string;
}

export interface CuratedSimulationSpec {
  id: string;
  topic: string;
  title: string;
  hindiTitle?: string;
  subject: string;
  grade: string;
  category: string;
  conceptFormula: string;
  secondaryFormulas?: Array<{ label: string; formula: string }>;
  simulationType: string;
  description: string;
  parameters: SimulationParameter[];
  liveOutputs: SimulationOutput[];
  cherryObservation: {
    hinglishGuide: string;
    keyRuleLaw: string;
    examTrap: string;
    whatToObserve: string[];
    proTip: string;
  };
  visualTheme: {
    primaryColor: string;
    accentColor: string;
    bgTheme: "dark" | "light";
  };
}

export const CURATED_CUSTOM_SIMULATIONS: CuratedSimulationSpec[] = [
  {
    id: "sim_double_slit",
    topic: "Double Slit Interference",
    title: "Young's Double Slit Experiment (YDSE)",
    hindiTitle: "यंग का द्वि-स्लिट प्रयोग",
    subject: "physics",
    grade: "Class 12",
    category: "Wave Optics",
    conceptFormula: "\\beta = \\frac{\\lambda D}{d}",
    secondaryFormulas: [
      { label: "Constructive Interference (Bright)", formula: "x_n = \\frac{n \\lambda D}{d}" },
      { label: "Destructive Interference (Dark)", formula: "x'_n = \\left(n - \\frac{1}{2}\\right) \\frac{\\lambda D}{d}" },
    ],
    simulationType: "wave_optics",
    description: "Observe fringe width variations as wavelength, slit separation, and screen distance change dynamically.",
    parameters: [
      {
        key: "wavelength",
        label: "Wavelength (λ)",
        min: 400,
        max: 700,
        step: 10,
        defaultValue: 550,
        unit: "nm",
        description: "Wavelength of monochromatic light source",
        symbol: "\\lambda",
      },
      {
        key: "slitDistance",
        label: "Slit Separation (d)",
        min: 0.1,
        max: 2.0,
        step: 0.1,
        defaultValue: 0.5,
        unit: "mm",
        description: "Distance between the two coherent slits",
        symbol: "d",
      },
      {
        key: "screenDistance",
        label: "Screen Distance (D)",
        min: 0.5,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.5,
        unit: "m",
        description: "Distance between slits and detector screen",
        symbol: "D",
      },
    ],
    liveOutputs: [
      {
        key: "fringeWidth",
        label: "Fringe Width (β)",
        formulaStr: "β = (λ · D) / d",
        unit: "mm",
        description: "Linear separation between consecutive bright fringes",
      },
    ],
    cherryObservation: {
      hinglishGuide: "Doston! Dhyaan se dekho, jab screen door (D increase) hoti hai toh fringes spread hoti hain!",
      keyRuleLaw: "Wave superposition principle & Huygens' wave theory",
      examTrap: "Slit separation 'd' millimeters me hoti hai jabki screen distance 'D' meters me hoti hai! Hamesha 10^-3 factor yaad rakhein.",
      whatToObserve: [
        "Increasing wavelength shifts fringe pattern to wider spacing",
        "Decreasing slit separation causes fringes to expand rapidly",
      ],
      proTip: "In Board exams, always write the path difference condition Δx = nλ before deriving β.",
    },
    visualTheme: {
      primaryColor: "#38bdf8",
      accentColor: "#0284c7",
      bgTheme: "dark",
    },
  },
  {
    id: "sim_ohms_law",
    topic: "Ohm's Law Verification",
    title: "Ohm's Law & Circuit Resistance",
    hindiTitle: "ओम का नियम और प्रतिरोध",
    subject: "physics",
    grade: "Class 10",
    category: "Electricity",
    conceptFormula: "V = I \\cdot R",
    secondaryFormulas: [{ label: "Electric Power", formula: "P = V \\cdot I = I^2 R" }],
    simulationType: "circuits_charging",
    description: "Verify direct proportionality between voltage and current across an ohmic resistor.",
    parameters: [
      {
        key: "voltage",
        label: "Potential Difference (V)",
        min: 1,
        max: 24,
        step: 0.5,
        defaultValue: 6,
        unit: "V",
        description: "Terminal voltage applied across circuit",
        symbol: "V",
      },
      {
        key: "resistance",
        label: "Resistance (R)",
        min: 2,
        max: 50,
        step: 1,
        defaultValue: 10,
        unit: "Ω",
        description: "Resistance of the nichrome wire",
        symbol: "R",
      },
    ],
    liveOutputs: [
      {
        key: "current",
        label: "Current (I)",
        formulaStr: "I = V / R",
        unit: "A",
        description: "Current measured by ammeter",
      },
    ],
    cherryObservation: {
      hinglishGuide: "V aur I ka graph ek straight line passing through origin hota hai. Slope resistance deta hai!",
      keyRuleLaw: "Ohm's Law (V ∝ I at constant temperature)",
      examTrap: "Ammeter is ALWAYS in series, Voltmeter is ALWAYS in parallel across resistor.",
      whatToObserve: ["Doubling voltage doubles current exactly", "Linear V-I characteristic"],
      proTip: "Temperature must remain constant during the experiment.",
    },
    visualTheme: {
      primaryColor: "#10b981",
      accentColor: "#059669",
      bgTheme: "dark",
    },
  },
];

export function matchCuratedSimulation(topic: string): CuratedSimulationSpec | null {
  const norm = (topic || "").toLowerCase();
  for (const sim of CURATED_CUSTOM_SIMULATIONS) {
    if (
      norm.includes(sim.topic.toLowerCase()) ||
      norm.includes(sim.title.toLowerCase()) ||
      sim.topic.toLowerCase().includes(norm)
    ) {
      return sim;
    }
  }
  return null;
}
