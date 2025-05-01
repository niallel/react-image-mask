import { useState } from "react";
import { ToolMode } from "./types";

export const ImageMaskControls = ({setToolMode, toolMode}: {setToolMode: (toolMode: ToolMode) => void, toolMode: ToolMode}) => {

    // const [currentOpacity, setCurrentOpacity] = useState<number>(opacity);
    return (
        <div className="controls">
            <button 
                className={toolMode === 'move' ? 'active' : ''}
                onClick={() => setToolMode('move')}
                >
                Move
            </button>

            <button 
                className={toolMode === 'mask-freehand' ? 'active' : ''}
                onClick={() => setToolMode('mask-freehand')}
                >
                Mask Freehand
            </button>

            <button 
                className={toolMode === 'mask-box' ? 'active' : ''}
                onClick={() => setToolMode('mask-box')}
                >
                Mask Box
            </button>

            <button 
                className={toolMode === 'eraser-freehand' ? 'active' : ''}
                onClick={() => setToolMode('eraser-freehand')}
                >
                Eraser Freehand
            </button>

            <button 
                className={toolMode === 'eraser-box' ? 'active' : ''}
                onClick={() => setToolMode('eraser-box')}
                >
                Eraser Box
            </button>
        </div>
    )
}

export default ImageMaskControls;