import type { Locale } from "./i18n/types";
import type { MonthlyReviewContext } from "./monthly-review";
import type { MonthlyReviewRawStats } from "./monthly-review-types";

const JSON_SCHEMA = `{
  "month": "YYYY-MM",
  "overallScore": 0-100,
  "grade": "Excellent|Strong|Building|Needs focus|Reset",
  "headline": "one sentence summary",
  "scorecards": [],
  "wins": [{"title":"string","detail":"string","severity":"positive|neutral|warning"}],
  "watch": [{"title":"string","detail":"string","severity":"positive|neutral|warning"}],
  "trends": [{"title":"string","detail":"string","severity":"positive|neutral|warning"}],
  "recommendations": [{"title":"string","action":"string","priority":"high|medium|low"}],
  "dataGaps": ["string"]
}`;

export function buildMonthlyReviewSystemPrompt(
  locale: Locale,
  context: MonthlyReviewContext,
  stats?: MonthlyReviewRawStats
): string {
  const dataBlock = [
    `Month: ${context.month}`,
    stats ? `\nComputed stats:\n${JSON.stringify(stats, null, 2)}` : "",
    context.profileSummary ? `\nUser profile:\n${context.profileSummary}` : "",
    context.whoopSummary ? `\nWHOOP / biometrics:\n${context.whoopSummary}` : "",
    context.checklistSummary ? `\nDaily habits:\n${context.checklistSummary}` : "",
    context.workoutSummary ? `\nTraining log:\n${context.workoutSummary}` : "",
    context.weeklyCheckInSummary ? `\nWeekly measurements:\n${context.weeklyCheckInSummary}` : "",
    context.foodSummary ? `\nNutrition:\n${context.foodSummary}` : "",
    context.bloodTestSummary ? `\nBlood work:\n${context.bloodTestSummary}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (locale === "ar-SA") {
    return `أنت محلل صحي في تطبيق صحي. حلّل بيانات الشهر وأرجع JSON فقط (بدون markdown) لبناء dashboard.

${dataBlock}

أرجع JSON بهذا الشكل:\n${JSON_SCHEMA}

قواعد:
- overallScore من 0-100 يعكس الأداء الشامل
- grade و headline بالعربية (لهجة سعودية)
- wins: 2-4 إنجازات | watch: 2-3 نقاط انتباه | trends: 2-3 اتجاهات
- recommendations: 3-5 توصيات للشهر الجاي
- scorecards: اتركها مصفوفة فارغة [] — نحسبها محلياً
- dataGaps: بيانات ناقصة يحتاج المستخدم يسجلها
- لا تشخّص طبياً`;
  }

  return `You are Sehi's monthly health analyst. Analyze the month's data and return ONLY valid JSON for a dashboard UI.

${dataBlock}

Return JSON matching:\n${JSON_SCHEMA}

Rules:
- overallScore 0-100 reflects holistic performance
- wins: 2-4 items | watch: 2-3 items | trends: 2-3 items
- recommendations: 3-5 actionable items for next month
- scorecards: return empty array [] — computed locally
- dataGaps: missing data the user should track
- Never diagnose medically`;
}
