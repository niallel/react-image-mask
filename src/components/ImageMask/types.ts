/**
 * Available tool modes for the image mask component
 * @typedef {string} ToolMode
 */
export type ToolMode = 
  /** Move/pan tool for navigating around the canvas */ 'move' | 
  /** Freehand drawing tool for creating mask areas */ 'mask-freehand' | 
  /** Box selection tool for creating rectangular mask areas */ 'mask-box' | 
  /** Polygon selection tool for creating custom shaped mask areas */ 'mask-polygon' | 
  /** Freehand eraser tool for removing mask areas */ 'eraser-freehand' | 
  /** Box eraser tool for removing rectangular mask areas */ 'eraser-box' | 
  /** Clear tool for removing all mask areas */ 'clear';

/**
 * Represents a 2D point with x and y coordinates
 * @interface Point
 */
export interface Point {
  /** X coordinate in pixels */
  x: number;
  /** Y coordinate in pixels */
  y: number;
}

/**
 * Represents a rectangular selection area
 * @interface BoxSelection
 */
export interface BoxSelection {
  /** X coordinate of the top-left corner */
  x: number;
  /** Y coordinate of the top-left corner */
  y: number;
  /** Width of the selection in pixels */
  width: number;
  /** Height of the selection in pixels */
  height: number;
}

/**
 * Represents a state in the undo/redo history
 * @interface HistoryState
 */
export interface HistoryState {
  /** Base64 encoded canvas data representing the mask state */
  canvasData: string;
  /** The tool mode that was active when this state was created */
  toolMode: ToolMode;
}

/**
 * Configuration object for controlling which UI controls are displayed
 * @interface ControlsConfig
 */
export interface ControlsConfig {
  /** Whether to show the download mask button */
  showDownloadButton?: boolean;
  /** Whether to show the clear mask button */
  showClearButton?: boolean;
  /** Whether to show the undo/redo buttons */
  showUndoRedo?: boolean;
  /** Whether to show the tool selection buttons */
  showToolButtons?: boolean;
  /** Whether to show brush size controls */
  showBrushControls?: boolean;
  /** Whether to show color picker controls */
  showColorControls?: boolean;
  /** Whether to show opacity slider controls */
  showOpacityControls?: boolean;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
}

/**
 * Props for the main ImageMask component
 * @interface ImageMaskProps
 */
export interface ImageMaskProps {
  /** Source URL of the image to mask. Defaults to a placeholder image */
  src?: string;
  /** Color of the mask in RGBA format. Defaults to 'rgba(0, 0, 0, 1)' */
  maskColor?: string;
  /** Width of the canvas in pixels. If not provided, uses container width */
  width?: number;
  /** Height of the canvas in pixels. If not provided, uses container height */
  height?: number;
  /** Opacity of the mask overlay (0-1). Defaults to 0.5 */
  opacity?: number;
  /** Size of the brush in pixels. Defaults to 10 */
  brushSize?: number;
  /** Configuration for which controls to display */
  controlsConfig?: ControlsConfig;
  /** Callback fired when the mask data changes */
  onMaskChange?: (maskData: string | null) => void;
  /** Callback fired when the zoom level changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback fired when the history state changes (undo/redo availability) */
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  /** CSS class name for the container element */
  className?: string;
}

/**
 * Props for the ImageMaskCanvas component (lower-level canvas component)
 * @interface ImageMaskCanvasProps
 */
export interface ImageMaskCanvasProps {
  /** Source URL of the image to mask (required) */
  src: string;
  /** Color of the mask in RGBA format */
  maskColor?: string;
  /** Width of the canvas in pixels */
  width?: number;
  /** Height of the canvas in pixels */
  height?: number;
  /** Opacity of the mask overlay (0-1) */
  opacity?: number;
  /** Current active tool mode */
  toolMode: ToolMode;
  /** React ref for the canvas component */
  ref?: React.RefObject<React.FC<ImageMaskCanvasProps>>;
  /** Callback fired when the zoom level changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback fired when the history state changes */
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

/**
 * Represents a color option for the color picker
 * @interface ColorOption
 */
export interface ColorOption {
  /** Display name of the color */
  name: string;
  /** RGBA color value */
  value: string;
}

/**
 * Ref interface for the ImageMaskCanvas component
 * Provides imperative API for controlling the canvas programmatically
 * @interface ImageMaskCanvasRef
 */
export interface ImageMaskCanvasRef {
  /** Returns the current mask as a base64 encoded PNG image */
  getMaskData: () => string | null;
  /** Clears all mask data from the canvas */
  clearMask: () => void;
  /** Undoes the last action */
  undo: () => void;
  /** Redoes the last undone action */
  redo: () => void;
  /** Sets the active tool mode */
  setToolMode: (mode: ToolMode) => void;
  /** Sets the mask color */
  setMaskColor: (color: string) => void;
  /** Sets the mask opacity (0-1) */
  setOpacity: (opacity: number) => void;
  /** Sets the brush size in pixels */
  setBrushSize: (size: number) => void;
  /** Whether undo is currently available */
  canUndo: boolean;
  /** Whether redo is currently available */
  canRedo: boolean;
  /** Sets the zoom level as a percentage (100 = 100%) */
  setZoom: (zoomPercentage: number) => void;
}

/**
 * Ref interface for the main ImageMask component
 * Provides basic imperative API for controlling the component
 * @interface ImageMaskRef
 */
export interface ImageMaskRef {
  /** Returns the current mask as a base64 encoded PNG image */
  getMaskData: () => string | null;
  /** Clears all mask data from the canvas */
  clearMask: () => void;
  /** Undoes the last action */
  undo: () => void;
  /** Redoes the last undone action */
  redo: () => void;
}