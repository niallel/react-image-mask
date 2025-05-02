import { useState } from "react";
import { ToolMode, ColorOption } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDownLeftRight, faEraser, faMarker, faPenToSquare, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./ImageMaskControls.css";

const colorOptions: ColorOption[] = [
  { name: 'Black', value: 'rgba(0, 0, 0, 1)' },
  { name: 'White', value: 'rgba(255, 255, 255, 1)' },
  { name: 'Red', value: 'rgba(255, 0, 0, 1)' },
  { name: 'Green', value: 'rgba(0, 255, 0, 1)' },
  { name: 'Blue', value: 'rgba(0, 0, 255, 1)' },
  { name: 'Orange', value: 'rgba(255, 165, 0, 1)' },
  { name: 'Pink', value: 'rgba(255, 192, 203, 1)' }
];

const brushSizes = [5, 10, 20, 30, 40, 50, 60];
const zoomLevels = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

export const ImageMaskControls = ({setToolMode, toolMode, clearCanvas, currentZoom, onResetZoom, onUndo, onRedo, canUndo, canRedo, onDownloadMask, onMaskColorChange, currentMaskColor, onOpacityChange, currentOpacity, onBrushSizeChange, currentBrushSize, onZoomChange}: {
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
    currentBrushSize?: number,
    onZoomChange?: (zoom: number) => void
}) => {
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    const [showBrushDropdown, setShowBrushDropdown] = useState(false);
    const [showZoomDropdown, setShowZoomDropdown] = useState(false);

    const handleZoomChange = (zoom: number) => {
        const stage = document.querySelector('.Stage');
        if (stage) {
            const scale = zoom / 100;
            (stage as any).scale({ x: scale, y: scale });
            // Update the zoom display
            if (onZoomChange) {
                onZoomChange(zoom);
            }
        }
        setShowZoomDropdown(false);
    };

    return (
        <div className="controls-bar">
            <div className="tool-buttons">
                <button 
                    className={toolMode === 'move' ? 'active' : ''}
                    onClick={() => setToolMode('move')}
                    title="Move"
                >
                    <FontAwesomeIcon icon={faUpDownLeftRight} size="lg"/>
                </button>

                <button 
                    className={toolMode === 'mask-freehand' ? 'active' : ''}
                    onClick={() => setToolMode('mask-freehand')}
                    title="Freehand Mask"
                >
                    <FontAwesomeIcon icon={faMarker} size="lg"/>
                </button>

                <button 
                    className={toolMode === 'mask-box' ? 'active' : ''}
                    onClick={() => setToolMode('mask-box')}
                    title="Box Mask"
                >
                    <FontAwesomeIcon icon={faPenToSquare} size="lg"/>
                </button>

                <button 
                    className={toolMode === 'eraser-freehand' ? 'active' : ''}
                    onClick={() => setToolMode('eraser-freehand')}
                    title="Freehand Eraser"
                >
                    <FontAwesomeIcon icon={faEraser} size="lg"/>
                </button>

                <button 
                    className={toolMode === 'eraser-box' ? 'active' : ''}
                    onClick={() => setToolMode('eraser-box')}
                    title="Box Eraser"
                >
                    <FontAwesomeIcon icon={faEraser} size="lg"/>
                </button>
            </div>

            <div className="dropdown-container">
                <button 
                    className="dropdown-button"
                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                    title="Color Options"
                >
                    <div className="current-color" style={{ backgroundColor: currentMaskColor }} />
                </button>
                {showColorDropdown && (
                    <div className="dropdown-menu color-dropdown">
                        {colorOptions.map((color) => (
                            <button
                                key={color.name}
                                className={`color-option ${currentMaskColor === color.value ? 'active' : ''}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => {
                                    onMaskColorChange?.(color.value);
                                    setShowColorDropdown(false);
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="dropdown-container">
                <button 
                    className="dropdown-button"
                    onClick={() => setShowBrushDropdown(!showBrushDropdown)}
                    title="Brush Size"
                >
                    <div className="current-brush" style={{ 
                        width: currentBrushSize, 
                        height: currentBrushSize,
                        backgroundColor: toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.3)' : currentMaskColor?.replace('1)', '0.3)'),
                        border: `1px solid ${toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.5)' : currentMaskColor}`
                    }} />
                </button>
                {showBrushDropdown && (
                    <div className="dropdown-menu brush-dropdown">
                        {brushSizes.map((size) => (
                            <button
                                key={size}
                                className={`brush-option ${currentBrushSize === size ? 'active' : ''}`}
                                onClick={() => {
                                    onBrushSizeChange?.(size);
                                    setShowBrushDropdown(false);
                                }}
                                title={`${size}px`}
                            >
                                <div 
                                    className="brush-size-circle"
                                    style={{
                                        width: size,
                                        height: size,
                                        backgroundColor: toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.3)' : currentMaskColor?.replace('1)', '0.3)'),
                                        border: `1px solid ${toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.5)' : currentMaskColor}`
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="opacity-control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentOpacity ? currentOpacity * 100 : 50}
                    onChange={(e) => onOpacityChange?.(Number(e.target.value) / 100)}
                    title={`Opacity: ${currentOpacity ? Math.round(currentOpacity * 100) : 50}%`}
                />
            </div>

            <div className="action-buttons">
                {clearCanvas && (
                    <button onClick={clearCanvas} title="Clear Mask">
                        Clear
                    </button>
                )}
                {onUndo && (
                    <button onClick={onUndo} disabled={!canUndo} title="Undo">
                        Undo
                    </button>
                )}
                {onRedo && (
                    <button onClick={onRedo} disabled={!canRedo} title="Redo">
                        Redo
                    </button>
                )}
                {onDownloadMask && (
                    <button onClick={onDownloadMask} title="Download Mask">
                        Download
                    </button>
                )}
            </div>

            <div className="dropdown-container">
                <button 
                    className="dropdown-button"
                    onClick={() => setShowZoomDropdown(!showZoomDropdown)}
                    title="Zoom Level"
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} size="lg"/>
                    <span>{currentZoom}%</span>
                </button>
                {showZoomDropdown && (
                    <div className="dropdown-menu zoom-dropdown">
                        {zoomLevels.map((zoom) => (
                            <button
                                key={zoom}
                                className={`zoom-option ${currentZoom === zoom ? 'active' : ''}`}
                                onClick={() => handleZoomChange(zoom)}
                                title={`${zoom}%`}
                            >
                                {zoom}%
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageMaskControls;