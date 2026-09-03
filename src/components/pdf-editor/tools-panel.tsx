'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  PDFOperation,
  TextOperation,
  ShapeOperation,
  ImageOperation,
  HighlightOperation,
} from '@/lib/doc-engine/pdf-operations';

interface ToolsPanelProps {
  onAddOperation: (op: PDFOperation) => void;
  selectedTool: string | null;
  onSelectTool: (tool: string | null) => void;
  currentPage: number;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  onAddOperation,
  selectedTool,
  onSelectTool,
  currentPage,
}) => {
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(12);

  const addText = () => {
    if (!textValue.trim()) return;
    const op: TextOperation = {
      type: 'text',
      id: crypto.randomUUID(),
      page: currentPage,
      x: 100,
      y: 100,
      text: textValue,
      fontSize,
      color: '#000000',
    };
    onAddOperation(op);
    setTextValue('');
  };

  const addShape = (shape: 'rect' | 'circle' | 'line') => {
    const op: ShapeOperation = {
      type: 'shape',
      id: crypto.randomUUID(),
      page: currentPage,
      x: 150,
      y: 150,
      width: 100,
      height: 60,
      shape,
      color: '#000000',
      thickness: 2,
    };
    onAddOperation(op);
  };

  const addHighlight = () => {
    const op: HighlightOperation = {
      type: 'highlight',
      id: crypto.randomUUID(),
      page: currentPage,
      x: 100,
      y: 200,
      width: 200,
      height: 20,
      color: '#ffff00',
    };
    onAddOperation(op);
  };

  return (
    <div className="w-64 border-r bg-muted/30 p-4 flex flex-col gap-6 overflow-y-auto">
      <h2 className="font-semibold text-lg">Tools</h2>

      {/* Text Tool */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Text</h3>
        <textarea
          className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          placeholder="Enter text..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label className="text-xs">Size:</label>
          <input
            type="number"
            className="w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min={6}
            max={72}
          />
        </div>
        <Button onClick={addText} className="w-full" size="sm">
          Add Text
        </Button>
      </div>

      {/* Shapes */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Shapes</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => addShape('rect')}>
            ▭ Rect
          </Button>
          <Button variant="outline" size="sm" onClick={() => addShape('circle')}>
            ○ Circle
          </Button>
          <Button variant="outline" size="sm" onClick={() => addShape('line')}>
            / Line
          </Button>
        </div>
      </div>

      {/* Highlight */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Highlight</h3>
        <Button variant="outline" size="sm" onClick={addHighlight} className="w-full">
          Add Highlight
        </Button>
      </div>

      <div className="mt-auto text-xs text-muted-foreground">
        Click on the canvas to place elements. Drag to move.
      </div>
    </div>
  );
};
