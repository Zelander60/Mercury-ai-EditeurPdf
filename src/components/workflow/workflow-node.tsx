'use client';

import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { StepType } from '@/lib/workflow/engine';
import { StepIcon } from './step-icon';

export type WorkflowNodeStatus = 'idle' | 'running' | 'success' | 'error';

export type WorkflowNodeData = {
  type: StepType;
  label: string;
  icon: string;
  config: Record<string, any>;
  enabled: boolean;
  status: WorkflowNodeStatus;
  [key: string]: unknown;
};

export type WorkflowNode = Node<WorkflowNodeData, 'workflow'>;

const WorkflowNodeComponent = ({ data, selected }: NodeProps<WorkflowNode>) => {
  const status = data.status ?? 'idle';

  return (
    <div
      className={cn(
        'w-56 rounded-[12px] border bg-card px-3 py-2.5 shadow-soft transition-all duration-200',
        selected ? 'border-primary shadow-premium ring-1 ring-primary/20' : 'border-border/50',
        !data.enabled && 'opacity-50',
        status === 'running' && 'border-primary animate-pulse shadow-premium',
        status === 'success' && 'border-emerald-500/50 shadow-soft',
        status === 'error' && 'border-destructive/50'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-background !bg-muted-foreground"
      />
      <div className="flex items-center gap-2">
        <StepIcon icon={data.icon} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{data.label}</p>
          {!data.enabled && (
            <p className="text-[10px] text-muted-foreground">Disabled</p>
          )}
        </div>
        {status === 'running' && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
        )}
        {status === 'error' && (
          <XCircle className="h-4 w-4 shrink-0 text-destructive" />
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
    </div>
  );
};

export const workflowNodeTypes = { workflow: WorkflowNodeComponent };

export default WorkflowNodeComponent;