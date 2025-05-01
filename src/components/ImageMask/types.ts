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
  toolMode?: ToolMode;
  ref?: React.RefObject<React.FC<ImageMaskProps>>;
}

export interface ColorOption {
  name: string;
  value: string;
} 