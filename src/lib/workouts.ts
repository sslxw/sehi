export interface WorkoutSet {
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name?: string;
  exercises: WorkoutExercise[];
  durationMin?: number;
  notes?: string;
  loggedAt: string;
}

import { loadJson, saveJson } from "@/lib/data/sync";

const STORAGE_KEY = "sehi-workout-sessions";

export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

export async function loadWorkoutSessionsAsync(userId?: string | null): Promise<WorkoutSession[]> {
  return loadJson<WorkoutSession[]>(userId ?? null, "workouts", []);
}

export async function saveWorkoutSessionsAsync(
  sessions: WorkoutSession[],
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "workouts", sessions);
}

export function createEmptySet(): WorkoutSet {
  return { reps: 10, weightKg: 0, completed: false };
}

export function createEmptyExercise(name = ""): WorkoutExercise {
  return {
    id: crypto.randomUUID(),
    name,
    sets: [createEmptySet(), createEmptySet(), createEmptySet()],
  };
}

export function createEmptySession(name?: string): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    date: getTodayDateKey(),
    name,
    exercises: [],
    loggedAt: new Date().toISOString(),
  };
}

export function getTodaySessions(sessions: WorkoutSession[]): WorkoutSession[] {
  const today = getTodayDateKey();
  return sessions.filter((s) => s.date === today);
}

export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce(
        (setTotal, set) => setTotal + (set.completed ? set.reps * set.weightKg : 0),
        0
      ),
    0
  );
}

export function sessionSetCount(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  );
}

export const commonExercises = [
  "Bench press",
  "Squat",
  "Deadlift",
  "Overhead press",
  "Barbell row",
  "Pull-up",
  "Lat pulldown",
  "Leg press",
  "Romanian deadlift",
  "Dumbbell curl",
  "Tricep pushdown",
  "Plank",
  "Zone 2 cardio",
];
