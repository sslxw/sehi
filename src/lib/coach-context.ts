import type { DailyMetrics } from "./whoop-data";
import { mockDailyMetrics, pickTodayMetrics } from "./whoop-data";
import type { JournalEntry } from "./journal";
import { defaultTodayJournal } from "./journal";
import { calculateSehiScore } from "./sehi-score";
import { generateEnergyTimeline, getTrainingWindow, calculateSleepDebt } from "./energy";
import { translateTrainingWindow } from "./energy-i18n";
import { createTranslator, getSehiLabelKey } from "./i18n";
import type { Locale } from "./i18n/types";

export interface CoachPromptOptions {
  bloodTestContext?: string | null;
  profileContext?: string | null;
  metrics?: DailyMetrics;
  dailyMetrics?: DailyMetrics[];
  whoopConnected?: boolean;
  journal?: JournalEntry;
}

function buildEnglishPrompt(
  metrics: DailyMetrics,
  journal: JournalEntry,
  sehi: ReturnType<typeof calculateSehiScore>,
  sleepDebt: ReturnType<typeof calculateSleepDebt>,
  window: ReturnType<typeof getTrainingWindow>,
  bloodTestContext?: string | null,
  whoopConnected?: boolean,
  profileContext?: string | null
): string {
  const bloodSection = bloodTestContext
    ? `\n- Latest blood panel:\n${bloodTestContext}`
    : "";
  const profileSection = profileContext ? `\n- Onboarding profile:\n${profileContext}` : "";
  const dataSource = whoopConnected
    ? "Live WHOOP API data"
    : "Demo data (WHOOP not connected)";

  return `You are Sehi Coach — an expert health and performance coach inside the Sehi app. You help users interpret WHOOP biometric data and make actionable daily decisions.

Data source: ${dataSource}

Today's user data:
- Recovery: ${metrics.recovery}%
- Strain: ${metrics.strain.toFixed(1)}
- Sleep performance: ${metrics.sleep}% (${metrics.sleepHours.toFixed(1)} hours)
- HRV: ${metrics.hrv}ms | Resting HR: ${metrics.rhr}bpm
- Sehi Score: ${sehi.score} (${sehi.label})
- Strain budget remaining: ${sehi.strainBudget.toFixed(1)}
- Sleep debt (7d): ${sleepDebt.debtHours.toFixed(1)} hours
- Best training window: ${window.label}
- Journal today: alcohol=${journal.alcohol}, lateMeal=${journal.lateMeal}, highStress=${journal.highStress}, hydration=${journal.hydration} glasses${bloodSection}${profileSection}

Guidelines:
- Be concise, warm, and actionable. Use markdown **bold** for key numbers.
- Reference their actual metrics when relevant.
- Give specific recommendations (workouts, sleep, nutrition, work capacity).
- If asked about food/nutrition, encourage using the Food tab to scan meals and track macros.
- If blood panel data is present, reference relevant markers when discussing nutrition, recovery, or training — but never diagnose.
- Never invent metrics not listed above.`;
}

function buildArabicPrompt(
  metrics: DailyMetrics,
  journal: JournalEntry,
  sehi: ReturnType<typeof calculateSehiScore>,
  sleepDebt: ReturnType<typeof calculateSleepDebt>,
  window: ReturnType<typeof getTrainingWindow>,
  bloodTestContext?: string | null,
  whoopConnected?: boolean,
  profileContext?: string | null
): string {
  const bloodSection = bloodTestContext
    ? `\n- آخر تحليل دم:\n${bloodTestContext}`
    : "";
  const profileSection = profileContext ? `\n- ملف المستخدم:\n${profileContext}` : "";
  const dataSource = whoopConnected ? "بيانات WHOOP مباشرة" : "بيانات تجريبية (WHOOP غير متصل)";

  return `أنت مدرب صحي — خبير صحة وأداء داخل تطبيق صحي. تساعد المستخدمين على فهم بيانات WHOOP واتخاذ قرارات يومية عملية.

**مهم جداً:** رد دائماً بالعربية بلهجة سعودية (حجازية/خليجية) طبيعية ومفهومة لسكان المملكة. استخدم أسلوب ودود مثل: هلا، وش، الحين، زين، تبي، حقك، مو — بدون مبالغة. المصطلحات الطبية والرياضية يمكن أن تبقى بالإنجليزية عند الحاجة (WHOOP، HRV، zone 2).

مصدر البيانات: ${dataSource}

بيانات المستخدم اليوم:
- التعافي: ${metrics.recovery}%
- المجهود: ${metrics.strain.toFixed(1)}
- أداء النوم: ${metrics.sleep}% (${metrics.sleepHours.toFixed(1)} ساعة)
- HRV: ${metrics.hrv}ms | نبض الراحة: ${metrics.rhr}
- نتيجة صحي: ${sehi.score}
- ميزانية المجهود المتبقية: ${sehi.strainBudget.toFixed(1)}
- دين النوم (7 أيام): ${sleepDebt.debtHours.toFixed(1)} ساعة
- أفضل وقت للتمرين: ${window.label}
- اليومية: كحول=${journal.alcohol}، أكل متأخر=${journal.lateMeal}، ضغط=${journal.highStress}، ماء=${journal.hydration} أكواب${bloodSection}${profileSection}

إرشادات:
- كن مختصراً، ودوداً، وعملياً. استخدم **bold** للأرقام المهمة.
- ارجع لبياناته الفعلية.
- أعطِ توصيات محددة (تمارين، نوم، تغذية).
- إذا سأل عن الأكل، وجّهه لتبويب الأكل لمسح الوجبات.
- إذا فيه تحليل دم، ارجع للمؤشرات عند النقاش — بدون تشخيص.
- لا تختلق بيانات غير موجودة أعلاه.`;
}

export function buildCoachSystemPrompt(
  locale: Locale = "en",
  options: CoachPromptOptions = {}
): string {
  const history = options.dailyMetrics ?? mockDailyMetrics;
  const metrics = options.metrics ?? pickTodayMetrics(history);
  const journal = options.journal ?? defaultTodayJournal;
  const sehi = calculateSehiScore(metrics, journal);
  const sleepDebt = calculateSleepDebt(history.slice(-7));
  const timeline = generateEnergyTimeline(metrics, journal);
  const rawWindow = getTrainingWindow(metrics, timeline);
  const t = createTranslator(locale);
  const window = translateTrainingWindow(rawWindow, metrics, timeline, t);
  const sehiLabel = t(getSehiLabelKey(sehi.score));

  if (locale === "ar-SA") {
    return buildArabicPrompt(
      metrics,
      journal,
      sehi,
      sleepDebt,
      window,
      options.bloodTestContext,
      options.whoopConnected,
      options.profileContext
    );
  }
  return buildEnglishPrompt(
    metrics,
    journal,
    { ...sehi, label: sehiLabel },
    sleepDebt,
    window,
    options.bloodTestContext,
    options.whoopConnected,
    options.profileContext
  );
}
