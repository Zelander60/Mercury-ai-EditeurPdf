import { NextRequest, NextResponse } from 'next/server';
import { generateBookContent, GenerateBookInput } from '@/lib/ai/content-generator';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const input: GenerateBookInput = {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      genre: body.genre,
      language: body.language,
      chapters: body.chapters,
      style: body.style,
      model: body.model,
      fontBody: body.fontBody,
      fontHeading: body.fontHeading,
    };

    if (!input.title || !input.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const book = await generateBookContent(input);

    return NextResponse.json({ data: book, error: null });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
