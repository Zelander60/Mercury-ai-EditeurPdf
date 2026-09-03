import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/supabase/db';
import { documents } from '@/lib/supabase/schema';
import { authorizeWorkspace } from '@/lib/supabase/access';
import { eq } from 'drizzle-orm';

// @ts-ignore
import { buildBook } from '@/lib/doc-engine/book-builder';
import { exportWithOperations } from '@/lib/doc-engine/pdf-operations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse optional operations and font selection from body
    let operations: any[] = [];
    let fontBody: string | undefined;
    let fontHeading: string | undefined;
    try {
      const body = await req.json();
      operations = body.operations || [];
      fontBody = body.fontBody;
      fontHeading = body.fontHeading;
    } catch (e) {
      // No body or invalid JSON - use saved operations
    }

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const allowed = await authorizeWorkspace(doc.workspaceId, userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const book = (doc.contentJson as any) || {
      title: doc.title,
      subtitle: doc.subtitle || '',
      chapters: [],
    };

    // Ensure title/subtitle from DB are used if not in content_json
    book.title = book.title || doc.title;
    book.subtitle = book.subtitle || doc.subtitle || '';
    if (doc.coverConfig) {
      book.cover = { ...(book.cover || {}), ...(doc.coverConfig as any) };
    }

    // Apply font selection (request > saved contentJson > default)
    if (fontBody) book.fontBody = fontBody;
    if (fontHeading) book.fontHeading = fontHeading;
    // Also propagate to cover if needed
    if (fontBody || fontHeading) {
      book.cover = {
        ...(book.cover || {}),
        fontBody: book.fontBody,
        fontHeading: book.fontHeading,
      };
    }

    // If book has no chapters but has raw content, ensure engine can handle
    let pdfBytes: Uint8Array;
    try {
      const result = await buildBook(book);
      pdfBytes = result.pdfBytes as Uint8Array;
    } catch (e: any) {
      console.error('buildBook failed, retrying with StandardFonts fallback:', e.message);
      // Force fallback by clearing custom fonts if error is font-related
      if (e.message?.includes('Font') || e.message?.includes('ENOENT')) {
        delete book.fontBody;
        delete book.fontHeading;
        if (book.cover) {
          delete book.cover.fontBody;
          delete book.cover.fontHeading;
        }
        const retry = await buildBook(book);
        pdfBytes = retry.pdfBytes as Uint8Array;
      } else {
        throw e;
      }
    }

    // Apply operations if any
    let finalBytes = pdfBytes;
    const savedOps = (doc as any).operations || [];
    const allOps = operations.length ? operations : savedOps;
    if (allOps.length) {
      finalBytes = await exportWithOperations(new Uint8Array(pdfBytes), allOps);
    }

    return new NextResponse(new Uint8Array(finalBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export document' },
      { status: 500 }
    );
  }
}
