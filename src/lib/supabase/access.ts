import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import db from './db';
import { collaborators, documents, workspaces } from './schema';

export const requireUserId = async (): Promise<string | null> => {
  const { userId } = await auth();
  return userId ?? null;
};

export const authorizeWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<boolean> => {
  if (!workspaceId || !userId) return false;

  const owned = await db.query.workspaces.findFirst({
    where: (w, { eq }) => eq(w.id, workspaceId),
    columns: { workspaceOwner: true },
  });
  if (owned && owned.workspaceOwner === userId) return true;

  const collab = await db.query.collaborators.findFirst({
    where: (c, { eq }) =>
      and(eq(c.workspaceId, workspaceId), eq(c.userId, userId)),
  });
  return !!collab;
};

export const authorizeDocument = async (
  documentId: string,
  userId: string
): Promise<boolean> => {
  if (!documentId || !userId) return false;

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
    columns: { workspaceId: true },
  });
  if (!doc) return false;

  return authorizeWorkspace(doc.workspaceId, userId);
};