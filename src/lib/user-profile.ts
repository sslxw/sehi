import type { CalendarEvent } from "./whoop-data";
import type { MacroTargets } from "./food";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";

export interface MedicationEntry {
  name: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

export interface UserGoals {
  primary: string[];
  secondary?: string[];
  weeklyFocus: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  age?: number;
  gender?: string;
  weightKg?: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  goals: UserGoals;
  conditions?: string[];
  medications: MedicationEntry[];
  allergies?: string[];
  bloodTestSummary?: string;
  hasRecentBloodTest?: boolean;
  sleepGoalHours: number;
  trainingDaysPerWeek: number;
  preferredTrainingTime?: "morning" | "afternoon" | "evening";
  dietaryPreferences?: string[];
  macroTargets: MacroTargets;
  onboardingComplete: boolean;
  personalizedAt?: string;
  coachNotes?: string;
}

export interface OnboardingProfileDraft {
  displayName: string;
  age?: number;
  gender?: string;
  weightKg?: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  primaryGoals: string[];
  secondaryGoals?: string[];
  conditions?: string[];
  medications: MedicationEntry[];
  allergies?: string[];
  bloodTestSummary?: string;
  hasRecentBloodTest?: boolean;
  sleepGoalHours: number;
  trainingDaysPerWeek: number;
  preferredTrainingTime?: "morning" | "afternoon" | "evening";
  dietaryPreferences?: string[];
  macroTargets?: MacroTargets;
  weeklyFocus: string;
  coachNotes?: string;
}


export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { isSupabaseConfigured } = await import("@/lib/supabase/env");
  if (isSupabaseConfigured()) {
    const { fetchProfile } = await import("@/lib/supabase/db");
    const row = await fetchProfile(userId);
    if (row?.profile) {
      return { ...row.profile, userId, onboardingComplete: row.onboarding_complete };
    }
    if (row?.onboarding_complete) {
      return {
        userId,
        displayName: row.display_name,
        activityLevel: "moderate",
        goals: { primary: [], weeklyFocus: "" },
        medications: row.medications ?? [],
        macroTargets: row.macro_targets ?? { calories: 2200, protein: 150, carbs: 220, fat: 70 },
        sleepGoalHours: 8,
        trainingDaysPerWeek: 3,
        onboardingComplete: true,
      };
    }
  }
  return null;
}

export async function saveUserProfileAsync(profile: UserProfile): Promise<void> {
  const { isSupabaseConfigured } = await import("@/lib/supabase/env");
  if (!isSupabaseConfigured()) return;
  const { upsertProfile } = await import("@/lib/supabase/db");
  await upsertProfile(profile.userId, {
    display_name: profile.displayName,
    onboarding_complete: profile.onboardingComplete,
    profile,
    macro_targets: profile.macroTargets,
    medications: profile.medications,
  });
}

/** @deprecated use fetchUserProfile / saveUserProfileAsync */
export function loadUserProfile(_userId: string): UserProfile | null {
  return null;
}

/** @deprecated use saveUserProfileAsync */
export function saveUserProfile(profile: UserProfile): void {
  void saveUserProfileAsync(profile);
}

export function estimateMacroTargets(
  draft: Pick<
    OnboardingProfileDraft,
    "weightKg" | "activityLevel" | "primaryGoals" | "trainingDaysPerWeek"
  >
): MacroTargets {
  const weight = draft.weightKg ?? 75;
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 28,
    light: 31,
    moderate: 33,
    active: 36,
    athlete: 38,
  };
  const calories = Math.round(weight * multipliers[draft.activityLevel]);
  const wantsMuscle = draft.primaryGoals.some((g) =>
    /muscle|strength|gain|bulk|performance|athlete|تمرين|عضلات|قوة/i.test(g)
  );
  const proteinPerKg = wantsMuscle ? 2 : 1.6;

  return {
    calories,
    protein: Math.round(weight * proteinPerKg),
    carbs: Math.round((calories * 0.45) / 4),
    fat: Math.round((calories * 0.25) / 9),
  };
}

