/**
 * AI Content Generator
 * Uses OpenRouter API to generate book content from a description.
 * Supports multiple models: Claude, GPT-4, Gemini, etc.
 */

export interface GenerateBookInput {
  title: string;
  subtitle?: string;
  description: string;
  genre?: string;
  language?: string;
  chapters?: number;
  style?: 'academic' | 'casual' | 'professional' | 'creative';
  model?: string;
  fontBody?: string;
  fontHeading?: string;
}

export interface GeneratedChapter {
  title: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
    callout?: { title: string; text: string };
    framework?: { name: string; steps: string[] };
    statistic?: { value: string; source: string };
  }>;
  actionSteps?: string[];
}

export interface GeneratedBook {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  lang: string;
  fontBody?: string;
  fontHeading?: string;
  chapters: GeneratedChapter[];
}

const SYSTEM_PROMPT = `You are a professional book content generator. Given a book description, title, and genre, generate high-quality book chapters in JSON format.

Output ONLY valid JSON (no markdown, no code fences). The JSON structure must be:

{
  "title": "Book Title",
  "subtitle": "Book Subtitle",
  "chapters": [
    {
      "title": "Chapter Title",
      "sections": [
        {
          "heading": "Section Heading",
          "paragraphs": ["Paragraph 1 text...", "Paragraph 2 text..."],
          "bullets": ["Point 1", "Point 2"],
          "callout": { "title": "Key Insight", "text": "Important takeaway..." },
          "framework": { "name": "Framework Name", "steps": ["Step 1", "Step 2", "Step 3"] },
          "statistic": { "value": "73%", "source": "Verified Source" }
        }
      ],
      "actionSteps": ["Action 1: Do this...", "Action 2: Do that..."]
    }
  ]
}

Guidelines:
- Each chapter should have 2-4 sections
- Each section should have 2-3 paragraphs of 3-5 sentences each
- Include practical examples and actionable advice
- Only include statistics with verifiable sources; if unknown, omit the statistic field
- Include frameworks and mental models
- End each chapter with action steps
- Write in a clear, engaging style
- Total content should be substantial (3000+ words per chapter)
- Never invent fake citations — omit rather than hallucinate`;

function escapePrompt(s: string) {
  return s.replace(/```/g, '').replace(/###/g, '').slice(0, 4000);
}

function buildPrompt(input: GenerateBookInput): string {
  const chapters = input.chapters || 8;
  const genre = input.genre || 'non-fiction';
  const style = input.style || 'professional';
  const language = input.language || 'en';

  return `Generate a complete ${genre} book with the following details:

###TITLE###
${escapePrompt(input.title)}
###END_TITLE###

###SUBTITLE###
${escapePrompt(input.subtitle || '')}
###END_SUBTITLE###

###DESCRIPTION###
${escapePrompt(input.description)}
###END_DESCRIPTION###

Language: ${language}
Style: ${style}
Number of chapters: ${chapters}

Requirements:
- Each chapter must have 2-4 sections with multiple paragraphs
- Include practical examples, case studies, and actionable advice
- Use frameworks and callout boxes where appropriate
- Only include statistics if verifiable; otherwise omit
- End each chapter with 3-5 action steps
- Write in an engaging, authoritative ${style} tone
- Content should be substantial and valuable

Generate the complete book content in JSON format.`;
}

export async function generateBookContent(
  input: GenerateBookInput,
  apiKey?: string
): Promise<GeneratedBook> {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OpenRouter API key required. Set OPENROUTER_API_KEY in .env');
  }

  const { getModel, getHeaders } = await import('./router');
  const model = input.model || getModel('draft', true) || 'openrouter/free';
  const prompt = buildPrompt(input);
  const headers = getHeaders();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': headers['HTTP-Referer'],
      'X-Title': headers['X-Title'],
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from AI');
  }

  // Parse JSON from response (handle markdown code fences)
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const book = JSON.parse(jsonStr) as GeneratedBook;

    // Ensure required fields
    book.title = book.title || input.title;
    book.subtitle = book.subtitle || input.subtitle || '';
    book.author = book.author || 'Peter Lompo';
    book.publisher = book.publisher || 'Pierre Studio';
    book.lang = book.lang || input.language || 'en';
    book.fontBody = input.fontBody || 'Lora';
    book.fontHeading = input.fontHeading || 'PlayfairDisplay';

    return book;
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${(e as Error).message}`);
  }
}

export async function generateChapterOutline(
  title: string,
  description: string,
  chapterCount: number = 8,
  apiKey?: string
): Promise<Array<{ title: string; summary: string }>> {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OpenRouter API key required');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'BookGenerator SaaS',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content: 'You are a book outline generator. Output ONLY valid JSON array of objects with "title" and "summary" fields. No markdown, no code fences.',
        },
        {
          role: 'user',
          content: `Generate a ${chapterCount}-chapter outline for a book titled "${title}". Description: ${description}. Output as JSON array: [{"title": "Chapter 1: ...", "summary": "Brief summary..."}]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('No outline generated');

  let jsonStr = content;
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(jsonStr);
}
