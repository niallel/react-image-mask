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

// Controls configuration interface
export interface ControlsConfig {
  showDownloadButton?: boolean;
  showClearButton?: boolean;
  showUndoRedo?: boolean;
  showToolButtons?: boolean;
  showBrushControls?: boolean;
  showColorControls?: boolean;
  showOpacityControls?: boolean;
  showZoomControls?: boolean;
}

// Props for the main ImageMask component
export interface ImageMaskProps {
  src?: string;
  maskColor?: string;
  width?: number;
  height?: number;
  opacity?: number;
  brushSize?: number;
  controlsConfig?: ControlsConfig;
  onMaskChange?: (maskData: string | null) => void;
  onZoomChange?: (zoom: number) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  className?: string;
}

// Props for the ImageMaskCanvas component
export interface ImageMaskCanvasProps {
  src: string;
  maskColor?: string;
  width?: number;
  height?: number;
  opacity?: number;
  toolMode: ToolMode;
  ref?: React.RefObject<React.FC<ImageMaskCanvasProps>>;
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

export interface ImageMaskRef {
  getMaskData: () => string | null;
  clearMask: () => void;
  undo: () => void;
  redo: () => void;
}