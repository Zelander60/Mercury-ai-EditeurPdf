'use client';

import React, { useCallback, useEffect, useState, use } from 'react';
import { WorkflowBuilder } from '@/components/workflow/workflow-builder';
import { Workflow, WorkflowRunResult } from '@/lib/workflow/engine';
import {
  deleteWorkflow,
  listWorkflows,
  saveWorkflow,
} from '@/lib/server-actions/workflow-actions';
import { useToast } from '@/components/ui/use-toast';

export default function WorkflowPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const { toast } = useToast();
  const [saved, setSaved] = useState<
    { id: string; name: string; updatedAt: string }[]
  >([]);
  const [runResult, setRunResult] = useState<WorkflowRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const refreshList = useCallback(async () => {
    const { data } = await listWorkflows(workspaceId);
    setSaved(
      (data || []).map((w) => ({
        id: w.id,
        name: w.name,
        updatedAt: w.updatedAt,
      }))
    );
  }, [workspaceId]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleSave = async (payload: {
    id: string | null;
    name: string;
    description: string;
    graph: any;
  }) => {
    const { data, error } = await saveWorkflow(workspaceId, {
      id: payload.id || undefined,
      name: payload.name,
      description: payload.description,
      graph: payload.graph,
    });
    if (error) {
      toast({ title: 'Save failed', description: error, variant: 'destructive' });
      return { id: null, error };
    }
    await refreshList();
    toast({ title: 'Workflow saved' });
    return { id: data?.id ?? null, error: null };
  };

  const handleLoad = async (workflowId: string) => {
    const found = await listWorkflows(workspaceId);
    const wf = found.data?.find((w) => w.id === workflowId) || null;
    if (!wf) {
      toast({
        title: 'Could not load workflow',
        variant: 'destructive',
      });
      return null;
    }
    return {
      id: wf.id,
      name: wf.name,
      description: wf.description,
      graph: wf.graph,
    };
  };

  const handleDelete = async (workflowId: string) => {
    const { error } = await deleteWorkflow(workspaceId, workflowId);
    if (error) {
      toast({ title: 'Delete failed', description: error, variant: 'destructive' });
      return { error };
    }
    await refreshList();
    toast({ title: 'Workflow deleted' });
    return { error: null };
  };

  const handleRun = async (workflow: Workflow) => {
    setRunning(true);
    setRunResult(null);

    try {
      const generateStep = workflow.steps.find((s) => s.type === 'generate_content');
      const res = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow,
          bookParams: generateStep?.config || {},
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Workflow failed');
      }

      const finalOutput = data.data
        ? Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0))
        : undefined;

      setRunResult({
        workflowId: workflow.id,
        steps: data.steps || [],
        finalOutput,
        totalPages: data.pages,
        sizeKB: data.sizeKB ? Number(data.sizeKB) : undefined,
        totalDurationMs:
          data.steps?.reduce((acc: number, s: any) => acc + (s.durationMs || 0), 0) ||
          0,
        success: data.success,
      });
    } catch (e: any) {
      setRunResult({
        workflowId: workflow.id,
        steps: [],
        totalDurationMs: 0,
        success: false,
      });
    } finally {
      setRunning(false);
    }
  };

  const downloadResult = () => {
    if (!runResult?.finalOutput) return;
    const blob = new Blob([runResult.finalOutput as unknown as BlobPart], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow-output.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <WorkflowBuilder
          workspaceId={workspaceId}
          onSave={handleSave}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onRun={handleRun}
          running={running}
          runResult={runResult}
          savedWorkflows={saved}
          onDownloadResult={downloadResult}
        />
      </div>
    </div>
  );
}