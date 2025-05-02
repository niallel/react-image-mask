import { useState } from "react";
import { ToolMode } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDownLeftRight, faEraser, faMarker, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export const ImageMaskControls = ({setToolMode, toolMode, clearCanvas, currentZoom, onResetZoom}: {
    setToolMode: (toolMode: ToolMode) => void, 
    toolMode: ToolMode,
    clearCanvas?: () => void,
    currentZoom?: number,
    onResetZoom?: () => void
}) => {

    // const [currentOpacity, setCurrentOpacity] = useState<number>(opacity);
    return (
        <div className="controls">
            <button 
                className={toolMode === 'move' ? 'active' : ''}
                onClick={() => setToolMode('move')}
                >
                <FontAwesomeIcon icon={faUpDownLeftRight} size="2x"/><span>Move</span>
            </button>

            <button 
                className={toolMode === 'mask-freehand' ? 'active' : ''}
                onClick={() => setToolMode('mask-freehand')}
                >
                <FontAwesomeIcon icon={faMarker} size="2x"/>
            </button>

            <button 
                className={toolMode === 'mask-box' ? 'active' : ''}
                onClick={() => setToolMode('mask-box')}
                >
                <FontAwesomeIcon icon={faPenToSquare} size="2x"/>
            </button>

            <button 
                className={toolMode === 'eraser-freehand' ? 'active' : ''}
                onClick={() => setToolMode('eraser-freehand')}
                >
                <FontAwesomeIcon icon={faEraser} size="2x"/>
            </button>

            <button 
                className={toolMode === 'eraser-box' ? 'active' : ''}
                onClick={() => setToolMode('eraser-box')}
                >
                <FontAwesomeIcon icon={faEraser} size="2x"/>
            </button>

            {clearCanvas && <button 
                onClick={() => clearCanvas()}
                >
                Clear Mask
            </button>}
            <div className="zoom-display">
                Zoom: {currentZoom}%
                {onResetZoom && <button onClick={onResetZoom}>Reset Zoom</button>}
            </div>
        </div>
    )
}

export default ImageMaskControls;