export function generatePersonalizedCalendar(
  draft: OnboardingProfileDraft,
  days = 14
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const trainingSlots =
    draft.preferredTrainingTime === "evening"
      ? "18:00"
      : draft.preferredTrainingTime === "afternoon"
        ? "14:00"
        : "07:00";

  const trainingDayIndices = pickTrainingDays(draft.trainingDaysPerWeek);
  const goalLabel = draft.primaryGoals[0] ?? "Stay consistent";

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const isTrainingDay = trainingDayIndices.includes(dayOfWeek);

    if (isTrainingDay) {
      const intensity =
        draft.activityLevel === "athlete" || draft.activityLevel === "active"
          ? "high"
          : draft.activityLevel === "moderate"
            ? "medium"
            : "low";

      events.push({
        id: `workout-${dateKey}`,
        date: dateKey,
        title: intensity === "high" ? "Training session" : "Active training",
        type: "workout",
        time: trainingSlots,
        duration: intensity === "high" ? "60 min" : "45 min",
        intensity,
        completed: false,
        actionable: `Aligned with your goal: ${goalLabel}`,
      });
    } else if (dayOfWeek === 0) {
      events.push({
        id: `rest-${dateKey}`,
        date: dateKey,
        title: "Full recovery day",
        type: "rest",
        actionable: "Mobility, walk, and protect sleep for next week",
      });
    } else {
      events.push({
        id: `recovery-${dateKey}`,
        date: dateKey,
        title: "Active recovery",
        type: "recovery",
        time: "08:00",
        duration: "30 min",
        intensity: "low",
        actionable: "Zone 2 or mobility — stay within recovery",
      });
    }

    events.push({
      id: `sleep-${dateKey}`,
      date: dateKey,
      title: "Wind-down routine",
      type: "sleep",
      time: draft.sleepGoalHours >= 8 ? "21:30" : "22:00",
      duration: "30 min",
      actionable: `Target ${draft.sleepGoalHours}h sleep tonight`,
    });

    if (i === 0) {
      events.push({
        id: `goal-${dateKey}`,
        date: dateKey,
        title: draft.weeklyFocus,
        type: "goal",
        actionable: draft.primaryGoals.join(" · "),
      });
    }
  }

  return events;
}

function pickTrainingDays(count: number): number[] {
  const patterns: Record<number, number[]> = {
    1: [3],
    2: [2, 5],
    3: [1, 3, 5],
    4: [1, 2, 4, 6],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  return patterns[Math.min(7, Math.max(1, count))] ?? patterns[3];
}

export function draftToProfile(
  userId: string,
  draft: OnboardingProfileDraft
): UserProfile {
  const macroTargets = draft.macroTargets ?? estimateMacroTargets(draft);

  return {
    userId,
    displayName: draft.displayName,
    age: draft.age,
    gender: draft.gender,
    weightKg: draft.weightKg,
    heightCm: draft.heightCm,
    activityLevel: draft.activityLevel,
    goals: {
      primary: draft.primaryGoals,
      secondary: draft.secondaryGoals,
      weeklyFocus: draft.weeklyFocus,
    },
    conditions: draft.conditions,
    medications: draft.medications,
    allergies: draft.allergies,
    bloodTestSummary: draft.bloodTestSummary,
    hasRecentBloodTest: draft.hasRecentBloodTest,
    sleepGoalHours: draft.sleepGoalHours,
    trainingDaysPerWeek: draft.trainingDaysPerWeek,
    preferredTrainingTime: draft.preferredTrainingTime,
    dietaryPreferences: draft.dietaryPreferences,
    macroTargets,
    onboardingComplete: true,
    personalizedAt: new Date().toISOString(),
    coachNotes: draft.coachNotes,
  };
}

export function formatProfileForCoach(profile: UserProfile | null): string | null {
  if (!profile) return null;

  const meds =
    profile.medications.length > 0
      ? profile.medications.map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ""}`).join(", ")
      : "None reported";

  return [
    `User profile (${profile.displayName}):`,
    `- Goals: ${profile.goals.primary.join(", ")}`,
    `- Weekly focus: ${profile.goals.weeklyFocus}`,
    `- Activity: ${profile.activityLevel}, ${profile.trainingDaysPerWeek} training days/week`,
    `- Sleep target: ${profile.sleepGoalHours}h`,
    profile.conditions?.length ? `- Conditions: ${profile.conditions.join(", ")}` : null,
    `- Medications: ${meds}`,
    profile.bloodTestSummary ? `- Blood tests: ${profile.bloodTestSummary}` : null,
    profile.dietaryPreferences?.length
      ? `- Diet: ${profile.dietaryPreferences.join(", ")}`
      : null,
    profile.coachNotes ? `- Notes: ${profile.coachNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
