'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileArchive,
  Combine,
  Scissors,
  Droplets,
  Info,
  Download,
  FileUp,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToolType = 'compress' | 'merge' | 'split' | 'watermark' | 'info';

const TOOLS = [
  { id: 'compress' as ToolType, icon: FileArchive, name: 'Compress', desc: 'Reduce PDF file size' },
  { id: 'merge' as ToolType, icon: Combine, name: 'Merge', desc: 'Combine multiple PDFs' },
  { id: 'split' as ToolType, icon: Scissors, name: 'Split', desc: 'Extract pages from PDF' },
  { id: 'watermark' as ToolType, icon: Droplets, name: 'Watermark', desc: 'Add text watermark' },
  { id: 'info' as ToolType, icon: Info, name: 'PDF Info', desc: 'View metadata & stats' },
];

async function loadPdfLib() {
  const pdfLib = await import('pdf-lib');
  return pdfLib.PDFDocument;
}
function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PdfToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('compress');
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [splitRanges, setSplitRanges] = useState('');
  const [lastOutput, setLastOutput] = useState<Uint8Array | null>(null);
  const [lastOutputs, setLastOutputs] = useState<Uint8Array[]>([]);

  const active = TOOLS.find((t) => t.id === activeTool)!;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
    setResult('');
    setError('');
    setLastOutput(null);
    setLastOutputs([]);
  }, []);

  const run = async () => {
    if (!files.length) return;
    setLoading(true);
    setError('');
    setResult('');
    setLastOutput(null);
    setLastOutputs([]);

    try {
      const PDFDocument = await loadPdfLib();

      if (activeTool === 'compress') {
        const ab = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setKeywords([]);
        doc.setProducer('');
        doc.setCreator('');
        const out = await doc.save({ useObjectStreams: true });
        const saved = ((1 - out.byteLength / files[0].size) * 100).toFixed(1);
        setResult(`Original: ${(files[0].size / 1024).toFixed(0)} KB → Compressed: ${(out.byteLength / 1024).toFixed(0)} KB (saved ${saved}%)`);
        setLastOutput(out);
      }

      if (activeTool === 'merge') {
        if (files.length < 2) { setError('Select at least 2 PDFs'); setLoading(false); return; }
        const merged = await PDFDocument.create();
        for (const f of files) {
          const ab = await f.arrayBuffer();
          const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }
        const out = await merged.save();
        setResult(`Merged ${files.length} files → ${merged.getPageCount()} pages (${(out.byteLength / 1024).toFixed(0)} KB)`);
        setLastOutput(out);
      }

      if (activeTool === 'split') {
        const ab = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const total = doc.getPageCount();
        let indices: number[] = [];

        if (splitRanges.trim()) {
          for (const part of splitRanges.split(';')) {
            const [s, e] = part.split('-').map(Number);
            const start = Math.max(0, (s || 1) - 1);
            const end = Math.min(total - 1, (e || s || 1) - 1);
            for (let i = start; i <= end; i++) indices.push(i);
          }
        } else {
          indices = Array.from({ length: total }, (_, i) => i);
        }

        const outputs: Uint8Array[] = [];
        for (const idx of indices) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(doc, [idx]);
          newDoc.addPage(page);
          outputs.push(await newDoc.save());
        }
        setResult(`Extracted ${outputs.length} pages from ${total}-page PDF`);
        setLastOutputs(outputs);
      }

      if (activeTool === 'watermark') {
        if (!watermarkText.trim()) { setError('Enter watermark text'); setLoading(false); return; }
        const ab = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        for (const page of doc.getPages()) {
          const { width, height } = page.getSize();
          page.drawText(watermarkText, {
            x: width / 2 - (watermarkText.length * 15),
            y: height / 2,
            size: 50,
            opacity: 0.3,
            rotate: (await import('pdf-lib')).degrees(45),
          });
        }
        const out = await doc.save();
        setResult(`Added watermark "${watermarkText}" to ${doc.getPageCount()} pages`);
        setLastOutput(out);
      }

      if (activeTool === 'info') {
        const ab = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const pages = doc.getPages().map((p, i) => {
          const s = p.getSize();
          return `  Page ${i + 1}: ${s.width.toFixed(0)} × ${s.height.toFixed(0)} pts`;
        });
        const lines = [
          `Pages: ${doc.getPageCount()}`,
          `Size: ${(files[0].size / 1024).toFixed(0)} KB`,
          doc.getTitle() ? `Title: ${doc.getTitle()}` : null,
          doc.getAuthor() ? `Author: ${doc.getAuthor()}` : null,
          '',
          'Dimensions:',
          ...pages,
        ].filter(Boolean);
        setResult(lines.join('\n'));
      }
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const name = files[0]?.name || 'output.pdf';
    if (lastOutput) downloadBlob(lastOutput, `processed-${name}`);
    if (lastOutputs.length) lastOutputs.forEach((o, i) => downloadBlob(o, `page-${i + 1}-${name}`));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">PDF Tools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Process PDFs right in your browser — no upload needed.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTool(t.id); setResult(''); setError(''); setLastOutput(null); setLastOutputs([]); }}
              className={cn(
                'group flex flex-col items-start gap-3 rounded-[12px] border p-4 text-left transition-all duration-premium ease-premium hover:shadow-soft motion-reduce:transition-none',
                isActive
                  ? 'border-primary/30 bg-primary/5 shadow-soft'
                  : 'border-border/50 bg-card hover:border-border'
              )}
            >
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-accent'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}>{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[12px] border-border/50 shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <active.icon className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{active.name}</CardTitle>
              <Badge variant="secondary" className="ml-auto text-[10px]">{activeTool}</Badge>
            </div>
            <CardDescription>{active.desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                {activeTool === 'merge' ? 'Select PDF files' : 'Select PDF'}
              </Label>
              <div className="flex items-center justify-center rounded-[10px] border border-dashed py-8">
                <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
                  <FileUp className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {files.length ? `${files.length} file(s) selected` : 'Click to choose PDF'}
                  </span>
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple={activeTool === 'merge'}
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {activeTool === 'watermark' && (
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Watermark Text</Label>
                <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="e.g., DRAFT" className="h-9" />
              </div>
            )}

            {activeTool === 'split' && (
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Page Ranges (optional)</Label>
                <Input value={splitRanges} onChange={(e) => setSplitRanges(e.target.value)} placeholder="e.g., 1-3;5;7-10" className="h-9" />
              </div>
            )}

            {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

            <div className="flex gap-2 pt-2">
              <Button onClick={run} disabled={loading || !files.length} className="h-9">
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                {loading ? 'Processing...' : 'Process'}
              </Button>
              {(lastOutput || lastOutputs.length > 0) && (
                <Button variant="outline" onClick={download} className="h-9">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-border/50 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Result</CardTitle>
            <CardDescription>Output of the last operation</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-14 text-center">
                <Info className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Select a file and click Process.
                </p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-3 py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            )}
            {result && <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-sm">{result}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
