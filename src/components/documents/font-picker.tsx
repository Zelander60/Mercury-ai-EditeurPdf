'use client';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BODY_FONTS, HEADING_FONTS, FONT_PAIRINGS } from '@/lib/doc-engine/fonts-manifest';

interface FontPickerProps {
  bodyFont: string;
  headingFont: string;
  onBodyChange: (v: string) => void;
  onHeadingChange: (v: string) => void;
}

export function FontPicker({ bodyFont, headingFont, onBodyChange, onHeadingChange }: FontPickerProps) {
  const applyPairing = (pair: string) => {
    const [b, h] = pair.split('|');
    onBodyChange(b);
    onHeadingChange(h);
  };

  const currentPair = `${bodyFont}|${headingFont}`;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h4 className="text-sm font-semibold tracking-tight">Typography</h4>
        <p className="text-xs text-muted-foreground">Choose fonts for export — live preview, print-ready</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Quick pairing</Label>
        <Select value={FONT_PAIRINGS.find((p) => `${p.body}|${p.heading}` === currentPair) ? currentPair : ''} onValueChange={applyPairing}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Custom pairing" />
          </SelectTrigger>
          <SelectContent>
            {FONT_PAIRINGS.map((p) => (
              <SelectItem key={`${p.body}|${p.heading}`} value={`${p.body}|${p.heading}`}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Body font</Label>
          <Select value={bodyFont} onValueChange={onBodyChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Serif</SelectLabel>
                {BODY_FONTS.filter((f) => f.category === 'Serif').map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Sans</SelectLabel>
                {BODY_FONTS.filter((f) => f.category === 'Sans').map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">{BODY_FONTS.find((f) => f.value === bodyFont)?.preview}</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Heading font</Label>
          <Select value={headingFont} onValueChange={onHeadingChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Display</SelectLabel>
                {HEADING_FONTS.filter((f) => f.category === 'Display').map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Serif / Sans</SelectLabel>
                {HEADING_FONTS.filter((f) => f.category !== 'Display').map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">{HEADING_FONTS.find((f) => f.value === headingFont)?.preview}</p>
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-3">
        <p style={{ fontFamily: 'serif' }} className="text-sm leading-relaxed">
          <span className="font-bold">{headingFont}</span> for titles —{' '}
          <span>{bodyFont}</span> for body. The quick brown fox jumps over the lazy dog. 0123456789
        </p>
      </div>
    </div>
  );
}