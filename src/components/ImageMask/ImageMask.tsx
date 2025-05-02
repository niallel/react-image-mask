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

    return (
        <div className="tool-mode">
            <ImageMaskControls 
                setToolMode={setToolMode} 
                toolMode={toolMode}
                clearCanvas={clearMask}
                currentZoom={currentZoom}
                onResetZoom={() => setCurrentZoom(100)}
                onUndo={() => canvasRef.current?.undo()}
                onRedo={() => canvasRef.current?.redo()}
                canUndo={canUndo}
                canRedo={canRedo}
                onDownloadMask={handleDownloadMask}
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