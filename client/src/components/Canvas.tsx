import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Shape, Point, Tool } from '../types';

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
}

interface CanvasProps {
  shapes: Shape[];
  currentTool: Tool;
  onShapeAdd: (shape: Omit<Shape, 'id'>) => void;
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void;
  onShapeSelect: (id: string | null) => void;
  selectedShapeId: string | null;
  currentPageId: string;
  textStyle: TextStyle;
}

const Canvas = ({
  shapes,
  currentTool,
  onShapeAdd,
  onShapeUpdate,
  onShapeSelect,
  selectedShapeId,
  currentPageId,
  textStyle,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const [offset, setOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [resizing, setResizing] = useState<{id: string, handle: string} | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<{id: string, x: number, y: number, content: string, fontSize?: number, fontFamily?: string, color?: string} | null>(null);

  const getCanvasCoordinates = useCallback((e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.translate(-shape.width / 2, -shape.height / 2);

    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = 2;

    switch (shape.type) {
      case 'rectangle':
      case 'square':
        ctx.strokeRect(0, 0, shape.width, shape.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(shape.width / 2, shape.height / 2, Math.min(shape.width, shape.height) / 2, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(shape.width, shape.height);
        ctx.stroke();
        break;
      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(0, shape.height / 2);
        ctx.lineTo(shape.width - 10, shape.height / 2);
        ctx.moveTo(shape.width - 10, shape.height / 2);
        ctx.lineTo(shape.width - 15, shape.height / 2 - 5);
        ctx.moveTo(shape.width - 10, shape.height / 2);
        ctx.lineTo(shape.width - 15, shape.height / 2 + 5);
        ctx.stroke();
        break;
      case 'pencil':
        if (shape.path && shape.path.length > 0) {
          ctx.beginPath();
          const offsetX = shape.x;
          const offsetY = shape.y;
          ctx.moveTo(shape.path[0].x - offsetX, shape.path[0].y - offsetY);
          shape.path.forEach((point) => {
            ctx.lineTo(point.x - offsetX, point.y - offsetY);
          });
          ctx.stroke();
        }
        break;
      case 'text':
        if (shape.content) {
          ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'Arial'}`;
          ctx.fillText(shape.content, 0, shape.height / 2);
        }
        break;
    }

    ctx.restore();
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all shapes
    shapes.forEach((shape) => {
      if (shape.pageId === currentPageId) {
        drawShape(ctx, shape);

        // Highlight selected shape and draw resize/rotate handles
        if (shape.id === selectedShapeId) {
          ctx.save();
          ctx.strokeStyle = '#007bff';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);

          // Draw resize handles
          ctx.setLineDash([]);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#007bff';
          
          // Corner handles
          const handleSize = 8;
          const handlePositions = [
            { x: shape.x - 5, y: shape.y - 5 }, // top-left
            { x: shape.x + shape.width + 5, y: shape.y - 5 }, // top-right
            { x: shape.x + shape.width + 5, y: shape.y + shape.height + 5 }, // bottom-right
            { x: shape.x - 5, y: shape.y + shape.height + 5 }, // bottom-left
          ];

          handlePositions.forEach(pos => {
            ctx.beginPath();
            ctx.rect(pos.x - handleSize/2, pos.y - handleSize/2, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
          });

          // Draw rotation handle
          ctx.beginPath();
          ctx.arc(shape.x + shape.width/2, shape.y - 25, handleSize/2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          
          // Draw line connecting rotation handle to shape
          ctx.beginPath();
          ctx.moveTo(shape.x + shape.width/2, shape.y - 5);
          ctx.lineTo(shape.x + shape.width/2, shape.y - 20);
          ctx.stroke();

          ctx.restore();
        }
      }
    });

    // Draw current path for pencil tool
    if (currentTool === 'pencil' && currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
      ctx.restore();
    }
  }, [shapes, currentPageId, selectedShapeId, currentTool, currentPath, drawShape]);

  useEffect(() => {
    render();
  }, [render]);

  const getHandleAtPoint = useCallback((x: number, y: number, shape: Shape): string | null => {
    if (!shape) return null;

    const handleSize = 8;
    const handleHitbox = handleSize / 2;

    // Check rotation handle
    const rotationHandleX = shape.x + shape.width/2;
    const rotationHandleY = shape.y - 25;
    if (Math.abs(x - rotationHandleX) <= handleHitbox && Math.abs(y - rotationHandleY) <= handleHitbox) {
      return 'rotation';
    }

    // Check resize handles
    const handles = [
      { x: shape.x - 5, y: shape.y - 5, name: 'top-left' },
      { x: shape.x + shape.width + 5, y: shape.y - 5, name: 'top-right' },
      { x: shape.x + shape.width + 5, y: shape.y + shape.height + 5, name: 'bottom-right' },
      { x: shape.x - 5, y: shape.y + shape.height + 5, name: 'bottom-left' }
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) <= handleHitbox && Math.abs(y - handle.y) <= handleHitbox) {
        return handle.name;
      }
    }

    return null;
  }, []);

  const getShapeAtPoint = useCallback((x: number, y: number) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.pageId !== currentPageId) continue;

      if (shape.type === 'rectangle' || shape.type === 'square' || shape.type === 'circle' || shape.type === 'text') {
        if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
          return shape;
        }
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        const lineWidth = 6; // Hit detection width
        const dx = shape.width;
        const dy = shape.height;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const normalX = -dy / length;
        const normalY = dx / length;

        const px = x - shape.x;
        const py = y - shape.y;

        const projection = (px * dx + py * dy) / length;
        const distance = Math.abs(px * normalX + py * normalY);

        if (projection >= 0 && projection <= length && distance <= lineWidth) {
          return shape;
        }
      } else if (shape.type === 'pencil' && shape.path) {
        for (let j = 0; j < shape.path.length - 1; j++) {
          const p1 = shape.path[j];
          const p2 = shape.path[j + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length === 0) continue;

          const normalX = -dy / length;
          const normalY = dx / length;

          const px = x - p1.x;
          const py = y - p1.y;

          const projection = (px * dx + py * dy) / length;
          const distance = Math.abs(px * normalX + py * normalY);

          if (projection >= 0 && projection <= length && distance <= 3) {
            return shape;
          }
        }
      }
    }
    return null;
  }, [shapes, currentPageId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Use offset coordinates relative to the canvas for selection correctness
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'select') {
      // Check if we clicked on a handle of the selected shape
      const selectedShape = shapes.find(s => s.id === selectedShapeId);
      if (selectedShape) {
        const handle = getHandleAtPoint(x, y, selectedShape);
        if (handle) {
          if (handle === 'rotation') {
            setRotating(selectedShape.id);
            // Calculate center point for rotation
            const centerX = selectedShape.x + selectedShape.width / 2;
            const centerY = selectedShape.y + selectedShape.height / 2;
            setOffset({ x: centerX, y: centerY });
          } else {
            setResizing({ id: selectedShape.id, handle });
            setOffset({ x: selectedShape.x, y: selectedShape.y });
          }
          return;
        }
      }

      // If no handle was clicked, check for shape selection/dragging
      const clickedShape = getShapeAtPoint(x, y);
      if (clickedShape) {
        setDraggingShapeId(clickedShape.id);
        setOffset({
          x: x - clickedShape.x,
          y: y - clickedShape.y
        });
        onShapeSelect(clickedShape.id);
      } else {
        // Clicked blank area — clear selection
        onShapeSelect(null);
      }
    } else if (currentTool === 'text') {
      // Create new text on click when text tool is selected
      const shape: Omit<Shape, 'id'> = {
        type: 'text',
        x,
        y,
        width: 200,
        height: 24,
        rotation: 0,
        color: textStyle.color || '#000000',
        content: 'New Text',
        fontSize: textStyle.fontSize || 16,
        fontFamily: textStyle.fontFamily || 'Arial',
        pageId: currentPageId,
      };
      onShapeAdd(shape);
      // Automatically open text editor for the new shape
      setEditingText({
        id: 'pending', // Will be updated when shape is added
        x,
        y,
        content: 'New Text',
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        color: textStyle.color,
      });
    } else {
      // Other drawing tools
      setStartPoint({ x, y });
      setIsDrawing(true);
      if (currentTool === 'pencil') {
        setCurrentPath([{ x, y }]);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    const point = getCanvasCoordinates(e);

    if (rotating && currentTool === 'select') {
      const selectedShape = shapes.find(s => s.id === rotating);
      if (selectedShape) {
        // Calculate angle between center and current mouse position
        const dx = point.x - offset.x;
        const dy = point.y - offset.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        onShapeUpdate(rotating, {
          rotation: angle
        });
      }
    } else if (resizing && currentTool === 'select') {
      const selectedShape = shapes.find(s => s.id === resizing.id);
      if (selectedShape) {
        let newX = selectedShape.x;
        let newY = selectedShape.y;
        let newWidth = selectedShape.width;
        let newHeight = selectedShape.height;

        switch (resizing.handle) {
          case 'top-left':
            newWidth = selectedShape.x + selectedShape.width - point.x;
            newHeight = selectedShape.y + selectedShape.height - point.y;
            newX = point.x;
            newY = point.y;
            break;
          case 'top-right':
            newWidth = point.x - selectedShape.x;
            newHeight = selectedShape.y + selectedShape.height - point.y;
            newY = point.y;
            break;
          case 'bottom-right':
            newWidth = point.x - selectedShape.x;
            newHeight = point.y - selectedShape.y;
            break;
          case 'bottom-left':
            newWidth = selectedShape.x + selectedShape.width - point.x;
            newHeight = point.y - selectedShape.y;
            newX = point.x;
            break;
        }

        // Ensure minimum size
        if (newWidth >= 10 && newHeight >= 10) {
          onShapeUpdate(resizing.id, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          });
        }
      }
    } else if (draggingShapeId && currentTool === 'select') {
      // Update shape position while dragging
      onShapeUpdate(draggingShapeId, {
        x: point.x - offset.x,
        y: point.y - offset.y
      });
    } else if (isDrawing && startPoint) {
      if (currentTool === 'pencil') {
        setCurrentPath((prev) => [...prev, point]);
      }
    }
  };

  const handleTextClick = useCallback((e: any) => {
    if (currentTool !== 'select') return; // Only handle double-click text editing in select mode
    
    const point = getCanvasCoordinates(e);
    const clickedShape = shapes
      .filter((shape) => shape.pageId === currentPageId && shape.type === 'text')
      .find((shape) =>
        point.x >= shape.x &&
        point.x <= shape.x + shape.width &&
        point.y >= shape.y &&
        point.y <= shape.y + shape.height
      );
    
    if (clickedShape) {
      setEditingText({
        id: clickedShape.id,
        x: clickedShape.x,
        y: clickedShape.y,
        content: clickedShape.content || '',
        fontSize: clickedShape.fontSize,
        fontFamily: clickedShape.fontFamily,
        color: clickedShape.color
      });
    }
  }, [shapes, currentPageId, getCanvasCoordinates, currentTool]);

  const handleMouseUp = (e: any) => {
    // If we were resizing/rotating, stop those operations
    if (resizing || rotating) {
      setResizing(null);
      setRotating(null);
      return;
    }

    // If we were dragging a shape, end the drag operation
    if (draggingShapeId) {
      setDraggingShapeId(null);
      return;
    }

    if (!isDrawing || !startPoint) return;

    const endPoint = getCanvasCoordinates(e);
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);

    if (currentTool !== 'select' && currentTool !== 'pencil') {
      const shape: Omit<Shape, 'id'> = {
        type: currentTool as Shape['type'],
        x,
        y,
        width: currentTool === 'line' ? width : Math.max(width, 20),
        height: currentTool === 'line' ? height : Math.max(height, 20),
        rotation: 0,
        color: '#000000',
        pageId: currentPageId,
        content: currentTool === 'text' ? 'Text' : undefined,
        fontSize: currentTool === 'text' ? 16 : undefined,
        fontFamily: currentTool === 'text' ? 'Arial' : undefined,
      };

      onShapeAdd(shape);
    } else if (currentTool === 'pencil' && currentPath.length > 1) {
      // Create a path shape for pencil strokes
      const shape: Omit<Shape, 'id'> = {
        type: 'pencil',
        x: Math.min(...currentPath.map(p => p.x)),
        y: Math.min(...currentPath.map(p => p.y)),
        width: Math.max(...currentPath.map(p => p.x)) - Math.min(...currentPath.map(p => p.x)),
        height: Math.max(...currentPath.map(p => p.y)) - Math.min(...currentPath.map(p => p.y)),
        rotation: 0,
        color: '#000000',
        pageId: currentPageId,
        path: currentPath.map(p => ({ x: p.x, y: p.y }))
      };
      onShapeAdd(shape);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPath([]);
  };

  // Update editingText when a new shape is added
  useEffect(() => {
    if (editingText?.id === 'pending') {
      const lastShape = shapes[shapes.length - 1];
      if (lastShape && lastShape.type === 'text') {
        setEditingText(prev => prev ? { ...prev, id: lastShape.id } : null);
      }
    }
  }, [shapes, editingText]);

  // Sync editingText when the underlying shape is updated elsewhere (e.g., toolbar updates)
  useEffect(() => {
    if (editingText && editingText.id && editingText.id !== 'pending') {
      const s = shapes.find(sh => sh.id === editingText.id && sh.type === 'text');
      if (s) {
        setEditingText({
          id: s.id,
          x: s.x,
          y: s.y,
          content: s.content || '',
          fontSize: s.fontSize,
          fontFamily: s.fontFamily,
          color: s.color
        });
      }
    }
  }, [shapes, editingText]);

  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingText) return;
    const newValue = e.target.value;
    setEditingText(prev => prev ? { ...prev, content: newValue } : null);
    // Only send update to API if editingText refers to a real shape id (not 'pending')
    if (editingText.id !== 'pending') {
      onShapeUpdate(editingText.id, { content: newValue });
    }
  }, [editingText, onShapeUpdate]);

  const handleTextStyleChange = useCallback((updates: Partial<Shape>) => {
    if (!editingText) return;
    setEditingText(prev => prev ? { ...prev, ...updates } : null);
    // Only update the persistent shape once it has a real id
    if (editingText.id !== 'pending') {
      onShapeUpdate(editingText.id, updates);
    }
  }, [editingText, onShapeUpdate]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 bg-white cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleTextClick}
      />
      {editingText && (
        <div
          className="absolute"
          style={{
            top: editingText.y,
            left: editingText.x,
            zIndex: 100
          }}
        >
          <div className="flex gap-2 mb-1">
            <input
              type="color"
              value={editingText.color || '#000000'}
              onChange={(e) => handleTextStyleChange({ color: e.target.value })}
              className="w-6 h-6"
            />
            <select
              value={editingText.fontSize || 16}
              onChange={(e) => handleTextStyleChange({ fontSize: Number(e.target.value) })}
              className="text-sm border rounded"
            >
              {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <select
              value={editingText.fontFamily || 'Arial'}
              onChange={(e) => handleTextStyleChange({ fontFamily: e.target.value })}
              className="text-sm border rounded"
            >
              {['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={editingText.content}
            onChange={handleTextInputChange}
            onBlur={() => setEditingText(null)}
            autoFocus
            className="bg-transparent border px-1"
            style={{
              fontSize: `${editingText.fontSize || 16}px`,
              fontFamily: editingText.fontFamily || 'Arial',
              color: editingText.color || '#000000',
              width: '200px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Canvas;
