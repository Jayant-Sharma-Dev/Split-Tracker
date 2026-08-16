const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Preflight request handle karna zaroori hai
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return Response.json(
        { error: "Expense text is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    const prompt = `
You are an expense parsing assistant.

Convert the user's expense description into JSON.

Return ONLY valid JSON in this exact structure:

{
  "title": string,
  "amount": number,
  "paidBy": string,
  "participants": string[],
  "category": string,
  "date": string,
  "notes": string
}

Rules:
- amount must be a number
- participants must be an array of names
- category should be one of: Food, Travel, Shopping, Entertainment, Other
- If date is not provided, use today's date
- Do not calculate settlements
- Do not calculate who owes whom

User input:
${text}
`;
 
   const MODEL_NAME ="gemini-3.6-flash";

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
  
    console.log("Using Gemini model:", MODEL_NAME);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);
      return Response.json(
        { error: "Gemini request failed" },
        { status: 500, headers: corsHeaders }
      );
    }

    const rawText = await response.text();

    if (!rawText.trim()) {
      return Response.json(
        { error: "Gemini returned an empty response" },
        { status: 500, headers: corsHeaders }
      );
    }

    let result: any;
    try {
      result = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Gemini JSON parse error:", parseError, rawText);
      return Response.json(
        { error: "Gemini returned invalid JSON" },
        { status: 500, headers: corsHeaders }
      );
    }

    const parts = result?.candidates?.[0]?.content?.parts ?? [];
    const generatedText = parts
      .map((part: { text?: string }) => part?.text ?? "")
      .join("\n")
      .trim();

    if (!generatedText) {
      return Response.json(
        { error: "Gemini returned no result" },
        { status: 500, headers: corsHeaders }
      );
    }

    const candidateText = generatedText
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : candidateText;

    let expense;
    try {
      expense = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, jsonText);
      return Response.json(
        { error: "Gemini returned malformed JSON" },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!expense || typeof expense !== "object") {
      return Response.json(
        { error: "Gemini did not return a valid expense object" },
        { status: 500, headers: corsHeaders }
      );
    }

    return Response.json(
      { success: true, expense },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Function error:", error);
    return Response.json(
      { error: "Failed to parse expense" },
      { status: 500, headers: corsHeaders }
    );
  }
});