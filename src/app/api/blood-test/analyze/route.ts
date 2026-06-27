import { NextResponse } from "next/server";

const BLOOD_TEST_PROMPT_EN = `You are a clinical lab report analyst for the Sehi health app.

The user uploads a photo of a blood test / lab results report (may be printed paper, PDF screenshot, or lab portal export).

Extract all visible biomarkers and return ONLY valid JSON:
{
  "labName": "Lab or hospital name, or empty string",
  "testDate": "YYYY-MM-DD if visible, else null",
  "summary": "2-3 sentence plain-language summary of key findings",
  "markers": [
    {
      "name": "Marker name e.g. HbA1c, LDL, Vitamin D",
      "value": number or string if non-numeric,
      "unit": "unit e.g. mg/dL, %, mmol/L",
      "referenceRange": "reference range as printed",
      "status": "normal" | "low" | "high" | "unknown",
      "category": "metabolic" | "lipids" | "thyroid" | "vitamins" | "blood_count" | "liver" | "kidney" | "hormones" | "other"
    }
  ],
  "flags": ["Notable out-of-range or clinically significant findings as short strings"],
  "confidence": "high" | "medium" | "low",
  "notes": "Brief note on readability or missing data"
}

Rules:
- Read values exactly as shown when legible
- Infer status from reference ranges when possible
- Include all visible markers, not just abnormal ones
- Do not diagnose or prescribe — summarize only
- Never include markdown outside JSON`;

const BLOOD_TEST_PROMPT_AR = `أنت محلّل تقارير مختبر لتطبيق صحي.

المستخدم يرفع صورة لتقرير تحليل دم / نتائج مختبر.

استخرج كل المؤشرات الظاهرة وأرجع JSON فقط:
{
  "labName": "اسم المختبر أو المستشفى، أو نص فارغ",
  "testDate": "YYYY-MM-DD إذا ظاهر، وإلا null",
  "summary": "ملخص 2-3 جمل بلغة بسيطة بالعربية السعودية",
  "markers": [
    {
      "name": "اسم المؤشر",
      "value": رقم أو نص,
      "unit": "الوحدة",
      "referenceRange": "المدى المرجعي كما هو مطبوع",
      "status": "normal" | "low" | "high" | "unknown",
      "category": "metabolic" | "lipids" | "thyroid" | "vitamins" | "blood_count" | "liver" | "kidney" | "hormones" | "other"
    }
  ],
  "flags": ["نتائج خارج المدى أو مهمة سريرياً"],
  "confidence": "high" | "medium" | "low",
  "notes": "ملاحظة عن وضوح الصورة أو بيانات ناقصة بالعربية السعودية"
}

قواعد:
- اقرأ القيم كما هي إذا واضحة
- استنتج status من المدى المرجعي
- لا تشخّص ولا توصف علاج — لخّص فقط
- summary و notes و flags بالعربية السعودية الطبيعية`;

function normalizeAnalysis(parsed: Record<string, unknown>) {
  const markers = Array.isArray(parsed.markers)
    ? parsed.markers.map((m: Record<string, unknown>) => ({
        name: String(m.name ?? "Unknown"),
        value: typeof m.value === "number" ? m.value : String(m.value ?? "—"),
        unit: String(m.unit ?? ""),
        referenceRange: String(m.referenceRange ?? "—"),
        status: ["normal", "low", "high", "unknown"].includes(String(m.status))
          ? String(m.status)
          : "unknown",
        category: String(m.category ?? "other"),
      }))
    : [];

  return {
    labName: String(parsed.labName ?? ""),
    testDate: parsed.testDate ? String(parsed.testDate) : null,
    summary: String(parsed.summary ?? ""),
    markers,
    flags: Array.isArray(parsed.flags) ? parsed.flags.map(String) : [],
    confidence: ["high", "medium", "low"].includes(String(parsed.confidence))
      ? parsed.confidence
      : "medium",
    notes: parsed.notes ? String(parsed.notes) : "",
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const { image, locale } = (await req.json()) as {
      image: string;
      locale?: string;
    };

    if (!image?.startsWith("data:image/")) {
      return NextResponse.json({ error: "Valid base64 image required" }, { status: 400 });
    }

    const isArabic = locale === "ar-SA";
    const prompt = isArabic ? BLOOD_TEST_PROMPT_AR : BLOOD_TEST_PROMPT_EN;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image, detail: "high" } },
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI blood test error:", err);
      return NextResponse.json(
        { error: "Failed to analyze blood test" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 502 });
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json(normalizeAnalysis(parsed));
  } catch (error) {
    console.error("Blood test analyze error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
