import type { Keyword } from "./seo.types";

interface GeminiPayload {
  contents: { parts: { text: string }[] }[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: { responseMimeType: string };
}

export const callGemini = async (
  prompt: string,
  systemInstruction = "",
  useJson = false,
): Promise<unknown> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`;
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const payload: GeminiPayload = {
        contents: [{ parts: [{ text: prompt }] }],
      };
      if (systemInstruction)
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      if (useJson)
        payload.generationConfig = { responseMimeType: "application/json" };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        const text: string =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return useJson ? JSON.parse(text) : text;
      }
    } catch (err) {
      if (i === 4) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
  }
  throw new Error("Unable to contact the AI core.");
};

export const copyToClipboard = (text: string) => {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

export const getMockKeywords = (seed: string): Keyword[] => [
  { keyword: `${seed} strategies`, volume: 2400, difficulty: 38, cpc: 1.85, intent: "Informational", relevance: 98 },
  { keyword: `best ${seed} tools`, volume: 1600, difficulty: 52, cpc: 3.2, intent: "Commercial", relevance: 94 },
  { keyword: `how to optimize ${seed}`, volume: 850, difficulty: 25, cpc: 0.9, intent: "Informational", relevance: 91 },
  { keyword: `free ${seed} checklist 2026`, volume: 1200, difficulty: 41, cpc: 0.15, intent: "Navigational", relevance: 88 },
  { keyword: `enterprise ${seed} services`, volume: 450, difficulty: 68, cpc: 8.5, intent: "Transactional", relevance: 85 },
];
