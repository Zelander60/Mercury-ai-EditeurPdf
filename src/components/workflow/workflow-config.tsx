'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkflowStep } from '@/lib/workflow/engine';
import { Trash2 } from 'lucide-react';

interface NodeConfigProps {
  step: WorkflowStep;
  onChange: (key: string, value: any) => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
}

export const NodeConfig: React.FC<NodeConfigProps> = ({
  step,
  onChange,
  onToggleEnabled,
  onDelete,
}) => {
  const renderFields = () => {
    switch (step.type) {
      case 'generate_content':
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`cfg-title-${step.id}`}>Book title</Label>
              <Input
                id={`cfg-title-${step.id}`}
                value={step.config.title || ''}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Enter book title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`cfg-desc-${step.id}`}>Description</Label>
              <Textarea
                id={`cfg-desc-${step.id}`}
                value={step.config.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder="What the book is about"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-chapters-${step.id}`}>Chapters</Label>
                <Input
                  id={`cfg-chapters-${step.id}`}
                  type="number"
                  value={step.config.chapters || 8}
                  onChange={(e) => onChange('chapters', Number(e.target.value))}
                  min={3}
                  max={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-style-${step.id}`}>Style</Label>
                <Select
                  value={step.config.style || 'professional'}
                  onValueChange={(v) => onChange('style', v)}
                >
                  <SelectTrigger id={`cfg-style-${step.id}`} className="h-10">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-genre-${step.id}`}>Genre</Label>
                <Select
                  value={step.config.genre || 'non-fiction'}
                  onValueChange={(v) => onChange('genre', v)}
                >
                  <SelectTrigger id={`cfg-genre-${step.id}`} className="h-10">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'non-fiction',
                      'self-help',
                      'business',
                      'technology',
                      'science',
                      'health',
                      'finance',
                      'education',
                    ].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-model-${step.id}`}>AI model</Label>
                <Select
                  value={step.config.model || 'openrouter/free'}
                  onValueChange={(v) => onChange('model', v)}
                >
                  <SelectTrigger id={`cfg-model-${step.id}`} className="h-10">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrouter/free">
                      OpenRouter Free (auto)
                    </SelectItem>
                    <SelectItem value="anthropic/claude-sonnet-4">
                      Claude Sonnet 4
                    </SelectItem>
                    <SelectItem value="anthropic/claude-3.5-haiku">
                      Claude 3.5 Haiku
                    </SelectItem>
                    <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="openai/gpt-4o-mini">
                      GPT-4o Mini
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'add_watermark':
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`cfg-wm-${step.id}`}>Watermark text</Label>
              <Input
                id={`cfg-wm-${step.id}`}
                value={step.config.text || ''}
                onChange={(e) => onChange('text', e.target.value)}
                placeholder="e.g., DRAFT, CONFIDENTIAL"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-wmfs-${step.id}`}>Font size</Label>
                <Input
                  id={`cfg-wmfs-${step.id}`}
                  type="number"
                  value={step.config.fontSize || 50}
                  onChange={(e) => onChange('fontSize', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-wmo-${step.id}`}>Opacity</Label>
                <Input
                  id={`cfg-wmo-${step.id}`}
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={step.config.opacity || 0.3}
                  onChange={(e) => onChange('opacity', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`cfg-wmr-${step.id}`}>Rotation</Label>
                <Input
                  id={`cfg-wmr-${step.id}`}
                  type="number"
                  value={step.config.rotation || 45}
                  onChange={(e) => onChange('rotation', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 'ai_polish':
        return (
          <div className="space-y-1.5">
            <Label htmlFor={`cfg-polish-${step.id}`}>Polish instruction</Label>
            <Textarea
              id={`cfg-polish-${step.id}`}
              value={step.config.instruction || ''}
              onChange={(e) => onChange('instruction', e.target.value)}
              placeholder="How should AI improve the content?"
              rows={3}
            />
          </div>
        );

      case 'apply_template':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`cfg-font-${step.id}`}>Font family</Label>
              <Select
                value={step.config.fontFamily || 'Lora'}
                onValueChange={(v) => onChange('fontFamily', v)}
              >
                <SelectTrigger id={`cfg-font-${step.id}`} className="h-10">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {['Lora', 'Merriweather', 'Roboto', 'Inter', 'SourceSerif4', 'EBGaramond', 'CrimsonText', 'PlayfairDisplay', 'Cormorant'].map(
                    (f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`cfg-fontsize-${step.id}`}>Font size</Label>
              <Input
                id={`cfg-fontsize-${step.id}`}
                type="number"
                value={step.config.fontSize || 11}
                onChange={(e) => onChange('fontSize', Number(e.target.value))}
              />
            </div>
          </div>
        );

      case 'add_cover':
        return (
          <div className="space-y-1.5">
            <Label htmlFor={`cfg-cover-${step.id}`}>Cover style</Label>
            <Select
              value={step.config.style || 'gradient'}
              onValueChange={(v) => onChange('style', v)}
            >
              <SelectTrigger id={`cfg-cover-${step.id}`} className="h-10">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'export_pdf':
        return (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`cfg-filename-${step.id}`}>Filename</Label>
              <Input
                id={`cfg-filename-${step.id}`}
                value={step.config.filename || 'output.pdf'}
                onChange={(e) => onChange('filename', e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={step.config.bookmarks !== false}
                onChange={(e) => onChange('bookmarks', e.target.checked)}
              />
              Bookmarks
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={step.config.toc !== false}
                onChange={(e) => onChange('toc', e.target.checked)}
              />
              Table of contents
            </label>
          </div>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground">
            No configuration needed for this step.
          </p>
        );
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{step.label}</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {step.type}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Delete node"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label htmlFor={`cfg-enabled-${step.id}`} className="text-sm">
          Enabled
        </Label>
        <Switch
          id={`cfg-enabled-${step.id}`}
          checked={step.enabled}
          onCheckedChange={onToggleEnabled}
        />
      </div>

      {renderFields()}
    </div>
  );
};

export default NodeConfig;