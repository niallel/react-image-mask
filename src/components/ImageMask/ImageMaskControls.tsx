import { useState } from "react";
import { ToolMode, ColorOption } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDownLeftRight, faEraser, faMarker, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const colorOptions: ColorOption[] = [
  { name: 'Black', value: 'rgba(0, 0, 0, 1)' },
  { name: 'White', value: 'rgba(255, 255, 255, 1)' },
  { name: 'Red', value: 'rgba(255, 0, 0, 1)' },
  { name: 'Green', value: 'rgba(0, 255, 0, 1)' },
  { name: 'Blue', value: 'rgba(0, 0, 255, 1)' },
  { name: 'Orange', value: 'rgba(255, 165, 0, 1)' },
  { name: 'Pink', value: 'rgba(255, 192, 203, 1)' }
];

export const ImageMaskControls = ({setToolMode, toolMode, clearCanvas, currentZoom, onResetZoom, onUndo, onRedo, canUndo, canRedo, onDownloadMask, onMaskColorChange, currentMaskColor, onOpacityChange, currentOpacity, onBrushSizeChange, currentBrushSize}: {
    setToolMode: (toolMode: ToolMode) => void, 
    toolMode: ToolMode,
    clearCanvas?: () => void,
    currentZoom?: number,
    onResetZoom?: () => void,
    onUndo?: () => void,
    onRedo?: () => void,
    canUndo?: boolean,
    canRedo?: boolean,
    onDownloadMask?: () => void,
    onMaskColorChange?: (color: string) => void,
    currentMaskColor?: string,
    onOpacityChange?: (opacity: number) => void,
    currentOpacity?: number,
    onBrushSizeChange?: (size: number) => void,
    currentBrushSize?: number
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
            <div className="history-controls">
                {onUndo && <button onClick={onUndo} disabled={!canUndo}>Undo</button>}
                {onRedo && <button onClick={onRedo} disabled={!canRedo}>Redo</button>}
            </div>
            {onDownloadMask && <button onClick={onDownloadMask}>Download Mask</button>}
            <div className="color-control">
                <div className="color-section">
                    <label>Mask Color:</label>
                    <div className="color-options">
                        {colorOptions.map((color) => (
                            <button
                                key={color.name}
                                className={`color-option ${currentMaskColor === color.value ? 'active' : ''}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => onMaskColorChange?.(color.value)}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
                <div className="opacity-section">
                    <label>Opacity: {currentOpacity ? Math.round(currentOpacity * 100) : 50}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentOpacity ? currentOpacity * 100 : 50}
                        onChange={(e) => onOpacityChange?.(Number(e.target.value) / 100)}
                    />
                </div>
            </div>
            <div className="brush-size-section">
                <label>Brush Size:</label>
                <div className="brush-size-options">
                    {[5, 10, 20, 30, 40, 50, 60].map((size) => (
                        <button
                            key={size}
                            className={`brush-size-option ${currentBrushSize === size ? 'active' : ''}`}
                            onClick={() => onBrushSizeChange?.(size)}
                            title={`${size}px`}
                        >
                            <div 
                                className="brush-size-circle"
                                style={{
                                    width: size,
                                    height: size,
                                    borderRadius: '50%',
                                    backgroundColor: currentBrushSize === size 
                                        ? (toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 1)' : currentMaskColor)
                                        : (toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.3)' : currentMaskColor?.replace('1)', '0.3)')),
                                    border: `1px solid ${toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.5)' : currentMaskColor}`
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ImageMaskControls;