import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import ImageMaskControls from "./ImageMaskControls"
import { ToolMode, ImageMaskProps, ImageMaskRef, ControlsConfig } from "./types";
import ImageMaskCanvas from "./ImageMaskCanvas";
import { ImageMaskCanvasRef } from "./types";

/**
 * ImageMask - A comprehensive React component for creating image masks with drawing tools
 * 
 * This is the main component that combines the drawing canvas with intuitive controls.
 * It provides multiple drawing tools (freehand, box, polygon), eraser tools, zoom/pan 
 * functionality, and full touch gesture support for mobile devices.
 * 
 * Features:
 * - Multiple drawing tools (freehand, box selection, polygon selection)
 * - Eraser tools for precise mask editing
 * - Zoom and pan functionality with mouse wheel and touch gestures
 * - Undo/redo history with configurable depth
 * - Customizable brush size, opacity, and colors
 * - Touch gestures for iPad/mobile (pinch-to-zoom, two-finger pan)
 * - Apple Pencil support
 * - Export functionality (PNG download)
 * - Configurable UI controls
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <ImageMask 
 *   src="https://example.com/image.jpg"
 *   onMaskChange={(maskData) => console.log('Mask updated:', maskData)}
 * />
 * 
 * // Advanced usage with custom configuration
 * const controlsConfig = {
 *   showDownloadButton: false,
 *   showBrushControls: true,
 *   showColorControls: true
 * };
 * 
 * <ImageMask
 *   src="https://example.com/image.jpg"
 *   maskColor="rgba(255, 0, 0, 1)"
 *   opacity={0.7}
 *   brushSize={20}
 *   controlsConfig={controlsConfig}
 *   onMaskChange={handleMaskChange}
 *   onZoomChange={handleZoomChange}
 *   onHistoryChange={handleHistoryChange}
 * />
 * ```
 */
