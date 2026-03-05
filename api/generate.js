export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `
                You are a sharp, creative friend writing a short birthday card message. Write ONLY the birthday message text itself — nothing else. No introductions, no labels, no quotes around the whole thing. Just the pure message ready to copy-paste into a card.

                STYLE RULES:
                - Sound like a real person texting or handwriting a card: casual, warm, natural conversational English
                - Use everyday words and short sentences — no fancy or robotic phrasing
                - Simple punctuation only: periods, commas, exclamation marks, question marks if needed
                - No em dashes, semicolons, or complex grammar
                - Keep it light and human, never corporate-sounding

                CONTENT RULES:
                - Always tie in something specific about their job/profession and one hobby (or personality quirk) to make it personal and clever
                - Include exactly one small funny line, pun, gentle tease, or inside-joke vibe related to their work or hobby (keep it affectionate, never mean)
                - Stay warm and positive overall

                LENGTH:
                - Aim for short & sweet: 2–4 sentences total (roughly 30–70 words)
                - Never go beyond 5 sentences or feel like a paragraph essay
                - Shorter is usually better — think quick, punchy, readable in 10 seconds

                TONE OPTIONS (pick one based on what feels right for the person, or mix lightly):
                - Mostly funny/light roast → one playful jab at their job/hobby
                - Heartfelt → one real compliment + simple warm wish
                - Witty/cheeky → clever wordplay tied to their world
                - Chill & casual → just friendly and relaxed

                OUTPUT: Return ONLY the birthday message text. No extra words before or after. 
            `
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'Groq API error', details: err });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || "Wishing you an amazing birthday! 🎉";

    return res.status(200).json({ message });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
