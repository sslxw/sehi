import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number, type: "recovery" | "strain" | "sleep") {
  if (type === "strain") {
    if (score < 8) return "#60A5FA";
    if (score < 14) return "#FBBF24";
    return "#F87171";
  }
  if (score >= 67) return "#34D399";
  if (score >= 34) return "#FBBF24";
  return "#F87171";
}

export function getScoreLabel(score: number, type: "recovery" | "strain" | "sleep") {
  if (type === "strain") {
    if (score < 8) return "Light";
    if (score < 14) return "Moderate";
    return "High";
  }
  if (score >= 67) return "Optimal";
  if (score >= 34) return "Moderate";
  return "Low";
}
