/// <reference types="react" />
import * as react from 'react';
import react__default from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type ToolMode = 'move' | 'mask-freehand' | 'mask-box' | 'mask-polygon' | 'eraser-freehand' | 'eraser-box' | 'clear';
interface Point {
    x: number;
    y: number;
}
interface BoxSelection {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface HistoryState {
    canvasData: string;
    toolMode: ToolMode;
}
interface ImageMaskProps {
    src?: string;
    maskColor?: string;
    width?: number;
    height?: number;
    opacity?: number;
    brushSize?: number;
    onMaskChange?: (maskData: string | null) => void;
    onZoomChange?: (zoom: number) => void;
    onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
    className?: string;
}
interface ImageMaskCanvasProps {
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
interface ColorOption {
    name: string;
    value: string;
}
interface ImageMaskCanvasRef {
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
interface ImageMaskRef {
    getMaskData: () => string | null;
    clearMask: () => void;
    undo: () => void;
    redo: () => void;
}

declare const ImageMask: react.ForwardRefExoticComponent<ImageMaskProps & react.RefAttributes<ImageMaskRef>>;
//# sourceMappingURL=ImageMask.d.ts.map

declare const ImageMaskCanvas: react__default.ForwardRefExoticComponent<Omit<ImageMaskCanvasProps, "ref"> & react__default.RefAttributes<ImageMaskCanvasRef>>;
//# sourceMappingURL=ImageMaskCanvas.d.ts.map

declare const ImageMaskControls: ({ setToolMode, toolMode, clearCanvas, currentZoom, undo, redo, canUndo, canRedo, onDownloadMask, setMaskColor, currentMaskColor, setOpacity, currentOpacity, setBrushSize, currentBrushSize, setZoom }: {
    setToolMode: (toolMode: ToolMode) => void;
    toolMode: ToolMode;
    clearCanvas?: (() => void) | undefined;
    currentZoom?: number | undefined;
    undo?: (() => void) | undefined;
    redo?: (() => void) | undefined;
    canUndo?: boolean | undefined;
    canRedo?: boolean | undefined;
    onDownloadMask?: (() => void) | undefined;
    setMaskColor?: ((color: string) => void) | undefined;
    currentMaskColor?: string | undefined;
    setOpacity?: ((opacity: number) => void) | undefined;
    currentOpacity?: number | undefined;
    setBrushSize?: ((size: number) => void) | undefined;
    currentBrushSize?: number | undefined;
    setZoom?: ((zoom: number) => void) | undefined;
}) => react_jsx_runtime.JSX.Element;

declare const downloadMask: (maskCanvas: HTMLCanvasElement | null, width: number, height: number) => void;

export { ImageMask, ImageMaskCanvas, ImageMaskControls, downloadMask };
export type { BoxSelection, ColorOption, HistoryState, ImageMaskCanvasProps, ImageMaskCanvasRef, ImageMaskProps, ImageMaskRef, Point, ToolMode };
