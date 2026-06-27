import { NextResponse } from "next/server";

const FOOD_ANALYSIS_PROMPT_EN = `You are a nutrition expert analyzing food images for the Sehi health app.

The user may send:
1. A photo of a meal/plate of food
2. A photo of a nutrition facts label on packaging (often the back of the package)

Analyze the image and return ONLY valid JSON with this exact structure:
{
  "name": "Food or product name",
  "servingSize": "e.g. 1 cup, 100g, 1 package",
  "macros": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  },
  "confidence": "high" | "medium" | "low",
  "notes": "Brief note about estimation or label reading"
}

Rules:
- All macro values are numbers (grams for protein/carbs/fat/fiber, kcal for calories)
- If nutrition label visible, read it accurately for the serving shown
- If meal photo, estimate reasonable portions; set confidence to medium or low
- If unclear, do your best estimate and note uncertainty in notes
- Never include markdown or extra text outside the JSON`;

const FOOD_ANALYSIS_PROMPT_AR = `أنت خبير تغذية تحلّل صور أكل لتطبيق صحي.

قد يرسل المستخدم:
1. صورة وجبة/طبق أكل
2. صورة ملصق القيم الغذائية على العبوة (غالباً ظهر العبوة)

حلّل الصورة وأرجع JSON فقط بهذا الشكل بالضبط:
{
  "name": "اسم الأكل أو المنتج بالعربية (لهجة سعودية)",
  "servingSize": "مثال: كوب واحد، 100غ، عبوة واحدة",
  "macros": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  },
  "confidence": "high" | "medium" | "low",
  "notes": "ملاحظة مختصرة عن التقدير أو قراءة الملصق بالعربية السعودية"
}

قواعد:
- كل قيم الماكرو أرقام (غرام للبروتين/الكارب/الدهون/الألياف، سعرة للسعرات)
- إذا الملصق ظاهر، اقرأه بدقة للحصة المعروضة
- إذا صورة وجبة، قدّر حصة معقولة؛ خلّ الثقة medium أو low
- إذا مو واضح، قدّر بأفضل ما تقدر واذكر عدم اليقين في notes
- لا تضف markdown أو نص خارج JSON
- استخدم عربية سعودية طبيعية (مثل: وش، الحين، زين) في name و notes`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const { image, scanType, locale } = (await req.json()) as {
      image: string;
      scanType: "meal" | "label";
      locale?: string;
    };

    if (!image?.startsWith("data:image/")) {
      return NextResponse.json({ error: "Valid base64 image required" }, { status: 400 });
    }

    const isArabic = locale === "ar-SA";
    const basePrompt = isArabic ? FOOD_ANALYSIS_PROMPT_AR : FOOD_ANALYSIS_PROMPT_EN;

    const scanHint = isArabic
      ? scanType === "label"
        ? "هذي صورة ملصق غذائي / عبوة. اقرأ جدول القيم الغذائية."
        : "هذي صورة وجبة. قدّر الماكرو للحصة الظاهرة."
      : scanType === "label"
        ? "This is a nutrition label / packaging photo. Read the nutrition facts panel."
        : "This is a meal photo. Estimate macros for the visible portion.";

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
              { type: "text", text: `${basePrompt}\n\n${scanHint}` },
              { type: "image_url", image_url: { url: image, detail: "high" } },
            ],
          },
        ],
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI vision error:", err);
      return NextResponse.json(
        { error: "Failed to analyze food image" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 502 });
    }

    const parsed = JSON.parse(raw);

    return NextResponse.json({
      name: String(parsed.name ?? (isArabic ? "أكل غير معروف" : "Unknown food")),
      servingSize: String(parsed.servingSize ?? (isArabic ? "حصة واحدة" : "1 serving")),
      macros: {
        calories: Number(parsed.macros?.calories ?? 0),
        protein: Number(parsed.macros?.protein ?? 0),
        carbs: Number(parsed.macros?.carbs ?? 0),
        fat: Number(parsed.macros?.fat ?? 0),
        fiber: Number(parsed.macros?.fiber ?? 0),
      },
      confidence: parsed.confidence ?? "medium",
      notes: parsed.notes ?? "",
    });
  } catch (error) {
    console.error("Food analyze error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
