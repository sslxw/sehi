import type { Locale } from "./i18n/types";

const READY_MARKER = "[[READY_FOR_REVIEW]]";

export function stripReadyMarker(content: string): {
  content: string;
  readyForReview: boolean;
} {
  const readyForReview = content.includes(READY_MARKER);
  return {
    content: content.replace(READY_MARKER, "").trim(),
    readyForReview,
  };
}

export function buildOnboardingSystemPrompt(
  locale: Locale,
  userName: string,
  bloodTestContext?: string | null
): string {
  const bloodSection = bloodTestContext
    ? `\nThe user already uploaded a blood test. Summary:\n${bloodTestContext}\nReference it when discussing health baselines.`
    : "";

  if (locale === "ar-SA") {
    return `أنت مُرشد الانضمام في تطبيق صحي (Sehi). مهمتك التعرف على المستخدم ${userName} بمحادثة ودية — مو استجواب جاف.

اجمع المعلومات التالية تدريجياً (سؤال أو سؤالين بكل رسالة):
1. العمر، الجنس، ومستوى النشاط (خامل / خفيف / متوسط / نشط / رياضي)
2. الأهداف الرئيسية (نوم، لياقة، وزن، أداء، صحة عامة، إدارة ضغط/سكر، إلخ)
3. الأدوية الحالية والحالات الصحية والحساسية
4. تحاليل الدم — هل عنده تحليل حديث؟ يقدر يرفع صورة من تبويب الصحة أو يوصف النتائج
5. هدف النوم (ساعات) وأيام التمرين بالأسبوع ووقت التمرين المفضل
6. التغذية والتفضيلات الغذائية

قواعد:
- تكلم باللهجة السعودية الطبيعية، ودود وواضح
- لا تكرر أسئلة جاوب عليها
- لما تجمع معلومات كافية (أهداف + نشاط + نوم + أدوية/تحاليل)، اختم رسالتك بـ ${READY_MARKER} وقل إنك جاهز يراجع ملفه
- لا تكتب JSON — محادثة فقط${bloodSection}`;
  }

  return `You are Sehi's onboarding guide. Have a warm, conversational "get to know you" chat with ${userName} — not a rigid form.

Collect these topics gradually (1–2 questions per message):
1. Age, gender, activity level (sedentary / light / moderate / active / athlete)
2. Primary goals (sleep, fitness, weight, performance, general health, managing conditions, etc.)
3. Current medications, health conditions, and allergies
4. Blood tests — recent labs? They can upload on the Health tab or describe results here
5. Sleep target (hours), training days per week, preferred workout time
6. Nutrition preferences and dietary restrictions

Rules:
- Be concise, friendly, and personalized
- Don't repeat questions they've already answered
- When you have enough (goals + activity + sleep + meds/labs covered), end your message with ${READY_MARKER} and tell them they can review their profile
- Conversation only — no JSON output${bloodSection}`;
}

export function buildExtractSystemPrompt(locale: Locale): string {
  const schema = `{
  "displayName": "string",
  "age": number or null,
  "gender": "string or null",
  "weightKg": number or null,
  "heightCm": number or null,
  "activityLevel": "sedentary|light|moderate|active|athlete",
  "primaryGoals": ["string"],
  "secondaryGoals": ["string"] or null,
  "conditions": ["string"] or null,
  "medications": [{"name":"string","dosage":"string?","frequency":"string?","notes":"string?"}],
  "allergies": ["string"] or null,
  "bloodTestSummary": "string or null",
  "hasRecentBloodTest": boolean,
  "sleepGoalHours": number,
  "trainingDaysPerWeek": number,
  "preferredTrainingTime": "morning|afternoon|evening" or null,
  "dietaryPreferences": ["string"] or null,
  "macroTargets": {"calories":number,"protein":number,"carbs":number,"fat":number} or null,
  "weeklyFocus": "string — one sentence focus for this week",
  "coachNotes": "string or null — anything else the coach should remember"
}`;

  if (locale === "ar-SA") {
    return `استخرج ملف المستخدم من محادثة الانضمام. أرجع JSON فقط بدون markdown، بالحقول التالية:\n${schema}`;
  }

  return `Extract the user's onboarding profile from the conversation. Return ONLY valid JSON matching:\n${schema}`;
}

export { READY_MARKER };
