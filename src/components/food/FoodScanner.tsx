"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Package, UtensilsCrossed, X, Check } from "lucide-react";
import type { FoodAnalysisResult, FoodEntry } from "@/lib/food";
import { inferMealType } from "@/lib/food";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

interface FoodScannerProps {
  onSave: (entry: Omit<FoodEntry, "id" | "loggedAt">) => void;
}

type ScanType = "meal" | "label";

export function FoodScanner({ onSave }: FoodScannerProps) {
  const { t, locale } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanType, setScanType] = useState<ScanType>("meal");
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [edited, setEdited] = useState<FoodAnalysisResult | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("food.invalidImage"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError(t("food.imageTooLarge"));
      return;
    }
    setError(null);
    setResult(null);
    setEdited(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/food/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, scanType, locale }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("foodErrors.analyzeFailed"));

      setResult(data);
      setEdited(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("foodErrors.analyzeImageFailed"));
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setEdited(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = () => {
    if (!edited || !preview) return;
    onSave({
      name: edited.name,
      servingSize: edited.servingSize,
      mealType: inferMealType(),
      macros: edited.macros,
      imageUrl: preview,
      source: "scan",
      confidence: edited.confidence,
    });
    reset();
  };

  const updateMacro = (key: keyof FoodAnalysisResult["macros"], value: string) => {
    if (!edited) return;
    setEdited({
      ...edited,
      macros: { ...edited.macros, [key]: parseFloat(value) || 0 },
    });
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex gap-2 mb-4">
        {(
          [
            { type: "meal" as ScanType, icon: UtensilsCrossed, label: t("food.mealPhoto") },
            { type: "label" as ScanType, icon: Package, label: t("food.nutritionLabel") },
          ] as const
        ).map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setScanType(type);
              reset();
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors",
              scanType === type
                ? "bg-orange-500/15 border-orange-500/30 text-orange-300"
                : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {!preview ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Camera className="w-7 h-7 text-orange-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">
              {scanType === "label" ? t("food.scanLabel") : t("food.scanMeal")}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{t("food.cameraHint")}</p>
          </div>
        </button>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img src={preview} alt="Food preview" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={reset}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!edited && (
              <button
                type="button"
                onClick={analyze}
                disabled={analyzing}
                className="w-full py-3 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("common.analyzing")}
                  </>
                ) : (
                  <>{t("common.analyze")} {scanType === "label" ? "" : ""}</>
                )}
              </button>
            )}

            {edited && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={edited.name}
                  onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500/40"
                />
                <input
                  type="text"
                  value={edited.servingSize}
                  onChange={(e) => setEdited({ ...edited, servingSize: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-400 outline-none focus:border-orange-500/40"
                  placeholder={t("food.servingSize")}
                />
                <div className="grid grid-cols-2 gap-2">
                  {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
                    <div key={key} className="bg-white/[0.03] rounded-xl p-2">
                      <label className="text-[10px] text-zinc-500 uppercase capitalize">{key}</label>
                      <input
                        type="number"
                        value={edited.macros[key]}
                        onChange={(e) => updateMacro(key, e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-zinc-200 outline-none mt-0.5"
                      />
                    </div>
                  ))}
                </div>
                {result?.notes && (
                  <p className="text-xs text-zinc-500">{result.notes}</p>
                )}
                <button
                  type="button"
                  onClick={save}
                  className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {t("common.logFood")}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture={scanType === "label" ? undefined : "environment"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
