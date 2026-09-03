import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { messages, workspaceId, documentTitle, context } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response('messages required', { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return new Response('Missing OPENROUTER_API_KEY', { status: 500 });

  const modelName =
    process.env.OPENROUTER_FREE_ONLY === 'false'
      ? 'anthropic/claude-sonnet-4'
      : 'openrouter/free';

  const system = `You are BookGenerator's 360° writing agent — Notion meets ChatGPT Canvas. 
You help authors write, polish, outline, research, and design books.
Context:
- Workspace: ${workspaceId || 'unknown'}
- Current book: ${documentTitle || 'untitled'}
- Book excerpt: ${(context || '').slice(0, 4000)}
Rules:
- Be concise, actionable, premium.
- Never hallucinate citations; omit if unknown.
- Offer diff-style suggestions when polishing.
- If asked to generate, output JSON when requested, otherwise markdown.`;

  const openRouterMessages = [
    { role: 'system', content: system },
    ...messages.map((m: any) => ({ role: m.role, content: m.content })),
  ];

  // Non-streaming for now (streaming via Vercel AI SDK can be added when deps installed)
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'BookGenerator SaaS',
    },
    body: JSON.stringify({
      model: modelName,
      messages: openRouterMessages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(err, { status: res.status });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || 'No response';

  return new Response(JSON.stringify({ content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}