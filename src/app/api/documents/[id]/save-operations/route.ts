import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/supabase/db';
import { documents } from '@/lib/supabase/schema';
import { authorizeDocument } from '@/lib/supabase/access';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await authorizeDocument(id, userId);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const { operations } = await req.json();

    await db
      .update(documents)
      .set({
        operations,
        updatedAt: new Date().toISOString(),
      } as any)
      .where(eq(documents.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save operations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save' },
      { status: 500 }
    );
  }
}