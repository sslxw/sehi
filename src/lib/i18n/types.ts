export type Locale = "en" | "ar-SA";

export const locales: Locale[] = ["en", "ar-SA"];
export const defaultLocale: Locale = "en";
export const LOCALE_STORAGE_KEY = "sehi-locale";

export function isRtl(locale: Locale): boolean {
  return locale === "ar-SA";
}

export function getDir(locale: Locale): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

/** Dot-notation path into nested translation object */
export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export function resolveTranslation(
  dict: TranslationDict,
  key: string
): string | undefined {
  const parts = key.split(".");
  let current: string | TranslationDict = dict;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}
