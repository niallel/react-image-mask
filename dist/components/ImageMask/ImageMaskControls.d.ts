import { ToolMode } from "./types";
import "./ImageMaskControls.css";
export declare const ImageMaskControls: ({ setToolMode, toolMode, clearCanvas, currentZoom, undo, redo, canUndo, canRedo, onDownloadMask, setMaskColor, currentMaskColor, setOpacity, currentOpacity, setBrushSize, currentBrushSize, setZoom }: {
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
}) => import("react/jsx-runtime").JSX.Element;
export default ImageMaskControls;
//# sourceMappingURL=ImageMaskControls.d.ts.map