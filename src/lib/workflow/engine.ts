/**
 * Workflow Engine
 * Executes a sequence of steps to generate documents automatically.
 */

export type StepType =
  | 'generate_content'
  | 'apply_template'
  | 'add_cover'
  | 'export_pdf'
  | 'ai_polish'
  | 'add_watermark'
  | 'compress';

export interface WorkflowStep {
  id: string;
  type: StepType;
  label: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface StepResult {
  stepId: string;
  type: StepType;
  success: boolean;
  skipped?: boolean;
  output?: any;
  error?: string;
  durationMs: number;
}

export interface WorkflowRunResult {
  workflowId: string;
  steps: StepResult[];
  finalOutput?: Uint8Array;
  totalPages?: number;
  sizeKB?: number;
  totalDurationMs: number;
  success: boolean;
}

const STEP_DEFAULTS: Record<StepType, Record<string, any>> = {
  generate_content: {
    title: '',
    description: '',
    genre: 'non-fiction',
    chapters: 8,
    style: 'professional',
    model: 'openrouter/free',
  },
  apply_template: {
    template: 'default',
    fontFamily: 'Lora',
    fontSize: 11,
    lineHeight: 1.5,
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
  },
  add_cover: {
    style: 'gradient',
    gradientColors: ['#1a1a2e', '#16213e'],
    fontFamily: 'Playfair Display',
  },
  export_pdf: {
    filename: 'output.pdf',
    bookmarks: true,
    toc: true,
  },
  ai_polish: {
    instruction: 'Improve clarity and engagement',
    model: 'openrouter/free',
  },
  add_watermark: {
    text: 'DRAFT',
    fontSize: 50,
    opacity: 0.3,
    rotation: 45,
  },
  compress: {
    removeMetadata: true,
  },
};

export const STEP_TYPES: Array<{ type: StepType; label: string; icon: string; description: string }> = [
  { type: 'generate_content', label: 'Generate Content', icon: 'sparkles', description: 'AI generates book chapters from a description' },
  { type: 'apply_template', label: 'Apply Template', icon: 'layout', description: 'Set fonts, spacing, and page layout' },
  { type: 'add_cover', label: 'Add Cover', icon: 'palette', description: 'Generate a professional cover page' },
  { type: 'ai_polish', label: 'AI Polish', icon: 'wand', description: 'AI refines and improves the content' },
  { type: 'add_watermark', label: 'Add Watermark', icon: 'droplet', description: 'Stamp text across all pages' },
  { type: 'compress', label: 'Compress', icon: 'archive', description: 'Reduce PDF file size' },
  { type: 'export_pdf', label: 'Export PDF', icon: 'file', description: 'Generate final PDF with bookmarks & TOC' },
];

export const STEP_ICON_KEYS = STEP_TYPES.reduce(
  (acc, s) => {
    acc[s.type] = s.icon;
    return acc;
  },
  {} as Record<StepType, string>
);

export function createDefaultStep(type: StepType): WorkflowStep {
  return {
    id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    label: STEP_TYPES.find((s) => s.type === type)?.label || type,
    config: { ...STEP_DEFAULTS[type] },
    enabled: true,
  };
}

export function createDefaultWorkflow(): Workflow {
  return {
    id: `wf_${Date.now()}`,
    name: 'New Workflow',
    description: '',
    steps: [
      createDefaultStep('generate_content'),
      createDefaultStep('apply_template'),
      createDefaultStep('add_cover'),
      createDefaultStep('export_pdf'),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const PRESET_WORKFLOWS: Workflow[] = [
  {
    id: 'preset_ebook',
    name: 'E-Book Generator',
    description: 'Generate a complete e-book with cover and professional formatting',
    steps: [
      createDefaultStep('generate_content'),
      createDefaultStep('apply_template'),
      createDefaultStep('add_cover'),
      createDefaultStep('export_pdf'),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset_lead_magnet',
    name: 'Lead Magnet',
    description: 'Quick 5-chapter guide for email list building',
    steps: [
      { ...createDefaultStep('generate_content'), config: { ...STEP_DEFAULTS.generate_content, chapters: 5, style: 'casual' } },
      createDefaultStep('apply_template'),
      createDefaultStep('add_cover'),
      { ...createDefaultStep('add_watermark'), config: { ...STEP_DEFAULTS.add_watermark, text: 'FREE GUIDE' } },
      createDefaultStep('export_pdf'),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset_course_book',
    name: 'Course Workbook',
    description: 'Structured workbook with frameworks and action steps',
    steps: [
      { ...createDefaultStep('generate_content'), config: { ...STEP_DEFAULTS.generate_content, style: 'academic', chapters: 10 } },
      createDefaultStep('apply_template'),
      createDefaultStep('add_cover'),
      createDefaultStep('ai_polish'),
      createDefaultStep('export_pdf'),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
