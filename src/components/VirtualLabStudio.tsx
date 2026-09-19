import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
  CheckCircle2,
  Maximize2,
  Atom,
  Zap,
} from "lucide-react";
import { CURATED_CUSTOM_SIMULATIONS, CuratedSimulationSpec } from "./virtual-lab/customSimPresets";

interface VirtualLabStudioProps {
  studentGrade?: string;
  studentSubject?: string;
  mediumOfLearning?: string;
  onOpenClassroomWithTopic: (topicTitle: string, experimentDetails?: any) => void;
}

export const VirtualLabStudio: React.FC<VirtualLabStudioProps> = ({
  studentGrade = "Class 10",
  studentSubject = "Physics",
  mediumOfLearning = "Hinglish",
  onOpenClassroomWithTopic,
}) => {
  const [selectedSimId, setSelectedSimId] = useState<string>(
    CURATED_CUSTOM_SIMULATIONS[0]?.id || "sim_double_slit"
  );

  const activeSim: CuratedSimulationSpec = useMemo(() => {
    return (
      CURATED_CUSTOM_SIMULATIONS.find((s) => s.id === selectedSimId) ||
      CURATED_CUSTOM_SIMULATIONS[0]
    );
  }, [selectedSimId]);

  // Dynamic Parameter Values
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activeSim?.parameters.forEach((p) => {
      initial[p.key] = p.defaultValue;
    });
    return initial;
  });

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const initial: Record<string, number> = {};
    activeSim?.parameters.forEach((p) => {
      initial[p.key] = p.defaultValue;
    });
    setParams(initial);
  };

  // Compute Live Outputs
  const liveValues = useMemo(() => {
    if (activeSim.id === "sim_double_slit") {
      const lambda = (params["wavelength"] || 550) * 1e-9;
      const d = (params["slitDistance"] || 0.5) * 1e-3;
      const D = params["screenDistance"] || 1.5;
      const beta = (lambda * D) / d; // meters
      return {
        fringeWidth: (beta * 1000).toFixed(2), // in mm
      };
    } else if (activeSim.id === "sim_ohms_law") {
      const V = params["voltage"] || 6;
      const R = params["resistance"] || 10;
      const I = V / R;
      return {
        current: I.toFixed(2),
      };
    }
    return {};
  }, [activeSim, params]);

  const handleExplain = () => {
    onOpenClassroomWithTopic(activeSim.title, {
      ...activeSim,
      currentParams: params,
      observations: [
        `Live parameter settings: ${Object.entries(params).map(([k, v]) => `${k}=${v}`).join(", ")}`,
        `Calculated outputs: ${Object.entries(liveValues).map(([k, v]) => `${k}=${v}`).join(", ")}`,
        activeSim.cherryObservation.keyRuleLaw,
        activeSim.cherryObservation.examTrap,
      ],
    });
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col md:flex-row bg-[#081b21] text-white overflow-hidden">
      {/* Sidebar: Experiment Selector & Controls */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-teal-900/40 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto bg-[#07171d]">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-900/60 border border-teal-500/30 text-[#c4f500] flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">STEM Virtual Lab</h2>
              <p className="text-[11px] text-teal-300/70">Real-time physics & chemistry models</p>
            </div>
          </div>

          {/* Select Experiment Tabs */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
              Choose Simulation
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {CURATED_CUSTOM_SIMULATIONS.map((sim) => (
                <button
                  key={sim.id}
                  onClick={() => {
                    setSelectedSimId(sim.id);
                    const init: Record<string, number> = {};
                    sim.parameters.forEach((p) => {
                      init[p.key] = p.defaultValue;
                    });
                    setParams(init);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                    selectedSimId === sim.id
                      ? "bg-teal-950 border-[#c4f500] text-white shadow-xs"
                      : "bg-[#0c222a] border-teal-900/40 text-teal-200/80 hover:border-teal-700"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{sim.title}</span>
                    <span className="text-[10px] text-teal-400/70">{sim.category}</span>
                  </div>
                  {selectedSimId === sim.id && (
                    <span className="w-2 h-2 rounded-full bg-[#c4f500]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="flex flex-col gap-3.5 pt-2 border-t border-teal-900/40">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Parameters
              </label>
              <button
                onClick={handleReset}
                className="text-[10px] text-teal-400/80 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {activeSim.parameters.map((param) => (
              <div key={param.key} className="flex flex-col gap-1.5 bg-[#0a2027] p-3 rounded-xl border border-teal-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-teal-200 font-semibold">{param.label}</span>
                  <span className="font-mono font-bold text-[#c4f500]">
                    {params[param.key] ?? param.defaultValue} {param.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={params[param.key] ?? param.defaultValue}
                  onChange={(e) => handleParamChange(param.key, parseFloat(e.target.value))}
                  className="accent-[#c4f500] cursor-pointer w-full h-1.5 bg-teal-950 rounded-lg appearance-none"
                />
              </div>
            ))}
          </div>

          {/* Live Readings */}
          <div className="flex flex-col gap-2 pt-2 border-t border-teal-900/40">
            <label className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
              Live Sensor Readings
            </label>
            <div className="grid grid-cols-1 gap-2">
              {activeSim.liveOutputs.map((out) => (
                <div
                  key={out.key}
                  className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-between"
                >
                  <span className="text-xs text-teal-200">{out.label}</span>
                  <span className="text-sm font-mono font-black text-[#c4f500]">
                    {liveValues[out.key as keyof typeof liveValues] ?? "--"} {out.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explain on Chalkboard Button */}
        <div className="pt-4 mt-4 border-t border-teal-900/40">
          <button
            onClick={handleExplain}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c4f500] to-[#a8d400] hover:from-[#d2ff1a] hover:to-[#b7e600] text-[#0a3641] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Explain On Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="bg-[#051317] border border-teal-900/60 rounded-2xl flex-1 flex flex-col p-4 sm:p-6 justify-between gap-6 shadow-2xl relative">
          {/* Top Title & Formula */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-teal-900/40">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                {activeSim.category} • {activeSim.grade}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeSim.title}</h1>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-200 font-mono text-xs">
              $${activeSim.conceptFormula}$$
            </div>
          </div>

          {/* Visual Canvas Area */}
          <div className="flex-1 min-h-[260px] flex items-center justify-center relative bg-[#040f12] rounded-xl border border-teal-900/40 p-4 overflow-hidden">
            {activeSim.id === "sim_double_slit" ? (
              <svg viewBox="0 0 500 240" className="w-full h-full max-h-[300px]">
                <defs>
                  <linearGradient id="laserBeam" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c4f500" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* Slit Barrier */}
                <line x1="120" y1="20" x2="120" y2="90" stroke="#475569" strokeWidth="6" />
                <line x1="120" y1="110" x2="120" y2="130" stroke="#475569" strokeWidth="6" />
                <line x1="120" y1="150" x2="120" y2="220" stroke="#475569" strokeWidth="6" />
                {/* Detector Screen */}
                <line x1="420" y1="20" x2="420" y2="220" stroke="#e2e8f0" strokeWidth="4" />
                {/* Waves */}
                <circle cx="120" cy="100" r="30" fill="none" stroke="#c4f500" strokeWidth="1.5" opacity="0.6" />
                <circle cx="120" cy="100" r="60" fill="none" stroke="#c4f500" strokeWidth="1.5" opacity="0.4" />
                <circle cx="120" cy="140" r="30" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" />
                <circle cx="120" cy="140" r="60" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4" />
                {/* Fringe Pattern on Screen */}
                {[50, 75, 100, 120, 140, 165, 190].map((y, i) => (
                  <circle
                    key={i}
                    cx="420"
                    cy={y}
                    r={i === 3 ? "7" : "4"}
                    fill="#c4f500"
                    opacity={i === 3 ? "1" : "0.7"}
                  />
                ))}
                <text x="435" y="125" fill="#c4f500" fontSize="10" fontFamily="monospace">
                  Central Bright Maxima
                </text>
              </svg>
            ) : (
              <svg viewBox="0 0 500 240" className="w-full h-full max-h-[300px]">
                {/* Rectangular Circuit */}
                <rect x="80" y="40" width="340" height="160" fill="none" stroke="#38bdf8" strokeWidth="3" rx="12" />
                {/* Battery */}
                <rect x="65" y="100" width="30" height="40" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <text x="50" y="125" fill="#38bdf8" fontSize="12" fontWeight="bold">+{params["voltage"] || 6}V</text>
                {/* Resistor */}
                <path d="M 220 40 L 230 30 L 240 50 L 250 30 L 260 50 L 270 30 L 280 40" fill="none" stroke="#c4f500" strokeWidth="4" />
                <text x="235" y="20" fill="#c4f500" fontSize="12" fontWeight="bold">R = {params["resistance"] || 10}Ω</text>
                {/* Ammeter */}
                <circle cx="250" cy="200" r="18" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
                <text x="245" y="205" fill="#22d3ee" fontSize="12" fontWeight="bold">A</text>
                <text x="280" y="205" fill="#22d3ee" fontSize="11" fontFamily="monospace">I = {liveValues.current || 0}A</text>
              </svg>
            )}
          </div>

          {/* Teacher Insights & Exam Trap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#07171d] p-3.5 rounded-xl border border-teal-900/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c4f500] font-bold block mb-1">
                💡 Cherry Ma'am's Insight
              </span>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                {activeSim.cherryObservation.hinglishGuide}
              </p>
            </div>
            <div className="bg-[#1f1614] p-3.5 rounded-xl border border-rose-900/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block mb-1">
                ⚠️ Board Exam Trap Alert
              </span>
              <p className="text-xs text-rose-100/90 leading-relaxed">
                {activeSim.cherryObservation.examTrap}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
