import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import ImageMaskControls from "./ImageMaskControls"
import { ToolMode, ImageMaskProps, ImageMaskRef } from "./types";
import ImageMaskCanvas from "./ImageMaskCanvas";
import { ImageMaskCanvasRef } from "./types";

const ImageMask = forwardRef<ImageMaskRef, ImageMaskProps>(({
  src = "https://picsum.photos/1024/1024",
  maskColor = 'rgba(0, 0, 0, 1)',
  opacity = 0.5,
  brushSize = 10,
  onMaskChange,
  onZoomChange,
  onHistoryChange,
  className = "tool-mode"
}, ref) => {
    const canvasRef = useRef<ImageMaskCanvasRef>(null);
    const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
    const [currentZoom, setCurrentZoom] = useState<number>(1);
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const [currentMaskColor, setCurrentMaskColor] = useState<string>(maskColor);
    const [currentOpacity, setCurrentOpacity] = useState<number>(opacity);
    const [currentBrushSize, setCurrentBrushSize] = useState<number>(brushSize);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      getMaskData: () => canvasRef.current?.getMaskData() || null,
      clearMask: () => canvasRef.current?.clearMask(),
      undo: () => canvasRef.current?.undo(),
      redo: () => canvasRef.current?.redo(),
    }));

    const clearMask = useCallback(() => {
        canvasRef.current?.clearMask();
        // Notify parent of mask change
        if (onMaskChange) {
            onMaskChange(null);
        }
    }, [onMaskChange]);

    const handleHistoryChange = useCallback((canUndo: boolean, canRedo: boolean) => {
        setCanUndo(canUndo);
        setCanRedo(canRedo);
        // Notify parent of history change
        if (onHistoryChange) {
            onHistoryChange(canUndo, canRedo);
        }
        // Notify parent of mask change
        if (onMaskChange) {
            const maskData = canvasRef.current?.getMaskData();
            onMaskChange(maskData || null);
        }
    }, [onHistoryChange, onMaskChange]);

    const handleZoomChange = useCallback((zoom: number) => {
        setCurrentZoom(zoom);
        if (onZoomChange) {
            onZoomChange(zoom);
        }
    }, [onZoomChange]);

    const handleDownloadMask = useCallback(() => {
        const maskData = canvasRef.current?.getMaskData();
        if (maskData) {
            const link = document.createElement('a');
            link.href = maskData;
            link.download = 'mask.png';
            link.click();
        }
    }, []);

    const setMaskColor = useCallback((color: string) => {
        setCurrentMaskColor(color);
        canvasRef.current?.setMaskColor(color);
    }, []);

    const setOpacity = useCallback((opacity: number) => {
        setCurrentOpacity(opacity);
        canvasRef.current?.setOpacity(opacity);
    }, []);

    const setBrushSize = useCallback((size: number) => {
        setCurrentBrushSize(size);
        canvasRef.current?.setBrushSize(size);
    }, []);

    const setZoom = useCallback((zoom: number) => {
        setCurrentZoom(zoom);
        canvasRef.current?.setZoom(zoom);
    }, []);

    // Update internal state when props change
    useEffect(() => {
        setCurrentMaskColor(maskColor);
        canvasRef.current?.setMaskColor(maskColor);
    }, [maskColor]);

    useEffect(() => {
        setCurrentOpacity(opacity);
        canvasRef.current?.setOpacity(opacity);
    }, [opacity]);

    useEffect(() => {
        setCurrentBrushSize(brushSize);
        canvasRef.current?.setBrushSize(brushSize);
    }, [brushSize]);

    return (
        <div className={className} data-testid="image-mask-container">
            <ImageMaskControls 
                setToolMode={setToolMode} 
                toolMode={toolMode}
                clearCanvas={clearMask}
                currentZoom={currentZoom}
                undo={() => canvasRef.current?.undo()}
                redo={() => canvasRef.current?.redo()}
                canUndo={canUndo}
                canRedo={canRedo}
                onDownloadMask={handleDownloadMask}
                setMaskColor={setMaskColor}
                currentMaskColor={currentMaskColor}
                setOpacity={setOpacity}
                currentOpacity={currentOpacity}
                setBrushSize={setBrushSize}
                currentBrushSize={currentBrushSize}
                setZoom={setZoom}
            />
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

ImageMask.displayName = 'ImageMask';

export default ImageMask;