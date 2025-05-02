import { useRef, useState, useCallback } from "react";
import ImageMaskControls from "./ImageMaskControls"
import { ToolMode } from "./types";
import ImageMaskCanvas from "./ImageMaskCanvas";
import { ImageMaskCanvasRef } from "./types";

const ImageMask = () => {
    const canvasRef = useRef<ImageMaskCanvasRef>(null);
    const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
    const [currentZoom, setCurrentZoom] = useState<number>(1);

    const clearMask = useCallback(() => {
        canvasRef.current?.clearMask();
    }, []);

    return (
        <div className="tool-mode">
            <ImageMaskControls 
                setToolMode={setToolMode} 
                toolMode={toolMode}
                clearCanvas={clearMask}
                currentZoom={currentZoom}
                onResetZoom={() => setCurrentZoom(100)}
            />
            <ImageMaskCanvas 
                ref={canvasRef} 
                src="https://picsum.photos/1024/1024" 
                toolMode={toolMode}
                onZoomChange={setCurrentZoom}
            />
        </div>
    )
}

export default ImageMask;