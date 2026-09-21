/**
 * subjectInferenceUtils.ts
 * Subject categorization heuristics, theme metadata, and Markdown export for lecture books and chalkboard slates.
 */
import { BoardSnapshot } from "../../accountTypes";
import { SubjectTheme } from "../libraryTypes";

export const inferBookSubject = (sess: any, fallbackSubject = "Science"): string => {
  if (sess?.subject && typeof sess.subject === "string" && sess.subject.trim()) {
    const s = sess.subject.trim();
    if (s.toLowerCase().includes("math")) return "Mathematics";
    if (s.toLowerCase().includes("phys")) return "Physics";
    if (s.toLowerCase().includes("chem")) return "Chemistry";
    if (s.toLowerCase().includes("bio")) return "Biology";
    if (s.toLowerCase().includes("sci")) return "Science";
    return s;
  }
  const text = `${sess?.activeDocumentName || ""} ${sess?.title || ""} ${sess?.documentMarkdown || ""}`.toLowerCase();
  if (
    text.match(
      /ammonia|haber|nh3|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|chemical|equilibrium|solution|electrochem|compound|hybridization|carbon|metal|atom|redox|titration|precipitation|catalyst|oxidation|reduction|mole|molarity|alkali|alkaline|halogen|valency|isomerism|hydrocarbon|ester|aldehyde|ketone|polymer|le chatelier|exothermic|endothermic|solubility|odour|gas/,
    )
  ) {
    return "Chemistry";
  }
  if (
    text.match(
      /trigonometr|algebra|calculus|derivative|integral|differential|geometry|matrix|determinant|quadratic|arithmetic|probability|polynomial|height|distance|triangle|circle|vector|parabola|hyperbola|ellipse|coordinate|logarithm|permutation|combination|binomial|limit|continuity/,
    )
  ) {
    return "Mathematics";
  }
  if (
    text.match(
      /cell|plant|photosynthe|genetic|dna|rna|circulation|respiration|organism|biotech|ecolog|human|tissue|reproduction|heart|blood|neuron|brain|kidney|digestion|endocrine|hormone|chromosome|mitosis|meiosis|ecosystem|bacteria|virus|fungi|enzyme|chlorophyll|stomata/,
    )
  ) {
    return "Biology";
  }
  if (
    text.match(
      /kinematic|motion|gravity|force|newton|momentum|energy|work|power|ohm|current|optics|lens|mirror|thermodynamic|magnetic|electromagnet|wave|frequency|wavelength|friction|light|circuit|volt|ampere|refraction|reflection|capacit|resistor|inductor|photoelectric|nuclear|doppler|torque|rotational|fluids|pressure|buoyancy|snell/,
    )
  ) {
    return "Physics";
  }
  return fallbackSubject || "Science";
};

export const inferSnapshotSubject = (snap: any, fallbackSubject = "Science"): string => {
  if (snap?.subject && typeof snap.subject === "string" && snap.subject.trim()) {
    const s = snap.subject.trim();
    if (s.toLowerCase().includes("math")) return "Mathematics";
    if (s.toLowerCase().includes("phys")) return "Physics";
    if (s.toLowerCase().includes("chem")) return "Chemistry";
    if (s.toLowerCase().includes("bio")) return "Biology";
    if (s.toLowerCase().includes("sci")) return "Science";
    return s;
  }
  const text = `${snap?.topicTitle || ""} ${snap?.description || ""}`.toLowerCase();
  if (
    text.match(
      /ammonia|haber|nh3|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|chemical|equilibrium|solution|electrochem|compound|hybridization|carbon|metal|atom|redox|titration|precipitation|catalyst|oxidation|reduction|mole|molarity|alkali|alkaline|halogen|valency|isomerism|hydrocarbon|ester|aldehyde|ketone|polymer|le chatelier|exothermic|endothermic|solubility|odour/,
    )
  ) {
    return "Chemistry";
  }
  if (
    text.match(
      /trigonometr|algebra|calculus|derivative|integral|differential|geometry|matrix|determinant|quadratic|arithmetic|probability|polynomial|height|distance|triangle|circle|vector|parabola|hyperbola|ellipse|coordinate|logarithm|permutation|combination|binomial|limit|continuity/,
    )
  ) {
    return "Mathematics";
  }
  if (
    text.match(
      /cell|plant|photosynthe|genetic|dna|rna|circulation|respiration|organism|biotech|ecolog|human|tissue|reproduction|heart|blood|neuron|brain|kidney|digestion|endocrine|hormone|chromosome|mitosis|meiosis|ecosystem|bacteria|virus|fungi|enzyme|chlorophyll|stomata/,
    )
  ) {
    return "Biology";
  }
  if (
    text.match(
      /kinematic|motion|gravity|force|newton|momentum|energy|work|power|ohm|current|optics|lens|mirror|thermodynamic|magnetic|electromagnet|wave|frequency|wavelength|friction|light|circuit|volt|ampere|refraction|reflection|capacit|resistor|inductor|photoelectric|nuclear|doppler|torque|rotational|fluids|pressure|buoyancy|snell/,
    )
  ) {
    return "Physics";
  }
  return fallbackSubject || "Science";
};

export const getSubjectBookTheme = (subj: string): SubjectTheme => {
  const s = (subj || "").toLowerCase();
  if (s.includes("math")) {
    return {
      name: "Mathematics",
      icon: "📐",
      accentPillBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    };
  }
  if (s.includes("phys")) {
    return {
      name: "Physics",
      icon: "⚡",
      accentPillBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    };
  }
  if (s.includes("chem")) {
    return {
      name: "Chemistry",
      icon: "🧪",
      accentPillBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    };
  }
  if (s.includes("bio")) {
    return {
      name: "Biology",
      icon: "🌱",
      accentPillBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    };
  }
  return {
    name: "Science",
    icon: "🔬",
    accentPillBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  };
};

export const exportSnapshotsMarkdownAlbum = (
  snapshots: BoardSnapshot[],
  meta: {
    studentName?: string;
    grade?: string;
    board?: string;
    subject?: string;
  },
) => {
  const list = snapshots && snapshots.length > 0 ? snapshots : [];
  if (list.length === 0) return;

  let md = `# 📸 Blackboard Derivations & Chalkboard Slates Album\n\n`;
  md += `*Student: ${meta.studentName || "Scholar"} | Grade: ${meta.grade || "Class 10"} | Board: ${meta.board || "CBSE"} | Subject: ${meta.subject || "Mathematics"}*\n`;
  md += `*Generated via Cherry AI Socratic Classroom on ${new Date().toLocaleDateString()}*\n\n`;
  md += `---\n\n`;

  list.forEach((snap, idx) => {
    md += `## Slide ${idx + 1}: ${snap.topicTitle || "Lecture Derivation"}\n`;
    md += `**Subject**: ${snap.subject || meta.subject || "Science"} | **Timestamp**: ${new Date(snap.timestamp).toLocaleString()}\n\n`;
    if (snap.description) {
      md += `> ${snap.description}\n\n`;
    }
    if (
      snap.latexEquations &&
      Array.isArray(snap.latexEquations) &&
      snap.latexEquations.length > 0
    ) {
      md += `### Key Mathematical Formulas:\n`;
      snap.latexEquations.forEach((eq: string) => {
        md += `$$\n${eq}\n$$\n\n`;
      });
    }
    if (snap.imgData) {
      md += `![Blackboard Snapshot](${snap.imgData})\n\n`;
    }
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Chalkboard_Slates_Album_${(meta.subject || "All").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
