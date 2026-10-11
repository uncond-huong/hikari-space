// netlify/functions/gemini.mjs
export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const API_KEY = process.env.GEMINI_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "Chưa cài GEMINI_KEY trên Netlify!" }), { status: 500 });
  }

  try {
    const { systemInstruction, prompt } = await req.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Lỗi kết nối Gemini API" }), { status: 500 });
  }
};