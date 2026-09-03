'use client';

import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FontPicker } from '@/components/documents/font-picker';
import { toast } from 'sonner';
import { Download, Loader2, Settings2 } from 'lucide-react';

interface ExportButtonProps {
  documentId: string;
  title: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ documentId, title }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [bodyFont, setBodyFont] = useState('Lora');
  const [headingFont, setHeadingFont] = useState('PlayfairDisplay');

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${documentId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontBody: bodyFont, fontHeading: headingFont }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        // Professional handling of ENOENT / font errors
        if (err.error?.includes('ENOENT') || err.error?.includes('Font')) {
          toast.error('Font not found, using fallback', { description: 'Retrying with standard font...' });
          // Retry without custom font
          const retry = await fetch(`/api/documents/${documentId}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          if (!retry.ok) throw new Error((await retry.json()).error || 'Export failed');
          const blob = await retry.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          toast.success('Exported with fallback font');
          setOpen(false);
          return;
        }
        throw new Error(err.error || 'Export failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported', { description: `${bodyFont} + ${headingFont}` });
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Export PDF
          </DialogTitle>
          <DialogDescription>Choose typography and export print-ready PDF. All fonts bundled, StandardFonts fallback if missing.</DialogDescription>
        </DialogHeader>

        <FontPicker bodyFont={bodyFont} headingFont={headingFont} onBodyChange={setBodyFont} onHeadingChange={setHeadingFont} />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? 'Exporting…' : `Export ${bodyFont} + ${headingFont}`}
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">If a font file is missing (ENOENT), we automatically fall back to TimesRoman/Helvetica.</p>
      </DialogContent>
    </Dialog>
  );
};