import { generateContentWithRetry } from "../config/gemini";
import { matchCuratedSimulation } from "../../components/virtual-lab/customSimPresets";

export function buildProceduralSimulation(topic: string, grade: string, subject: string) {
  const tLower = (topic || "").toLowerCase();

  if (tLower.includes("wheatstone") || tLower.includes("galvanometer") || tLower.includes("potentiometer") || tLower.includes("meter bridge") || tLower.includes("resistance")) {
    return {
      id: `sim-proc-${Date.now()}`,
      topic,
      title: `${topic}: Bridge Balance & Null Deflection`,
      hindiTitle: `${topic}: ब्रिज संतुलन और नल बिंदु`,
      subject: "physics",
      grade: grade || "Class 12",
      category: "Current Electricity",
      conceptFormula: "\\frac{P}{Q} = \\frac{R}{S}, \\quad I_g = 0",
      secondaryFormulas: [
        { label: "Unknown Resistance", formula: "S = \\frac{Q}{P} \\cdot R" },
        { label: "Galvanometer Current", formula: "I_g = \\frac{V_{BD}}{R_g}" }
      ],
      simulationType: "circuits_charging",
      description: `Investigate the null deflection condition in bridge balance. Adjust standard resistance arm to bring galvanometer needle to zero.`,
      parameters: [
        { key: "ratioArmP", label: "Ratio Arm (P)", min: 10, max: 100, step: 10, defaultValue: 50, unit: "Ω", description: "Fixed ratio arm resistor P", symbol: "P" },
        { key: "ratioArmQ", label: "Ratio Arm (Q)", min: 10, max: 100, step: 10, defaultValue: 50, unit: "Ω", description: "Fixed ratio arm resistor Q", symbol: "Q" },
        { key: "knownResistanceR", label: "Variable Arm (R)", min: 5, max: 150, step: 5, defaultValue: 40, unit: "Ω", description: "Resistance box standard arm R", symbol: "R" },
        { key: "appliedVoltage", label: "Supply EMF (E)", min: 1, max: 12, step: 1, defaultValue: 4, unit: "V", description: "DC battery potential", symbol: "E" }
      ],
      liveOutputs: [
        { key: "galvanometerCurrent", label: "Galvanometer Deflection (Ig)", formulaStr: "V_{BD} / R_g", unit: "mA", description: "Null point is reached when Ig = 0" },
        { key: "calculatedUnknownS", label: "Calculated S", formulaStr: "(Q/P) * R", unit: "Ω", description: "Unknown arm value at balance" }
      ],
      cherryObservation: {
        hinglishGuide: `Dekho beta! Wheatstone Bridge me jab P/Q = R/S ho jata hai, tab central galvanometer arm me koi current nahi behta (Ig = 0). Is condition ko Null Deflection bolte hain!`,
        keyRuleLaw: "Wheatstone Bridge Principle & Kirchhoff's Circuit Laws",
        examTrap: "Remember: Null point remains completely unchanged even if battery and galvanometer positions are interchanged!",
        whatToObserve: [
          "Jab R ko change karte hain, galvanometer needle left ya right deflect hoti hai.",
          "Jab P = Q aur R = S ho, needle exactly zero mark par rukti hai.",
          "EMF badhane se bridge sensitivity badhti hai par null point wahi rehta hai."
        ],
        proTip: "Meter bridge experiments me best accuracy ke liye null point hamesha 40cm se 60cm ke beech me aana chahiye!"
      },
      visualTheme: { primaryColor: "#38bdf8", accentColor: "#0284c7", bgTheme: "dark" }
    };
  }

  if (tLower.includes("carnot") || tLower.includes("engine") || tLower.includes("stirling") || tLower.includes("entropy") || tLower.includes("heat")) {
    return {
      id: `sim-proc-${Date.now()}`,
      topic,
      title: `${topic}: Reversible Thermodynamic Cycle`,
      hindiTitle: `${topic}: कार्नो चक्र और इंजन दक्षता`,
      subject: "physics",
      grade: grade || "Class 11",
      category: "Thermodynamics",
      conceptFormula: "\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W}{Q_H}",
      secondaryFormulas: [
        { label: "Carnot Efficiency", formula: "\\eta = 1 - \\frac{T_2}{T_1}" },
        { label: "Net Work Done", formula: "W = Q_H - Q_C" }
      ],
      simulationType: "thermodynamics_gas",
      description: `Explore the maximum theoretical efficiency limit of heat engines operating between two thermal reservoirs.`,
      parameters: [
        { key: "sourceTemp", label: "Hot Reservoir (T_H)", min: 300, max: 1000, step: 25, defaultValue: 600, unit: "K", description: "Source temperature", symbol: "T_H" },
        { key: "sinkTemp", label: "Cold Reservoir (T_C)", min: 100, max: 400, step: 20, defaultValue: 300, unit: "K", description: "Sink temperature", symbol: "T_C" },
        { key: "compressionRatio", label: "Compression Ratio (r)", min: 2, max: 12, step: 1, defaultValue: 5, unit: "ratio", description: "V_max / V_min", symbol: "r" }
      ],
      liveOutputs: [
        { key: "carnotEfficiency", label: "Thermal Efficiency (η)", formulaStr: "1 - (T_C / T_H)", unit: "%", description: "Maximum possible efficiency" },
        { key: "workOutput", label: "Work Done per Cycle (W)", formulaStr: "Q_H * η", unit: "kJ", description: "Useful mechanical energy" }
      ],
      cherryObservation: {
        hinglishGuide: `Arrey beta dhyan se dekho! Koi bhi real heat engine Carnot efficiency se zyada efficient nahi ho sakta. Efficiency badhane ke liye T_H ko badhao ya T_C ko ghatayein!`,
        keyRuleLaw: "Second Law of Thermodynamics & Carnot's Theorem",
        examTrap: "Efficiency 100% (η = 1) tabhi possible hai jab T_C = 0 K (Absolute Zero) ho, jo practical universe me achieve karna impossible hai!",
        whatToObserve: [
          "T_H (source temperature) badhane par cycle ka area aur efficiency dono increase hote hain.",
          "T_C (sink temperature) drop karne par efficiency sharply increase hoti hai.",
          "Adiabatic compression ke time gas ka temperature bina heat add kiye rise hota hai."
        ],
        proTip: "Steam power plants me condensers cold water use karte hain taaki T_C low rahe aur cycle efficiency maximum ho!"
      },
      visualTheme: { primaryColor: "#f59e0b", accentColor: "#d97706", bgTheme: "dark" }
    };
  }

  return {
    id: `sim-proc-${Date.now()}`,
    topic,
    title: `${topic}: Interactive Dynamic Lab`,
    hindiTitle: `${topic}: इंटरैक्टिव 2D सिमुलेशन`,
    subject: subject || "physics",
    grade: grade || "Class 10-12",
    category: "STEM Interactive Simulation",
    conceptFormula: "\\vec{R} = \\sum_{i=1}^n \\vec{F}_i, \\quad \\Delta E = W_{\\text{ext}} + Q",
    secondaryFormulas: [
      { label: "Rate of Change", formula: "\\frac{d\\Phi}{dt} = v \\cdot \\nabla \\Phi" },
      { label: "Dynamic Output", formula: "Y(t) = Y_0 e^{-\\gamma t} \\cos(\\omega t)" }
    ],
    simulationType: "custom_interactive",
    description: `Dynamic physical parameter mapping and mathematical visualization for ${topic}. Move sliders to observe instantaneous response.`,
    parameters: [
      { key: "primaryParameter", label: `${topic} Intensity`, min: 10, max: 100, step: 5, defaultValue: 50, unit: "units", description: "Primary magnitude or strength parameter.", symbol: "I" },
      { key: "drivingRate", label: "Rate / Frequency (ω)", min: 1, max: 20, step: 1, defaultValue: 8, unit: "rad/s", description: "Oscillation rate or flow dynamics.", symbol: "ω" },
      { key: "dampingFactor", label: "System Damping (γ)", min: 0, max: 10, step: 1, defaultValue: 2, unit: "ratio", description: "Resistance or dissipation coefficient.", symbol: "γ" }
    ],
    liveOutputs: [
      { key: "dynamicResponse", label: "System Response", formulaStr: "I * \\cos(ω t)", unit: "A.U.", description: "Real-time state vector magnitude." },
      { key: "energyFlux", label: "Stored Energy (E)", formulaStr: "0.5 * I^2", unit: "Joules", description: "Total kinetic and potential state." }
    ],
    cherryObservation: {
      hinglishGuide: `Arrey beta dhyan se dekho! ${topic} me jaise hi hum primary parameter (Intensity) ya driving rate (ω) ko adjust karte hain, system ki total energy aur waveform instantly update ho jaati hai!`,
      keyRuleLaw: "Universal Superposition & Conservation Principles",
      examTrap: "Remember to always verify SI units and boundary conditions before plugging values into competitive exam equations!",
      whatToObserve: [
        "Primary slider badhane se system perturbation aur field height badhti hai.",
        "Driving rate badhane se oscillation density aur frequency tez hoti hai.",
        "Damping badhane se transient response steady state me jaldi convert ho jata hai."
      ],
      proTip: "In real-world experiments, system resonance occurs when driving frequency matches natural frequency!"
    },
    visualTheme: {
      primaryColor: "#38bdf8",
      accentColor: "#0284c7",
      bgTheme: "dark"
    }
  };
}

