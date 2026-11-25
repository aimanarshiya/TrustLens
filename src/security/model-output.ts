import type { ModelExplanation } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength
    ? value.trim()
    : null;
}

function readStringArray(value: unknown, maximumItems: number, maxLength: number): string[] | null {
  if (!Array.isArray(value) || value.length > maximumItems) return null;
  const values = value.map((item) => readString(item, maxLength));
  return values.every((item): item is string => item !== null) ? values : null;
}

export function validateModelExplanation(value: unknown): ModelExplanation | null {
  if (!isRecord(value)) return null;
  const summary = readString(value.summary, 500);
  const recommendations = readStringArray(value.recommendations, 4, 240);
  const uncertainties = readStringArray(value.uncertainties, 4, 240);
  if (summary === null || recommendations === null || uncertainties === null) return null;
  return { summary, recommendations, uncertainties };
}

export const explanationJsonSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    recommendations: { type: "ARRAY", items: { type: "STRING" } },
    uncertainties: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["summary", "recommendations", "uncertainties"],
} as const;
