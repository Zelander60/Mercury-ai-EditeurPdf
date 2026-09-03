'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq } from 'drizzle-orm';
import db from '@/lib/supabase/db';
import { workflows } from '@/lib/supabase/schema';
import { authorizeWorkspace } from '@/lib/supabase/access';

export interface StoredWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  graph: any | null;
  createdAt: string;
  updatedAt: string;
}

export const saveWorkflow = async (
  workspaceId: string,
  input: { id?: string; name: string; description: string; graph: any }
): Promise<{ data: StoredWorkflow | null; error: string | null }> => {
  try {
    const { userId } = await auth();
    if (!userId) return { data: null, error: 'Please log in first' };

    const allowed = await authorizeWorkspace(workspaceId, userId);
    if (!allowed) return { data: null, error: 'Workspace not found' };

    if (!input?.name?.trim()) {
      return { data: null, error: 'Name is required' };
    }

    if (input.id) {
      const [updated] = await db
        .update(workflows)
        .set({
          name: input.name.trim(),
          description: input.description || '',
          graph: input.graph,
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(workflows.id, input.id), eq(workflows.workspaceId, workspaceId)))
        .returning();
      if (updated) return { data: updated as StoredWorkflow, error: null };
    }

    const [created] = await db
      .insert(workflows)
      .values({
        workspaceId,
        name: input.name.trim(),
        description: input.description || '',
        graph: input.graph,
      })
      .returning();
    return { data: created as StoredWorkflow, error: null };
  } catch (error: any) {
    console.error('Save workflow error:', error);
    return { data: null, error: error.message || 'Failed to save workflow' };
  }
};

export const listWorkflows = async (
  workspaceId: string
): Promise<{ data: StoredWorkflow[]; error: string | null }> => {
  try {
    const { userId } = await auth();
    if (!userId) return { data: [], error: 'Please log in first' };

    const allowed = await authorizeWorkspace(workspaceId, userId);
    if (!allowed) return { data: [], error: 'Workspace not found' };

    const rows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.workspaceId, workspaceId))
      .orderBy(desc(workflows.updatedAt));
    return { data: rows as StoredWorkflow[], error: null };
  } catch (error: any) {
    console.error('List workflows error:', error);
    return { data: [], error: error.message || 'Failed to list workflows' };
  }
};

export const deleteWorkflow = async (
  workspaceId: string,
  workflowId: string
): Promise<{ data: null; error: string | null }> => {
  try {
    const { userId } = await auth();
    if (!userId) return { data: null, error: 'Please log in first' };

    const allowed = await authorizeWorkspace(workspaceId, userId);
    if (!allowed) return { data: null, error: 'Workspace not found' };

    await db
      .delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)));
    return { data: null, error: null };
  } catch (error: any) {
    console.error('Delete workflow error:', error);
    return { data: null, error: error.message || 'Failed to delete workflow' };
  }
};