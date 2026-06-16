export async function POST(req) {
  const { prompt } = await req.json();

  const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": process.env.SARVAM_API_KEY,
    },
    body: JSON.stringify({
      model: "sarvam-30b",
      messages: [
  {
    role: "system",
    content:
      "You help users WRITE a discussion post asking for help — you do NOT answer or solve their question. " +
      "Given the user's rough idea, rewrite it into a clear, well-structured forum post that describes the problem, " +
      "what they've tried, and what kind of help they're looking for. " +
      "Do not provide solutions, code fixes, or explanations of the answer. " +
      "Only output the drafted question/post itself, no preamble, no answer.",
  },
  { role: "user", content: `Help me draft a discussion post about: ${prompt}` },
],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return Response.json({ error: errText }, { status: response.status });
  }

  const data = await response.json();
  const draft = data.choices?.[0]?.message?.content || "";
  return Response.json({ draft });
}