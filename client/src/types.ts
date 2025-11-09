export interface Shape {
  id: string;
  type: 'rectangle' | 'square' | 'line' | 'arrow' | 'text' | 'circle' | 'pencil';
  path?: Point[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  content?: string;
  pageId: string;
}

export interface Page {
  id: string;
  name: string;
  shapes: Shape[];
}

export interface Point {
  x: number;
  y: number;
}

export type Tool = 'select' | 'pencil' | 'line' | 'rectangle' | 'square' | 'circle' | 'arrow' | 'text';
