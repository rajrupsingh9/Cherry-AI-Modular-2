export function buildExperimentChalkboardContent(
  expPayload: any,
  currentParams: Record<string, any> = {},
  observations: any[] = []
): string {
  const title = expPayload?.title || "STEM Laboratory Experiment";
  const subject = (expPayload?.subject || "Science").toUpperCase();
  const formula = expPayload?.conceptFormula || "V = I \\cdot R";
  const desc = expPayload?.description || "Experimental analysis and parameter verification.";

  const paramsText = Object.entries(currentParams)
    .map(([k, v]) => `- **${k}**: \`${v}\``)
    .join("\n") || "- *Standard laboratory baseline*";

  const obsText = (observations || [])
    .map((o: any, idx: number) => `${idx + 1}. ${typeof o === "string" ? o : o.text || JSON.stringify(o)}`)
    .join("\n") || "1. Parameter values correlate directly with theoretical predictions.";

  return `
# 🧪 ${title}
> **Subject**: ${subject} | **Interactive STEM Simulation**

---

### 📌 Core Concept & Formula
$$${formula}$$

**Principle**: ${desc}

---

### ⚙️ Live Experimental Parameters
${paramsText}

---

### 🔬 Key Observations & Board Exam Traps
${obsText}

> **⚠️ Board Exam Note**: Ensure all derivations explicitly define coordinate axes and state assumptions before substituting values.
`.trim();
}

export function buildCherryExperimentSpokenPrompt(
  expPayload: any,
  currentParams: Record<string, any> = {},
  observations: any[] = [],
  studentName: string = "Student",
  grade: string = "Class 10",
  board: string = "CBSE"
): string {
  const title = expPayload?.title || "our simulation";
  return `Hello ${studentName}! We are now exploring the whiteboard for "${title}" in ${grade} ${board}. Notice how the experimental parameters directly control the physical state on the board. Let's walk through the governing formula and observe what happens when we tweak the key variables!`;
}