export async function generateSimulationSpec(topic: string, grade: string, subject: string) {
  const sanitizedTopic = (topic || "").toLowerCase().trim();

  const matchedCurated = matchCuratedSimulation(sanitizedTopic);
  if (matchedCurated) {
    return { data: matchedCurated, isCurated: true };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const prompt = `You are a world-class STEM pedagogical visualization architect. Generate an interactive 2D physics/chemistry/math simulation spec for topic: "${topic}" (${grade}, ${subject}).

Return pure JSON matching this exact structure:
{
  "id": "sim-unique-id",
  "topic": "${topic}",
  "title": "Clear English Title",
  "hindiTitle": "हिन्दी शीर्षक",
  "subject": "${subject}",
  "grade": "${grade}",
  "category": "Thermodynamics | Optics | Waves | Modern Physics | Organic Chemistry | etc.",
  "conceptFormula": "Primary LaTeX Formula",
  "secondaryFormulas": [{ "label": "Name", "formula": "LaTeX" }],
  "simulationType": "ray_optics | wave_optics | circuits_charging | thermodynamics_gas | projectile_motion | custom_interactive",
  "description": "2-sentence concept briefing",
  "parameters": [
    { "key": "paramKey", "label": "Display Label", "min": 1, "max": 100, "step": 1, "defaultValue": 20, "unit": "SI unit", "description": "tooltip", "symbol": "LaTeX symbol" }
  ],
  "liveOutputs": [
    { "key": "outputKey", "label": "Display Label", "formulaStr": "Mathematical formula", "unit": "Unit", "description": "What it represents" }
  ],
  "cherryObservation": {
    "hinglishGuide": "Enthusiastic Hinglish teacher note with deep insight",
    "keyRuleLaw": "Governing scientific law",
    "examTrap": "Common exam trap or mistake students make",
    "whatToObserve": ["Observation 1", "Observation 2"],
    "proTip": "Pro exam tip"
  },
  "visualTheme": {
    "primaryColor": "#38bdf8",
    "accentColor": "#0284c7",
    "bgTheme": "dark"
  }
}`;

  if (!apiKey) {
    return { data: buildProceduralSimulation(topic, grade, subject) };
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini simulation generation timed out")), 35000)
    );

    const aiPromise = generateContentWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    }, 2, 800, apiKey, 35000);

    const response: any = await Promise.race([aiPromise, timeoutPromise]);
    const rawText = response.text ? response.text.trim() : "";
    const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsedData = JSON.parse(cleanedJson);

    return { data: parsedData };
  } catch (aiErr: any) {
    return { data: buildProceduralSimulation(topic, grade, subject) };
  }
}
