export type ToolMode = 'move' | 'mask-freehand' | 'mask-box' | 'mask-polygon' | 'eraser-freehand' | 'eraser-box' | 'clear';

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
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
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
  canUndo: boolean;
  canRedo: boolean;
  setZoom: (zoomPercentage: number) => void;
}