import { useRef, useState, useCallback } from "react";
import ImageMaskControls from "./ImageMaskControls"
import { ToolMode } from "./types";
import ImageMaskCanvas from "./ImageMaskCanvas";
import { ImageMaskCanvasRef } from "./types";

const ImageMask = () => {
    const canvasRef = useRef<ImageMaskCanvasRef>(null);
    const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
    const [currentZoom, setCurrentZoom] = useState<number>(1);
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const [currentMaskColor, setCurrentMaskColor] = useState<string>('rgba(0, 0, 0, 1)');
    const [currentOpacity, setCurrentOpacity] = useState<number>(0.5);
    const [currentBrushSize, setCurrentBrushSize] = useState<number>(10);

    const clearMask = useCallback(() => {
        canvasRef.current?.clearMask();
    }, []);

    const handleHistoryChange = useCallback((canUndo: boolean, canRedo: boolean) => {
        setCanUndo(canUndo);
        setCanRedo(canRedo);
    }, []);

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

    return (
        <div className="tool-mode" data-testid="image-mask-container">
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
                src="https://picsum.photos/1024/1024" 
                toolMode={toolMode}
                onZoomChange={setCurrentZoom}
                onHistoryChange={handleHistoryChange}
            />
        </div>
    )
}

export default ImageMask;