import en from "./en";
import arSA from "./ar-SA";
import {
  defaultLocale,
  resolveTranslation,
  type Locale,
  type TranslationDict,
} from "./types";

export * from "./types";

const dictionaries: Record<Locale, TranslationDict> = {
  en,
  "ar-SA": arSA,
};

export function getDictionary(locale: Locale): TranslationDict {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type TranslateParams = Record<string, string | number>;

export function createTranslator(locale: Locale) {
  const dict = getDictionary(locale);

  return function t(key: string, params?: TranslateParams): string {
    let value = resolveTranslation(dict, key);
    if (value === undefined) {
      value = resolveTranslation(en, key) ?? key;
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value!.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return value;
  };
}

export function getGreetingKey(): "greeting.morning" | "greeting.afternoon" | "greeting.evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "greeting.morning";
  if (hour < 17) return "greeting.afternoon";
  return "greeting.evening";
}

export function getScoreLabelKey(
  score: number,
  type: "recovery" | "strain" | "sleep"
): string {
  if (type === "strain") {
    if (score < 8) return "score.light";
    if (score < 14) return "score.moderate";
    return "score.high";
  }
  if (score >= 67) return "score.optimal";
  if (score >= 34) return "score.moderate";
  return "score.low";
}

export function getSehiLabelKey(score: number): string {
  if (score >= 80) return "score.peakReady";
  if (score >= 65) return "score.strong";
  if (score >= 50) return "score.balanced";
  if (score >= 35) return "score.cautious";
  return "score.restore";
}

export function getSehiRecommendKey(score: number): string {
  if (score >= 80) return "sehiRecommend.peak";
  if (score >= 65) return "sehiRecommend.strong";
  if (score >= 50) return "sehiRecommend.balanced";
  if (score >= 35) return "sehiRecommend.cautious";
  return "sehiRecommend.restore";
}

export function getNavLabelKey(href: string): string {
  const map: Record<string, string> = {
    "/": "nav.today",
    "/food": "nav.food",
    "/health": "nav.health",
    "/journal": "nav.journal",
    "/calendar": "nav.calendar",
    "/coach": "nav.coach",
    "/enterprise": "nav.enterprise",
    "/trends": "nav.trends",
  };
  return map[href] ?? href;
}
