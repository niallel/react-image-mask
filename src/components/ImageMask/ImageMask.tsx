import { useRef, useState } from "react";
import ImageMaskControls from "./ImageMaskControls"
import { ToolMode } from "./types";
import ImageMaskCanvas, { ImageMaskCanvasRef } from "./ImageMaskCanvas";

const ImageMask = () => {
    const canvasRef = useRef<ImageMaskCanvasRef>(null);
    const [toolMode, setToolMode] = useState<ToolMode>('move');

    return (
        <div className="tool-mode">
            <ImageMaskControls setToolMode={setToolMode} toolMode={toolMode} />
            <ImageMaskCanvas ref={canvasRef} src="https://picsum.photos/1024/1024" toolMode={toolMode} />
        </div>
    )
}

export default ImageMask;