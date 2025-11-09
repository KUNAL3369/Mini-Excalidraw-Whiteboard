import React from 'react';
import { Tool, Shape } from '../types';

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
}

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  textStyle?: TextStyle;
  onTextStyleChange?: (style: Partial<TextStyle>) => void;
  selectedShape?: Shape | null;
}

const Toolbar = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  textStyle,
  onTextStyleChange,
  selectedShape,
}: ToolbarProps) => {
  const tools: { id: Tool; label: string; icon: string; }[] = [
    { id: 'select', label: 'Select', icon: '👆' },
    { id: 'pencil', label: 'Pencil', icon: '✏️' },
    { id: 'line', label: 'Line', icon: '📏' },
    { id: 'rectangle', label: 'Rectangle', icon: '▭' },
    { id: 'circle', label: 'Circle', icon: '○' },
    { id: 'arrow', label: 'Arrow', icon: '➡️' },
    { id: 'text', label: 'Text', icon: '📝' },
  ];

  return (
    <div className="flex flex-col bg-gray-100 border-b border-gray-300">
      <div className="flex items-center gap-2 p-4">
        <div className="flex gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`px-3 py-2 rounded ${
                currentTool === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-200'
              } border border-gray-300`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        <div className="ml-4 flex gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Text formatting toolbar */}
      {(currentTool === 'text' || (currentTool === 'select' && selectedShape && selectedShape.type === 'text')) && onTextStyleChange && textStyle && (
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-t border-gray-200">
          <select
            value={textStyle.fontFamily}
            onChange={(e) => onTextStyleChange({ fontFamily: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
          >
            {['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>

          <select
            value={textStyle.fontSize}
            onChange={(e) => onTextStyleChange({ fontSize: Number(e.target.value) })}
            className="px-2 py-1 border rounded text-sm w-20"
          >
            {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>

          <input
            type="color"
            value={textStyle.color}
            onChange={(e) => onTextStyleChange({ color: e.target.value })}
            className="w-8 h-8 p-1 border rounded cursor-pointer"
            title="Text Color"
          />
        </div>
      )}
    </div>
  );
};

export default Toolbar;
