"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Dumbbell, Plus, Save, Trash2 } from "lucide-react";
import {
  commonExercises,
  createEmptyExercise,
  createEmptySession,
  createEmptySet,
  getTodaySessions,
  loadWorkoutSessionsAsync,
  saveWorkoutSessionsAsync,
  sessionSetCount,
  type WorkoutExercise,
  type WorkoutSession,
} from "@/lib/workouts";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export function WorkoutLogger() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [active, setActive] = useState<WorkoutSession | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadWorkoutSessionsAsync(user?.userId).then(setSessions);
  }, [user?.userId]);

  const persist = useCallback(
    (next: WorkoutSession[]) => {
      setSessions(next);
      saveWorkoutSessionsAsync(next, user?.userId);
    },
    [user?.userId]
  );

  const startSession = () => {
    setActive(createEmptySession(t("workouts.defaultSessionName")));
  };

  const saveSession = () => {
    if (!active || active.exercises.length === 0) return;
    const existing = sessions.findIndex((s) => s.id === active.id);
    const next =
      existing >= 0
        ? sessions.map((s, i) => (i === existing ? active : s))
        : [active, ...sessions];
    persist(next);
    setActive(null);
  };

  const addExercise = (name: string) => {
    if (!active) return;
    setActive({
      ...active,
      exercises: [...active.exercises, createEmptyExercise(name)],
    });
  };

  const updateExercise = (exId: string, exercise: WorkoutExercise) => {
    if (!active) return;
    setActive({
      ...active,
      exercises: active.exercises.map((e) => (e.id === exId ? exercise : e)),
    });
  };

  const removeExercise = (exId: string) => {
    if (!active) return;
    setActive({
      ...active,
      exercises: active.exercises.filter((e) => e.id !== exId),
    });
  };

  const deleteSession = (id: string) => {
    persist(sessions.filter((s) => s.id !== id));
  };

  const todaySessions = getTodaySessions(sessions);
  const pastSessions = sessions.filter((s) => !todaySessions.some((t) => t.id === s.id));

  if (active) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            value={active.name ?? ""}
            onChange={(e) => setActive({ ...active, name: e.target.value })}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-orange-500/40"
            placeholder={t("workouts.sessionName")}
          />
          <button
            type="button"
            onClick={() => setActive(null)}
            className="px-3 py-2.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            {t("workouts.cancel")}
          </button>
        </div>

        <AnimatePresence>
          {active.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onChange={(e) => updateExercise(exercise.id, e)}
              onRemove={() => removeExercise(exercise.id)}
              t={t}
            />
          ))}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2">
          {commonExercises.slice(0, 6).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => addExercise(name)}
              className="text-xs px-3 py-1.5 rounded-full glass glass-hover text-zinc-400 hover:text-zinc-200"
            >
              + {name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addExercise("")}
          className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-sm text-zinc-500 hover:text-zinc-300 hover:border-white/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("workouts.addExercise")}
        </button>

        <button
          type="button"
          onClick={saveSession}
          disabled={active.exercises.length === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {t("workouts.saveSession")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todaySessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {t("workouts.today")}
          </h3>
          {todaySessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={() => setActive(session)}
              onDelete={() => deleteSession(session.id)}
              t={t}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={startSession}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/25 text-orange-300 text-sm font-medium flex items-center justify-center gap-2 hover:from-orange-500/25 transition-colors"
      >
        <Dumbbell className="w-5 h-5" /> {t("workouts.startSession")}
      </button>

      {pastSessions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 mb-2"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
            {t("workouts.history", { count: pastSessions.length })}
          </button>
          {showHistory && (
            <div className="space-y-2">
              {pastSessions.slice(0, 10).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={() => setActive(session)}
                  onDelete={() => deleteSession(session.id)}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onEdit,
  onDelete,
  t,
}: {
  session: WorkoutSession;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const sets = sessionSetCount(session);
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
        <Dumbbell className="w-4 h-4 text-orange-400" />
      </div>
      <button type="button" onClick={onEdit} className="flex-1 text-start min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{session.name ?? t("workouts.defaultSessionName")}</p>
        <p className="text-xs text-zinc-500">
          {session.date} · {session.exercises.length} {t("workouts.exercises")} · {sets} {t("workouts.sets")}
        </p>
      </button>
      <button type="button" onClick={onDelete} className="p-2 text-zinc-600 hover:text-red-400">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function ExerciseCard({
  exercise,
  onChange,
  onRemove,
  t,
}: {
  exercise: WorkoutExercise;
  onChange: (e: WorkoutExercise) => void;
  onRemove: () => void;
  t: (key: string) => string;
}) {
  const updateSet = (idx: number, field: "reps" | "weightKg" | "completed", value: number | boolean) => {
    const sets = exercise.sets.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    onChange({ ...exercise, sets });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="glass rounded-xl p-4 border border-orange-500/10"
    >
      <div className="flex items-center gap-2 mb-3">
        <input
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          placeholder={t("workouts.exerciseName")}
          className="flex-1 bg-transparent text-sm font-medium text-zinc-200 outline-none placeholder:text-zinc-600"
        />
        <button type="button" onClick={onRemove} className="p-1 text-zinc-600 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-[10px] text-zinc-500 uppercase tracking-wider mb-1 px-1">
        <span>#</span>
        <span>{t("workouts.reps")}</span>
        <span>{t("workouts.weight")}</span>
        <span>✓</span>
      </div>

      {exercise.sets.map((set, idx) => (
        <div key={idx} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 mb-1.5 items-center">
          <span className="text-xs text-zinc-600 ps-1">{idx + 1}</span>
          <input
            type="number"
            min={0}
            value={set.reps}
            onChange={(e) => updateSet(idx, "reps", Number.parseInt(e.target.value, 10) || 0)}
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-sm text-zinc-200 outline-none"
          />
          <input
            type="number"
            min={0}
            step={0.5}
            value={set.weightKg}
            onChange={(e) => updateSet(idx, "weightKg", Number.parseFloat(e.target.value) || 0)}
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-sm text-zinc-200 outline-none"
          />
          <input
            type="checkbox"
            checked={set.completed}
            onChange={(e) => updateSet(idx, "completed", e.target.checked)}
            className="w-4 h-4 accent-orange-500 justify-self-center"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange({ ...exercise, sets: [...exercise.sets, createEmptySet()] })}
        className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> {t("workouts.addSet")}
      </button>
    </motion.div>
  );
}
