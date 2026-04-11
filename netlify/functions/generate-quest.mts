import { GoogleGenAI, Type } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { topic, difficulty } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate an RPG-style learning quest for the topic: "${topic}".
    The difficulty level is ${difficulty} (1-10).
    Create 5 challenging questions.
    Each question should have a thematic monster name related to the topic (e.g., if the topic is Math, a monster could be "The Fraction Hydra").
    The explanation should be written in the style of a wise RPG mentor NPC.
    Return the data in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            difficulty: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  monsterName: { type: Type.STRING },
                },
                required: [
                  "question",
                  "options",
                  "correctAnswer",
                  "explanation",
                  "monsterName",
                ],
              },
            },
          },
          required: ["topic", "difficulty", "questions"],
        },
      },
    });

    const responseText = response.text ?? "{}";

    return new Response(responseText, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Function Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