const ImageMask = forwardRef<ImageMaskRef, ImageMaskProps>(({
  /** Image source URL - defaults to a placeholder image */
  src = "https://picsum.photos/1024/1024",
  /** Initial mask color in RGBA format */
  maskColor = 'rgba(0, 0, 0, 1)',
  /** Initial opacity of the mask overlay (0-1) */
  opacity = 0.5,
  /** Initial brush size in pixels */
  brushSize = 10,
  /** Configuration object for controlling which UI elements are displayed */
  controlsConfig = {
    showDownloadButton: true,
    showClearButton: true,
    showUndoRedo: true,
    showToolButtons: true,
    showBrushControls: true,
    showColorControls: true,
    showOpacityControls: true,
    showZoomControls: true
  },
  /** Callback fired when the mask data changes */
  onMaskChange,
  /** Callback fired when the zoom level changes */
  onZoomChange,
  /** Callback fired when the undo/redo history state changes */
  onHistoryChange,
  /** CSS class name for the root container */
  className = "tool-mode"
}, ref) => {
    // Ref to the underlying canvas component for imperative operations
    const canvasRef = useRef<ImageMaskCanvasRef>(null);
    
    // Internal state management for UI controls
    const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
    const [currentZoom, setCurrentZoom] = useState<number>(1);
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const [currentMaskColor, setCurrentMaskColor] = useState<string>(maskColor);
    const [currentOpacity, setCurrentOpacity] = useState<number>(opacity);
    const [currentBrushSize, setCurrentBrushSize] = useState<number>(brushSize);

    /**
     * Expose imperative API methods through the component ref
     * This allows parent components to control the mask programmatically
     */
    useImperativeHandle(ref, () => ({
      /** Returns the current mask as a base64 encoded PNG image */
      getMaskData: () => canvasRef.current?.getMaskData() || null,
      /** Clears all mask data from the canvas */
      clearMask: () => canvasRef.current?.clearMask(),
      /** Undoes the last drawing action */
      undo: () => canvasRef.current?.undo(),
      /** Redoes the last undone action */
      redo: () => canvasRef.current?.redo(),
    }));

    /**
     * Clears all mask data and notifies parent components
     * Used internally by the clear button in the controls
     */
    const clearMask = useCallback(() => {
        canvasRef.current?.clearMask();
        // Notify parent component that mask has been cleared
        if (onMaskChange) {
            onMaskChange(null);
        }
    }, [onMaskChange]);

    /**
     * Handles changes in undo/redo history state
     * Updates internal state and propagates changes to parent components
     * 
     * @param {boolean} canUndo - Whether undo is currently available
     * @param {boolean} canRedo - Whether redo is currently available
     */
    const handleHistoryChange = useCallback((canUndo: boolean, canRedo: boolean) => {
        // Update internal state for UI controls
        setCanUndo(canUndo);
        setCanRedo(canRedo);
        
        // Notify parent component of history state changes
        if (onHistoryChange) {
            onHistoryChange(canUndo, canRedo);
        }
        
        // Notify parent component of mask data changes
        if (onMaskChange) {
            const maskData = canvasRef.current?.getMaskData();
            onMaskChange(maskData || null);
        }
    }, [onHistoryChange, onMaskChange]);

    /**
     * Handles zoom level changes from the canvas
     * Updates internal state and propagates to parent components
     * 
     * @param {number} zoom - New zoom level as a percentage (100 = 100%)
     */
    const handleZoomChange = useCallback((zoom: number) => {
        setCurrentZoom(zoom);
        if (onZoomChange) {
            onZoomChange(zoom);
        }
    }, [onZoomChange]);

    /**
     * Downloads the current mask as a PNG file
     * Triggers a browser download of the mask data as 'mask.png'
     */
    const handleDownloadMask = useCallback(() => {
        const maskData = canvasRef.current?.getMaskData();
        if (maskData) {
            const link = document.createElement('a');
            link.href = maskData;
            link.download = 'mask.png';
            link.click();
        }
    }, []);

    /**
     * Updates the mask color and applies it to the canvas
     * 
     * @param {string} color - New color in RGBA format (e.g., 'rgba(255, 0, 0, 1)')
     */
    const setMaskColor = useCallback((color: string) => {
        setCurrentMaskColor(color);
        canvasRef.current?.setMaskColor(color);
    }, []);

    /**
     * Updates the mask opacity and applies it to the canvas
     * 
     * @param {number} opacity - New opacity value between 0 and 1
     */
    const setOpacity = useCallback((opacity: number) => {
        setCurrentOpacity(opacity);
        canvasRef.current?.setOpacity(opacity);
    }, []);

    /**
     * Updates the brush size and applies it to the canvas
     * 
     * @param {number} size - New brush size in pixels
     */
    const setBrushSize = useCallback((size: number) => {
        setCurrentBrushSize(size);
        canvasRef.current?.setBrushSize(size);
    }, []);

    /**
     * Updates the zoom level of the canvas
     * 
     * @param {number} zoom - New zoom level as a percentage (100 = 100%)
     */
    const setZoom = useCallback((zoom: number) => {
        setCurrentZoom(zoom);
        canvasRef.current?.setZoom(zoom);
    }, []);

    // Synchronize internal state with prop changes
    
    /**
     * Updates the mask color when the maskColor prop changes
     * Ensures the canvas and UI controls stay in sync with external changes
     */
    useEffect(() => {
        setCurrentMaskColor(maskColor);
        canvasRef.current?.setMaskColor(maskColor);
    }, [maskColor]);

    /**
     * Updates the opacity when the opacity prop changes
     * Ensures the canvas and UI controls stay in sync with external changes
     */
    useEffect(() => {
        setCurrentOpacity(opacity);
        canvasRef.current?.setOpacity(opacity);
    }, [opacity]);

    /**
     * Updates the brush size when the brushSize prop changes
     * Ensures the canvas and UI controls stay in sync with external changes
     */
    useEffect(() => {
        setCurrentBrushSize(brushSize);
        canvasRef.current?.setBrushSize(brushSize);
    }, [brushSize]);

    return (
        <div className={className} data-testid="image-mask-container">
            {/* Controls panel with tool selection, settings, and actions */}
            <ImageMaskControls 
                setToolMode={setToolMode} 
                toolMode={toolMode}
                clearCanvas={clearMask}
                currentZoom={currentZoom}
                undo={() => canvasRef.current?.undo()}
                redo={() => canvasRef.current?.redo()}
                canUndo={canUndo}
                canRedo={canRedo}
                onDownloadMask={controlsConfig.showDownloadButton ? handleDownloadMask : undefined}
                setMaskColor={setMaskColor}
                currentMaskColor={currentMaskColor}
                setOpacity={setOpacity}
                currentOpacity={currentOpacity}
                setBrushSize={setBrushSize}
                currentBrushSize={currentBrushSize}
                setZoom={setZoom}
                controlsConfig={controlsConfig}
            />
            {/* Main drawing canvas with touch gesture support */}
            <ImageMaskCanvas 
                ref={canvasRef} 
                src={src}
                toolMode={toolMode}
                onZoomChange={handleZoomChange}
                onHistoryChange={handleHistoryChange}
            />
        </div>
    )
});

// Set display name for better debugging and React Developer Tools
ImageMask.displayName = 'ImageMask';

export default ImageMask;