const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Retries the Gemini call if it comes back with a 503 (model temporarily overloaded)
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);

    if (response.status !== 503) {
      return response; // success or a non-503 error — return immediately
    }

    if (attempt < retries) {
      console.log(`Model overloaded, retrying in ${delay}ms... (attempt ${attempt + 1})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      return response; // out of retries, return the last (503) response
    }
  }

  // unreachable, but keeps TypeScript happy
  return fetch(url, options);
}

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

    const MODEL_NAME = "gemini-flash-latest";

    console.log("Using Gemini model:", MODEL_NAME);

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);

      const isOverloaded = response.status === 503;
      return Response.json(
        {
          error: isOverloaded
            ? "Gemini is temporarily overloaded. Please try again in a few seconds."
            : "Gemini request failed",
        },
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