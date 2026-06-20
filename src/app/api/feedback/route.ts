import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { feedback: "AI feedback is unavailable. Please configure your OpenAI API key." },
      { status: 200 }
    );
  }

  try {
    const { mistake, repCount } = await request.json();

    const prompt = `You are a certified personal trainer and exercise form coach. A user just completed ${repCount} squats. Their most common form mistake was: "${mistake}". Give a short (2-3 sentences), actionable explanation of what this mistake means, why it's a problem, and one specific cue or drill they can use to fix it next time. Be encouraging but direct.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { feedback: "Could not generate feedback. Please try again." },
        { status: 200 }
      );
    }

    const data = await res.json();
    const feedback = data.choices?.[0]?.message?.content ?? "No feedback generated.";

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Feedback route error:", err);
    return NextResponse.json(
      { feedback: "An error occurred while generating feedback." },
      { status: 500 }
    );
  }
}
