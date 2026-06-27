"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, FileText, Loader2, X } from "lucide-react";
import type { BloodTestAnalysis, BloodTestEntry } from "@/lib/blood-test";
import { statusColors } from "@/lib/blood-test";
import { useLocale } from "@/components/providers/LocaleProvider";

interface BloodTestUploaderProps {
  onSave: (entry: Omit<BloodTestEntry, "id" | "uploadedAt">) => void;
}

export function BloodTestUploader({ onSave }: BloodTestUploaderProps) {
  const { t, locale } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BloodTestAnalysis | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("health.invalidImage"));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError(t("health.imageTooLarge"));
      return;
    }
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/blood-test/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, locale }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("health.analyzeFailed"));

      setResult(data as BloodTestAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("health.analyzeFailed"));
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = () => {
    if (!result || !preview) return;
    onSave({ analysis: result, imageUrl: preview });
    reset();
  };

  return (
    <div className="glass rounded-2xl p-4 border border-rose-500/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">{t("health.bloodTestTitle")}</h2>
          <p className="text-xs text-zinc-500">{t("health.bloodTestHint")}</p>
        </div>
      </div>

      {!preview ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <Camera className="w-7 h-7 text-rose-400" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-zinc-300">{t("health.uploadReport")}</p>
            <p className="text-xs text-zinc-500 mt-1">{t("health.uploadHint")}</p>
          </div>
        </button>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={preview}
                alt={t("health.reportPreview")}
                className="w-full max-h-56 object-contain bg-black/20"
              />
              <button
                type="button"
                onClick={reset}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!result && (
              <button
                type="button"
                onClick={analyze}
                disabled={analyzing}
                className="w-full py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("health.extracting")}
                  </>
                ) : (
                  t("health.extractResults")
                )}
              </button>
            )}

            {result && (
              <div className="space-y-3">
                {(result.labName || result.testDate) && (
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    {result.labName && <span>{result.labName}</span>}
                    {result.testDate && (
                      <span>
                        {result.labName ? "· " : ""}
                        {result.testDate}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-zinc-300 leading-relaxed">{result.summary}</p>

                {result.flags.length > 0 && (
                  <div className="space-y-1.5">
                    {result.flags.map((flag) => (
                      <div
                        key={flag}
                        className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
                      >
                        {flag}
                      </div>
                    ))}
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl bg-white/[0.02] p-2">
                  {result.markers.map((marker) => (
                    <div
                      key={`${marker.name}-${marker.value}`}
                      className="flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded-lg hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-200 truncate">{marker.name}</p>
                        <p className="text-zinc-600">{t("health.refRange")}: {marker.referenceRange}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="font-semibold" style={{ color: statusColors[marker.status] }}>
                          {marker.value} {marker.unit}
                        </p>
                        <p className="text-[10px] capitalize text-zinc-500">
                          {t(`health.status.${marker.status}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {result.notes && <p className="text-xs text-zinc-500">{result.notes}</p>}

                <p className="text-[10px] text-zinc-600 leading-relaxed">{t("health.disclaimer")}</p>

                <button
                  type="button"
                  onClick={save}
                  className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {t("health.saveResults")}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
