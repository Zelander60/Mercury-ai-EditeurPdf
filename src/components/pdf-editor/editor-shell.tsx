'use client';

import React, { useState, useCallback } from 'react';
import { ToolsPanel } from './tools-panel';
import { PageCanvas } from './page-canvas';
import { BookPage } from '@/lib/doc-engine/paginate-book';
import { PDFOperation } from '@/lib/doc-engine/pdf-operations';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';
import { ChatDock } from '@/components/ai/chat-dock';

interface EditorShellProps {
  documentId: string;
  documentTitle?: string;
  pageCount: number;
  pageSize: { width: number; height: number };
  initialOperations?: PDFOperation[];
  onSave?: (operations: PDFOperation[]) => Promise<void>;
  onExport?: () => Promise<void>;
  bookContext?: string;
  bookPages?: BookPage[];
}

export const EditorShell: React.FC<EditorShellProps> = ({
  documentId,
  documentTitle,
  pageCount,
  pageSize,
  initialOperations = [],
  bookContext,
  bookPages = [],
}) => {
  const [operations, setOperations] = useState<PDFOperation[]>(initialOperations);
  const [scale, setScale] = useState(0.75);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showAgent, setShowAgent] = useState(true);

  const handleAddOperation = useCallback((op: PDFOperation) => {
    setOperations((prev) => [...prev, op]);
  }, []);

  const handleUpdateOperation = useCallback((id: string, updates: Partial<PDFOperation>) => {
    setOperations((prev) =>
      prev.map((op) => (op.id === id ? ({ ...op, ...updates } as PDFOperation) : op))
    );
  }, []);

  const handleDeleteOperation = useCallback((id: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== id));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/save-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Operations saved');
    } catch (e: any) {
      toast.error('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF exported');
    } catch (e: any) {
      toast.error('Export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      <ToolsPanel
        onAddOperation={handleAddOperation}
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        currentPage={1}
      />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {documentTitle || 'Canvas'}
            </h1>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {pageCount} pages · {operations.length} ops
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border bg-background px-2 py-1 sm:flex">
              <span className="text-xs text-muted-foreground">Zoom</span>
              <Slider
                value={[scale * 100]}
                min={25}
                max={150}
                step={5}
                onValueChange={([v]) => setScale(v / 100)}
                className="w-20"
                aria-label="Zoom"
              />
              <span className="w-9 text-xs tabular-nums text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAgent((v) => !v)}
            >
              {showAgent ? 'Hide Agent' : 'Show Agent'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button size="sm" onClick={handleExport} disabled={exporting} aria-busy={exporting}>
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Download className="h-3.5 w-3.5" aria-hidden />
              )}
              {exporting ? 'Exporting…' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Canvas area */}
          <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="flex flex-col items-center gap-6">
              {pages.map((pageNum) => (
                <PageCanvas
                  key={pageNum}
                  pageNumber={pageNum}
                  width={pageSize.width}
                  height={pageSize.height}
                  operations={operations}
                  bookBlocks={bookPages[pageNum - 1]?.blocks || []}
                  onUpdateOperation={handleUpdateOperation}
                  onDeleteOperation={handleDeleteOperation}
                  scale={scale}
                />
              ))}
            </div>
          </div>
          {showAgent && (
            <ChatDock
              workspaceId={documentId}
              documentTitle={documentTitle || 'Book canvas'}
              context={
                bookContext
                  ? bookContext.slice(0, 4000)
                  : JSON.stringify(operations).slice(0, 2000)
              }
              onApply={(text) => {
                // Insert as text operation
                handleAddOperation({
                  id: crypto.randomUUID(),
                  type: 'text',
                  page: 1,
                  x: 100,
                  y: 100,
                  text: text.slice(0, 500),
                  fontSize: 16,
                  fontColor: '#111827',
                } as any);
                toast.success('Agent suggestion applied');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
