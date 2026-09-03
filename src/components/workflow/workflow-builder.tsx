'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, Play, Save, Search, Trash2, Workflow as WorkflowIcon } from 'lucide-react';

import {
  STEP_TYPES,
  createDefaultStep,
  PRESET_WORKFLOWS,
  type StepType,
  type Workflow,
  type WorkflowRunResult,
  type WorkflowStep,
} from '@/lib/workflow/engine';
import { workflowNodeTypes, type WorkflowNodeData } from './workflow-node';
import { NodeConfig } from './workflow-config';
import { StepIcon } from './step-icon';
import { stepIconKey } from './step-icon';

interface WorkflowBuilderProps {
  workspaceId: string;
  onSave: (payload: {
    id: string | null;
    name: string;
    description: string;
    graph: any;
  }) => Promise<{ id: string | null; error: string | null }>;
  onLoad: (workflowId: string) => Promise<{
    id: string | null;
    name: string;
    description: string;
    graph: any;
  } | null>;
  onDelete: (workflowId: string) => Promise<{ error: string | null }>;
  onRun: (workflow: Workflow) => void;
  running: boolean;
  runResult: WorkflowRunResult | null;
  savedWorkflows: { id: string; name: string; updatedAt: string }[];
  onDownloadResult?: () => void;
}

const NODE_SPACING = 260;

/** Order nodes following edges (topological), falling back to position. */
const executionOrder = (nodes: Node[], edges: Edge[]): string[] => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  const adj = new Map(nodes.map((n) => [n.id, [] as string[]]));

  for (const e of edges) {
    if (byId.has(e.source) && byId.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      indeg.set(e.target, (indeg.get(e.target) || 0) + 1);
    }
  }

  const roots = nodes
    .filter((n) => (indeg.get(n.id) || 0) === 0)
    .sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y)
    .map((n) => n.id);

  const order: string[] = [];
  const visited = new Set<string>();
  const queue = [...roots];

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    for (const next of adj.get(id) || []) {
      const deg = (indeg.get(next) || 1) - 1;
      indeg.set(next, deg);
      if (deg <= 0) queue.push(next);
    }
  }

  const remaining = nodes
    .filter((n) => !visited.has(n.id))
    .sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y)
    .map((n) => n.id);

  return [...order, ...remaining];
};

const stepsFromGraph = (nodes: Node[], edges: Edge[]): WorkflowStep[] =>
  executionOrder(nodes, edges)
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is Node<WorkflowNodeData> => !!n)
    .map((n) => ({
      id: n.id,
      type: n.data.type,
      label: n.data.label,
      config: n.data.config,
      enabled: n.data.enabled,
    }));

const nodesFromSteps = (steps: WorkflowStep[]): Node<WorkflowNodeData>[] =>
  steps.map((step, i) => ({
    id: step.id,
    type: 'workflow' as const,
    position: { x: 40 + i * NODE_SPACING, y: 200 },
    data: {
      type: step.type,
      label: step.label,
      icon: stepIconKey(step.type),
      config: step.config,
      enabled: step.enabled,
      status: 'idle' as const,
    },
  }));

