/**
 * OpenRouter Free Router
 * Uses generic openrouter:free routing — not one specific model.
 * When OPENROUTER_FREE_ONLY=true, we return the generic free identifier
 * so OpenRouter auto-routes to any available free model (e.g. :free suffix).
 * Fallback to specific :free models only if generic is unavailable.
 */

export type Task = 'draft' | 'polish' | 'chat' | 'outline' | 'research' | 'vision';

const FREE_GENERIC = 'openrouter/free';

const FREE_MAP: Record<Task, string> = {
  outline: FREE_GENERIC,
  draft: FREE_GENERIC,
  polish: FREE_GENERIC,
  chat: FREE_GENERIC,
  research: FREE_GENERIC,
  vision: FREE_GENERIC,
};

// Legacy specific :free models kept as fallback if generic fails
export const FREE_FALLBACKS: Record<Task, string> = {
  outline: 'google/gemini-2.0-flash-001:free',
  draft: 'meta-llama/llama-3.3-70b:free',
  polish: 'qwen/qwen-2.5-7b:free',
  chat: 'deepseek/deepseek-r1:free',
  research: 'perplexity/sonar:free',
  vision: 'google/gemini-2.0-flash-exp:free',
};

const PREMIUM_FALLBACK: Record<Task, string> = {
  outline: 'anthropic/claude-3.5-haiku',
  draft: 'anthropic/claude-sonnet-4',
  polish: 'anthropic/claude-3.5-haiku',
  chat: 'anthropic/claude-sonnet-4',
  research: 'openai/gpt-4o-mini',
  vision: 'openai/gpt-4o',
};

export function getModel(task: Task, preferFree = true): string {
  if (preferFree && process.env.OPENROUTER_FREE_ONLY !== 'false') {
    return FREE_MAP[task] ?? FREE_GENERIC;
  }
  return PREMIUM_FALLBACK[task] ?? PREMIUM_FALLBACK.draft;
}

export function getHeaders() {
  return {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'BookGenerator SaaS',
  };
}