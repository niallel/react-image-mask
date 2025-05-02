export type ToolMode = 'move' | 'mask-freehand' | 'mask-box' | 'eraser-freehand' | 'eraser-box' | 'clear';

export interface Point {
  x: number;
  y: number;
}

export interface BoxSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HistoryState {
  canvasData: string;
  toolMode: ToolMode;
}

export interface ImageMaskProps {
  src: string;
  maskColor?: string;
  width?: number;
  height?: number;
  opacity?: number;
  toolMode: ToolMode;
  ref?: React.RefObject<React.FC<ImageMaskProps>>;
  onZoomChange?: (zoom: number) => void;
}

export interface ColorOption {
  name: string;
  value: string;
} 

export interface ImageMaskCanvasRef {
  getMaskData: () => string | null;
  clearMask: () => void;
  undo: () => void;
  redo: () => void;
  setToolMode: (mode: ToolMode) => void;
  setMaskColor: (color: string) => void;
  setOpacity: (opacity: number) => void;
  setBrushSize: (size: number) => void;
}