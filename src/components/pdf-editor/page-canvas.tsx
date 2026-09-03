'use client';

import React, { useState, useRef, useCallback } from 'react';
import { PDFOperation, TextOperation, ShapeOperation, ImageOperation } from '@/lib/doc-engine/pdf-operations';
import { BookPageTextBlock } from '@/lib/doc-engine/paginate-book';

interface PageCanvasProps {
  pageNumber: number;
  width: number;
  height: number;
  operations: PDFOperation[];
  bookBlocks?: BookPageTextBlock[];
  onUpdateOperation: (id: string, updates: Partial<PDFOperation>) => void;
  onDeleteOperation: (id: string) => void;
  scale?: number;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  pageNumber,
  width,
  height,
  operations,
  bookBlocks = [],
  onUpdateOperation,
  onDeleteOperation,
  scale = 1,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pageOps = operations.filter((op) => op.page === pageNumber);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, opId: string) => {
      e.stopPropagation();
      const op = pageOps.find((o) => o.id === opId);
      if (!op) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      setDraggingId(opId);
      setDragOffset({ x: mouseX - op.x, y: mouseY - op.y });
      setSelectedId(opId);
    },
    [pageOps, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      const newX = Math.max(0, Math.min(width, mouseX - dragOffset.x));
      const newY = Math.max(0, Math.min(height, mouseY - dragOffset.y));

      onUpdateOperation(draggingId, { x: newX, y: newY });
    },
    [draggingId, dragOffset, scale, width, height, onUpdateOperation]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (draggingId) return;
      // Deselect when clicking empty canvas
      if (e.target === canvasRef.current) {
        setSelectedId(null);
      }
    },
    [draggingId]
  );

  const sw = width * scale;
  const sh = height * scale;

  return (
    <div
      className="relative bg-white shadow-lg mx-auto"
      style={{
        width: sw,
        height: sh,
        marginBottom: 24,
      }}
    >
      {/* Page number label */}
      <div className="absolute -top-6 left-0 text-xs text-muted-foreground">
        Page {pageNumber}
      </div>

      {/* Canvas area */}
      <div
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden cursor-default"
        style={{
          backgroundImage:
            'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {bookBlocks.length > 0 && (
          <div
            className="pointer-events-none select-none absolute left-0 top-0 flex flex-col"
            style={{
              padding: 72 * scale,
              width: '100%',
            }}
          >
            {bookBlocks.map((block, i) => (
              <div
                key={i}
                className="text-neutral-800"
                style={{
                  fontSize: block.fontSize * scale,
                  fontWeight: block.bold ? 600 : 400,
                  lineHeight: 1.5,
                  marginBottom: 6 * scale,
                  fontFamily: 'Georgia, serif',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {block.text}
              </div>
            ))}
          </div>
        )}
        {pageOps.map((op) => {
          const isSelected = selectedId === op.id;

          if (op.type === 'text') {
            const textOp = op as TextOperation;
            return (
              <div
                key={op.id}
                className={`absolute cursor-move select-none ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: textOp.x * scale,
                  top: textOp.y * scale,
                  fontSize: textOp.fontSize * scale,
                  color: textOp.color,
                  fontFamily: textOp.fontFamily || 'serif',
                  lineHeight: 1.2,
                  whiteSpace: 'pre-wrap',
                  maxWidth: width * scale - textOp.x * scale,
                }}
                onMouseDown={(e) => handleMouseDown(e, op.id)}
              >
                {textOp.text}
                {isSelected && (
                  <button
                    className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOperation(op.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }

          if (op.type === 'shape') {
            const shapeOp = op as ShapeOperation;
            return (
              <div
                key={op.id}
                className={`absolute cursor-move ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: shapeOp.x * scale,
                  top: shapeOp.y * scale,
                  width: shapeOp.width * scale,
                  height: shapeOp.height * scale,
                }}
                onMouseDown={(e) => handleMouseDown(e, op.id)}
              >
                {shapeOp.shape === 'rect' && (
                  <div
                    className="w-full h-full"
                    style={{
                      border: `${(shapeOp.thickness || 1) * scale}px solid ${shapeOp.color}`,
                      backgroundColor: shapeOp.fill || 'transparent',
                    }}
                  />
                )}
                {shapeOp.shape === 'circle' && (
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      border: `${(shapeOp.thickness || 1) * scale}px solid ${shapeOp.color}`,
                      backgroundColor: shapeOp.fill || 'transparent',
                    }}
                  />
                )}
                {shapeOp.shape === 'line' && (
                  <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    <line
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="100%"
                      stroke={shapeOp.color}
                      strokeWidth={(shapeOp.thickness || 1) * scale}
                    />
                  </svg>
                )}
                {isSelected && (
                  <button
                    className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOperation(op.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }

          if (op.type === 'highlight') {
            return (
              <div
                key={op.id}
                className={`absolute cursor-move ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: op.x * scale,
                  top: op.y * scale,
                  width: op.width * scale,
                  height: op.height * scale,
                  backgroundColor: op.color,
                  opacity: 0.3,
                }}
                onMouseDown={(e) => handleMouseDown(e, op.id)}
              >
                {isSelected && (
                  <button
                    className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOperation(op.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }

          if (op.type === 'image') {
            const imgOp = op as ImageOperation;
            return (
              <div
                key={op.id}
                className={`absolute cursor-move ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: imgOp.x * scale,
                  top: imgOp.y * scale,
                  width: imgOp.width * scale,
                  height: imgOp.height * scale,
                }}
                onMouseDown={(e) => handleMouseDown(e, op.id)}
              >
                <div className="w-full h-full border border-dashed border-gray-400 flex items-center justify-center bg-gray-50 text-xs text-gray-500">
                  🖼️ Image
                </div>
                {isSelected && (
                  <button
                    className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOperation(op.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