const edgesFromSteps = (steps: WorkflowStep[]): Edge[] =>
  steps.slice(0, -1).map((step, i) => ({
    id: `e-${step.id}-${steps[i + 1].id}`,
    source: step.id,
    target: steps[i + 1].id,
    type: 'smoothstep',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workspaceId,
  onSave,
  onLoad,
  onDelete,
  onRun,
  running,
  runResult,
  savedWorkflows,
  onDownloadResult,
}) => {
  const initial = useMemo(() => PRESET_WORKFLOWS[0], []);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    nodesFromSteps(initial.steps)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    edgesFromSteps(initial.steps)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [addedCount, setAddedCount] = useState(0);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [presetValue, setPresetValue] = useState('');

  const statusByStep = useMemo(() => {
    const map: Record<string, { success: boolean; error?: string }> = {};
    runResult?.steps?.forEach((s) => {
      map[s.stepId] = { success: !!s.success, error: s.error };
    });
    return map;
  }, [runResult]);

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => {
        const res = statusByStep[n.id];
        let status = n.data.status;
        if (running) status = 'running';
        else if (res) status = res.success ? 'success' : 'error';
        else status = 'idle';
        return { ...n, data: { ...n.data, status } };
      }),
    [nodes, statusByStep, running]
  );

  const displayEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        animated: running,
      })),
    [edges, running]
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, type: 'smoothstep' }, eds)
      ),
    [setEdges]
  );

  const addNode = (type: StepType) => {
    const step = createDefaultStep(type);
    setAddedCount((c) => c + 1);
    const meta = STEP_TYPES.find((s) => s.type === type)!;
    const node: Node<WorkflowNodeData> = {
      id: step.id,
      type: 'workflow',
      position: {
        x: 40 + (nodes.length % 4) * NODE_SPACING,
        y: 80 + addedCount * 90,
      },
      data: {
        type,
        label: meta.label,
        icon: meta.icon,
        config: step.config,
        enabled: true,
        status: 'idle',
      },    };
    setNodes((ns) => [...ns, node]);
    setSelectedId(step.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((ns) => ns.filter((n) => n.id !== selectedId));
    setEdges((es) => es.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  const updateConfig = (key: string, value: any) => {
    if (!selectedId) return;
    setNodes((ns) =>
      ns.map((n) =>
        n.id === selectedId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
          : n
      )
    );
  };

  const toggleEnabled = () => {
    if (!selectedId) return;
    setNodes((ns) =>
      ns.map((n) =>
        n.id === selectedId
          ? { ...n, data: { ...n.data, enabled: !n.data.enabled } }
          : n
      )
    );
  };

  const loadPreset = (preset: Workflow) => {
    setNodes(nodesFromSteps(preset.steps));
    setEdges(edgesFromSteps(preset.steps));
    setName(preset.name);
    setDescription(preset.description);
    setWorkflowId(null);
    setSelectedId(null);
  };

  const loadStored = async (id: string) => {
    const stored = await onLoad(id);
    if (!stored) return;
    const graph = stored.graph;
    if (graph?.nodes?.length) {
      setNodes(
        graph.nodes.map((n: any) => ({
          ...n,
          data: { ...n.data, status: 'idle' },
        }))
      );
      setEdges(graph.edges || []);
    } else if (graph?.steps?.length) {
      setNodes(nodesFromSteps(graph.steps));
      setEdges(edgesFromSteps(graph.steps));
    }
    setName(stored.name);
    setDescription(stored.description);
    setWorkflowId(stored.id);
    setSelectedId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await onSave({
        id: workflowId,
        name,
        description,
        graph: { nodes, edges },
      });
      if (result.error) {
        setSaveError(result.error);
      } else if (result.id) {
        setWorkflowId(result.id);
      }
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStored = async (id: string) => {
    const result = await onDelete(id);
    if (!result.error && workflowId === id) {
      setWorkflowId(null);
    }
  };

  const buildWorkflow = (): Workflow => ({
    id: workflowId || `wf_${Date.now()}`,
    name,
    description,
    steps: stepsFromGraph(nodes, edges),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const selectedNode = nodes.find((n) => n.id === selectedId);
  const selectedStep: WorkflowStep | null = selectedNode
    ? {
        id: selectedNode.id,
        type: selectedNode.data.type,
        label: selectedNode.data.label,
        config: selectedNode.data.config,
        enabled: selectedNode.data.enabled,
      }
    : null;

  const paletteItems = STEP_TYPES.filter(
    (s) =>
      !paletteQuery ||
      s.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
      s.type.includes(paletteQuery.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/20">
      {/* Toolbar — Linear premium */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
        <WorkflowIcon className="h-4 w-4 text-primary" aria-hidden />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 w-48 border-0 bg-transparent px-2 text-sm font-semibold focus-visible:ring-1"
          placeholder="Workflow name"
          aria-label="Workflow name"
        />
        <div className="hidden h-4 w-px bg-border sm:block" />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="hidden h-8 flex-1 border-0 bg-transparent px-2 text-xs text-muted-foreground focus-visible:ring-1 md:block"
          placeholder="Description"
          aria-label="Workflow description"
        />
        <div className="ml-auto flex items-center gap-2">
        <Select
          value={presetValue}
          onValueChange={(v) => {
            setPresetValue(v);
            const preset = PRESET_WORKFLOWS.find((p) => p.id === v);
            if (preset) loadPreset(preset);
            setPresetValue('');
          }}
        >
          <SelectTrigger
            aria-label="Load preset workflow"
            className="h-8 w-32 border border-input bg-card px-2 text-xs"
          >
            <SelectValue placeholder="Presets…" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_WORKFLOWS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={running || saving}
            className="h-8"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}{' '}
            {workflowId ? 'Update' : 'Save'}
          </Button>
          <Button size="sm" onClick={() => onRun(buildWorkflow())} disabled={running} className="h-8 shadow-soft">
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            {running ? 'Running…' : 'Run'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="shrink-0 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}

      {/* Run summary */}
      {running && (
        <div className="flex shrink-0 items-center gap-3 border-b bg-primary/5 px-4 py-2 text-sm">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-muted-foreground">Running workflow…</span>
        </div>
      )}
      {runResult && !running && (
        <div
          className={`flex shrink-0 items-center gap-3 border-b px-4 py-2.5 ${
            runResult.success ? 'bg-emerald-500/5' : 'bg-destructive/5'
          }`}
        >
          <span
            className={`inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium ${
              runResult.success
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {runResult.success ? 'Completed' : 'Failed'}
          </span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {runResult.steps.filter((s) => !s.skipped).length} steps
            </span>
            {runResult.totalPages ? (
              <span>{runResult.totalPages} pages</span>
            ) : null}
            {runResult.sizeKB ? <span>{runResult.sizeKB} KB</span> : null}
            {runResult.totalDurationMs ? (
              <span>{(runResult.totalDurationMs / 1000).toFixed(1)}s</span>
            ) : null}
          </div>
          {runResult.steps.some((s) => s.error) && (
            <span className="min-w-0 flex-1 truncate text-xs text-destructive">
              {runResult.steps.find((s) => s.error)?.error}
            </span>
          )}
          {onDownloadResult && runResult.finalOutput && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto h-7 shrink-0 gap-1.5 text-xs"
              onClick={onDownloadResult}
            >
              <Download className="h-3 w-3" />
              Download PDF
            </Button>
          )}
        </div>
      )}

      {/* Main area */}
      <div className="flex min-h-0 flex-1">
        {/* Palette — Notion 14px dense */}
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Search nodes"
                className="h-9 pl-8 text-sm"
                aria-label="Search nodes"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
              <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nodes
              </p>
              {paletteItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addNode(item.type)}
                  className="flex items-start gap-2 rounded-lg border bg-card px-3 py-2 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <StepIcon icon={item.icon} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </button>
              ))}
              {paletteItems.length === 0 && (
                <p className="px-2 text-xs text-muted-foreground">No matching nodes.</p>
              )}

              {savedWorkflows.length > 0 && (
                <>
                  <p className="px-2 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Saved workflows
                  </p>
                  {savedWorkflows.map((wf) => (
                    <div
                      key={wf.id}
                      className={`flex items-center gap-1 rounded-lg border px-3 py-2 transition ${
                        workflowId === wf.id ? 'border-primary' : 'bg-card'
                      }`}
                    >
                      <button
                        onClick={() => loadStored(wf.id)}
                        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        aria-label={`Load workflow ${wf.name}`}
                      >
                        <span className="block truncate text-sm font-medium">
                          {wf.name}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {new Date(wf.updatedAt).toLocaleDateString()}
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteStored(wf.id)}
                        aria-label={`Delete workflow ${wf.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Canvas */}
        <div className="relative min-h-[420px] flex-1">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-6 backdrop-blur-[1px]">
              <div className="flex max-w-md flex-col items-center gap-3 rounded-[12px] border border-dashed bg-card/80 px-10 py-12 text-center shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <WorkflowIcon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <p className="text-sm font-semibold tracking-tight">
                  Your canvas is empty
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Add a step from the left panel, drag between nodes to connect
                  them, then press <span className="font-medium text-foreground">Run</span>.
                  Or start from a preset in the toolbar.
                </p>
                <Button
                  size="sm"
                  className="mt-1"
                  onClick={() => loadPreset(PRESET_WORKFLOWS[0])}
                >
                  <Play className="h-3 w-3" />
                  Start from preset
                </Button>
              </div>
            </div>
          ) : null}
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={workflowNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
            maxZoom={1.6}
            proOptions={{ hideAttribution: false }}
            className="bg-background"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              className="!bg-card"
              maskColor="rgb(0 0 0 / 0.2)"
            />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <aside className="hidden w-72 shrink-0 border-l bg-background lg:block">
          {selectedStep ? (
            <NodeConfig
              step={selectedStep}
              onChange={updateConfig}
              onToggleEnabled={toggleEnabled}
              onDelete={deleteSelected}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <WorkflowIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
              <p className="text-sm font-medium">No step selected</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Click a node on the canvas to configure it. Drag from a node&apos;s
                right handle to another node to connect.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default WorkflowBuilder;