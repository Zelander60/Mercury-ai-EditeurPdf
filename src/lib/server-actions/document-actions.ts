'use server';

import db from '@/lib/supabase/db';
import { documents } from '@/lib/supabase/schema';
import { revalidatePath } from 'next/cache';
import { InferInsertModel, eq, gte } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { authorizeDocument, authorizeWorkspace } from '@/lib/supabase/access';

type NewDocument = InferInsertModel<typeof documents>;

const FREE_LIMIT = 5;

export const createDocument = async (input: Partial<NewDocument>) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { data: null, error: 'Please log in first' };
    }

    if (!input.workspaceId) {
      return { data: null, error: 'Workspace is required' };
    }
    const allowed = await authorizeWorkspace(input.workspaceId, userId);
    if (!allowed) {
      return { data: null, error: 'Workspace not found' };
    }

    // Check subscription for free-tier limit
    const { data: subscription } = await getUserSubscriptionStatus(userId);
    const isPaid =
      subscription?.status === 'active' || subscription?.status === 'trialing';

    // Enforce free limit (5 books/month) unless on a paid plan
    if (!isPaid) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const countRes = await db
        .select({ id: documents.id })
        .from(documents)
        .where(gte(documents.createdAt, monthStart.toISOString()));

      if (countRes.length >= FREE_LIMIT) {
        return {
          data: null,
          error: `Free plan allows ${FREE_LIMIT} books per month. Upgrade to Pro for unlimited books.`,
        };
      }
    }

    const [doc] = await db
      .insert(documents)
      .values({
        workspaceId: input.workspaceId!,
        title: input.title || 'Untitled Book',
        subtitle: input.subtitle,
        type: input.type || 'ebook',
        status: input.status || 'draft',
        contentJson: input.contentJson || {
          title: input.title || 'Untitled Book',
          subtitle: input.subtitle || '',
          chapters: [],
        },
        coverConfig: input.coverConfig,
      } as NewDocument)
      .returning();
    revalidatePath(`/dashboard/${input.workspaceId}/documents`);
    return { data: doc, error: null };
  } catch (error: any) {
    console.error('Create document error:', error);
    return { data: null, error: error.message || 'Error' };
  }
};

export const updateDocument = async (
  documentId: string,
  input: Partial<NewDocument>
) => {
  try {
    const { userId } = await auth();
    if (!userId) return { data: null, error: 'Please log in first' };

    const allowed = await authorizeDocument(documentId, userId);
    if (!allowed) return { data: null, error: 'Document not found' };

    const [doc] = await db
      .update(documents)
      .set({
        ...input,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, documentId))
      .returning();
    return { data: doc, error: null };
  } catch (error: any) {
    console.error('Update document error:', error);
    return { data: null, error: error.message || 'Error' };
  }
};

export const getDocument = async (documentId: string) => {
  try {
    const { userId } = await auth();
    if (!userId) return { data: null, error: 'Please log in first' };

    const allowed = await authorizeDocument(documentId, userId);
    if (!allowed) return { data: null, error: 'Document not found' };

    const doc = await db.query.documents.findFirst({
      where: (d, { eq }) => eq(d.id, documentId),
    });
    return { data: doc, error: null };
  } catch (error: any) {
    console.error('Get document error:', error);
    return { data: null, error: error.message || 'Error' };
  }
};
