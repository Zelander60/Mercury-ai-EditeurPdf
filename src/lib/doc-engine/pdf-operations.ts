/**
 * PDF Operation Types and Application Logic
 *
 * Operations are the source of truth for PDF modifications.
 * They are stored as JSON and applied during export.
 */

export interface TextOperation {
  type: 'text';
  id: string;
  page: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string; // hex like #000000
  fontFamily?: string;
}

export interface ImageOperation {
  type: 'image';
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string; // base64 or URL
  caption?: string;
}

export interface ShapeOperation {
  type: 'shape';
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle' | 'line';
  color: string;
  fill?: string;
  thickness?: number;
}

export interface HighlightOperation {
  type: 'highlight';
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export type PDFOperation =
  | TextOperation
  | ImageOperation
  | ShapeOperation
  | HighlightOperation;

export interface DocumentOperations {
  version: number;
  operations: PDFOperation[];
  pageCount: number;
  pageSize: { width: number; height: number };
}

// ── Apply operations to a PDFDocument ──

import { PDFDocument, rgb, degrees } from 'pdf-lib';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return rgb(r, g, b);
}

export async function applyOperations(
  pdfDoc: PDFDocument,
  ops: PDFOperation[]
): Promise<PDFDocument> {
  const pages = pdfDoc.getPages();

  for (const op of ops) {
    const pageIndex = op.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;
    const page = pages[pageIndex];
    const { width, height } = page.getSize();

    // PDF coordinates: origin at bottom-left, y goes up
    // Editor coordinates: origin at top-left, y goes down
    // Convert: pdfY = pageHeight - editorY
    const pdfY = height - op.y;

    switch (op.type) {
      case 'text': {
        page.drawText(op.text, {
          x: op.x,
          y: pdfY,
          size: op.fontSize,
          color: hexToRgb(op.color),
        });
        break;
      }

      case 'shape': {
        const color = hexToRgb(op.color);
        if (op.shape === 'rect') {
          page.drawRectangle({
            x: op.x,
            y: pdfY - op.height,
            width: op.width,
            height: op.height,
            borderColor: color,
            borderWidth: op.thickness || 1,
            color: op.fill ? hexToRgb(op.fill) : undefined,
          });
        } else if (op.shape === 'circle') {
          page.drawEllipse({
            x: op.x + op.width / 2,
            y: pdfY - op.height / 2,
            xScale: op.width / 2,
            yScale: op.height / 2,
            borderColor: color,
            borderWidth: op.thickness || 1,
            color: op.fill ? hexToRgb(op.fill) : undefined,
          });
        } else if (op.shape === 'line') {
          page.drawLine({
            start: { x: op.x, y: pdfY },
            end: { x: op.x + op.width, y: pdfY - op.height },
            thickness: op.thickness || 1,
            color,
          });
        }
        break;
      }

      case 'highlight': {
        page.drawRectangle({
          x: op.x,
          y: pdfY - op.height,
          width: op.width,
          height: op.height,
          color: hexToRgb(op.color),
          opacity: 0.3,
        });
        break;
      }

      case 'image': {
        // For MVP, images require base64 or buffer
        // This is a placeholder - actual image embedding needs fetching/embedding
        // We'll draw a placeholder rect with caption
        page.drawRectangle({
          x: op.x,
          y: pdfY - op.height,
          width: op.width,
          height: op.height,
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 1,
        });
        if (op.caption) {
          page.drawText(op.caption, {
            x: op.x,
            y: pdfY - op.height - 12,
            size: 8,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
        break;
      }
    }
  }

  return pdfDoc;
}

export async function exportWithOperations(
  pdfBytes: Uint8Array,
  ops: PDFOperation[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  await applyOperations(pdfDoc, ops);
  return await pdfDoc.save();
}
