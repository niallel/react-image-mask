import { useState, useEffect, useRef } from "react";
import { ToolMode, ColorOption, ImageMaskCanvasRef } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsUpDownLeftRight, faEraser, faMarker, faPenToSquare, faMagnifyingGlass, faRotateLeft, faRotateRight, faTrash, faCircleDown } from "@fortawesome/free-solid-svg-icons";
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

export const ImageMaskControls = ({setToolMode, toolMode, clearCanvas, currentZoom, onResetZoom, onUndo, onRedo, canUndo, canRedo, onDownloadMask, onMaskColorChange, currentMaskColor, onOpacityChange, currentOpacity, onBrushSizeChange, currentBrushSize, onZoomChange, canvasRef}: {
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
    onZoomChange?: (zoom: number) => void,
    canvasRef: React.RefObject<ImageMaskCanvasRef | null>
}) => {
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    const [showBrushDropdown, setShowBrushDropdown] = useState(false);
    const [showZoomDropdown, setShowZoomDropdown] = useState(false);
    const controlsRef = useRef<HTMLDivElement>(null);

    const closeAllDropdowns = () => {
        setShowColorDropdown(false);
        setShowBrushDropdown(false);
        setShowZoomDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
                closeAllDropdowns();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleColorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowColorDropdown(!showColorDropdown);
        setShowBrushDropdown(false);
        setShowZoomDropdown(false);
    };

    const handleBrushClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowBrushDropdown(!showBrushDropdown);
        setShowColorDropdown(false);
        setShowZoomDropdown(false);
    };

    const handleZoomClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowZoomDropdown(!showZoomDropdown);
        setShowColorDropdown(false);
        setShowBrushDropdown(false);
    };

    const handleZoomChange = (zoom: number) => {
        if (onZoomChange) {
            onZoomChange(zoom);
            // Call setZoom directly on the canvas ref
            canvasRef.current?.setZoom(zoom);
        }
        setShowZoomDropdown(false);
    };

    return (
        <div 
            className="controls-bar" 
            ref={controlsRef}
            onClick={(e) => {
                // Only close dropdowns if clicking directly on the bar (not on buttons or controls)
                if (e.target === e.currentTarget) {
                    closeAllDropdowns();
                }
            }}
        >
            <div className="action-buttons">
                {onUndo && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onUndo();
                            closeAllDropdowns();
                        }} 
                        disabled={!canUndo} 
                        title="Undo"
                    >
                        <div className="button-content">
                            <FontAwesomeIcon icon={faRotateLeft} size="lg"/>
                            <span>Undo</span>
                        </div>
                    </button>
                )}
                {onRedo && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRedo();
                            closeAllDropdowns();
                        }} 
                        disabled={!canRedo} 
                        title="Redo"
                    >
                        <div className="button-content">
                            <FontAwesomeIcon icon={faRotateRight} size="lg"/>
                            <span>Redo</span>
                        </div>
                    </button>
                )}
            </div>
            <div className="tool-buttons">
                <button 
                    className={toolMode === 'move' ? 'active' : ''}
                    onClick={(e) => {
                        e.stopPropagation();
                        setToolMode('move');
                        closeAllDropdowns();
                    }}
                    title="Move"
                >
                    <div className="button-content">
                        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} size="lg"/>
                        <span>Move</span>
                    </div>
                </button>

                <button 
                    className={toolMode === 'mask-freehand' ? 'active' : ''}
                    onClick={(e) => {
                        e.stopPropagation();
                        setToolMode('mask-freehand');
                        closeAllDropdowns();
                    }}
                    title="Freehand Mask"
                >
                    <div className="button-content">
                        <FontAwesomeIcon icon={faMarker} size="lg"/>
                        <span>Draw</span>
                    </div>
                </button>

                <button 
                    className={toolMode === 'mask-box' ? 'active' : ''}
                    onClick={(e) => {
                        e.stopPropagation();
                        setToolMode('mask-box');
                        closeAllDropdowns();
                    }}
                    title="Box Mask"
                >
                    <div className="button-content">
                        <FontAwesomeIcon icon={faPenToSquare} size="lg"/>
                        <span>Box</span>
                    </div>
                </button>

                <button 
                    className={toolMode === 'eraser-freehand' ? 'active' : ''}
                    onClick={(e) => {
                        e.stopPropagation();
                        setToolMode('eraser-freehand');
                        closeAllDropdowns();
                    }}
                    title="Freehand Eraser"
                >
                    <div className="button-content">
                        <FontAwesomeIcon icon={faEraser} size="lg"/>
                        <span>Erase</span>
                    </div>
                </button>

                <button 
                    className={toolMode === 'eraser-box' ? 'active' : ''}
                    onClick={(e) => {
                        e.stopPropagation();
                        setToolMode('eraser-box');
                        closeAllDropdowns();
                    }}
                    title="Box Eraser"
                >
                    <div className="button-content">
                        <FontAwesomeIcon icon={faEraser} size="lg"/>
                        <span>Box</span>
                    </div>
                </button>
            </div>

            <div className="dropdown-container">
                <button 
                    className="dropdown-button"
                    onClick={handleBrushClick}
                    title="Brush Size"
                >
                    <div className="button-content">
                        <div className="current-brush" style={{ 
                            width: 20, 
                            height: 20,
                            backgroundColor: toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.3)' : currentMaskColor?.replace('1)', '0.3)'),
                            border: `1px solid ${toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.5)' : currentMaskColor}`
                        }} />
                        <span>{currentBrushSize}px</span>
                    </div>
                </button>
                {showBrushDropdown && (
                    <div className="dropdown-menu brush-dropdown">
                        {brushSizes.map((size) => (
                            <button
                                key={size}
                                className={`brush-option ${currentBrushSize === size ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBrushSizeChange?.(size);
                                    setShowBrushDropdown(false);
                                }}
                                title={`${size}px`}
                            >
                                <span>{size}px</span>
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

            <div className="dropdown-container">
                <button 
                    className="dropdown-button"
                    onClick={handleColorClick}
                    title="Color Options"
                >
                    <div className="button-content">
                        <div className="current-color" style={{ backgroundColor: currentMaskColor }} />
                        <span>Color</span>
                    </div>
                </button>
                {showColorDropdown && (
                    <div className="dropdown-menu color-dropdown">
                        {colorOptions.map((color) => (
                            <button
                                key={color.name}
                                className={`color-option ${currentMaskColor === color.value ? 'active' : ''}`}
                                style={{ backgroundColor: color.value }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMaskColorChange?.(color.value);
                                    setShowColorDropdown(false);
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="opacity-control">
                <div className="button-content">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentOpacity ? currentOpacity * 100 : 50}
                        onChange={(e) => {
                            onOpacityChange?.(Number(e.target.value) / 100);
                            closeAllDropdowns();
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            closeAllDropdowns();
                        }}
                        title={`Opacity: ${currentOpacity ? Math.round(currentOpacity * 100) : 50}%`}
                    />
                    <span>Opacity</span>
                </div>
            </div>

            <div className="action-buttons">
                {clearCanvas && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            clearCanvas();
                            closeAllDropdowns();
                        }} 
                        title="Clear Mask"
                    >
                        <div className="button-content">
                            <FontAwesomeIcon icon={faTrash} size="lg"/>
                            <span>Clear</span>
                        </div>
                    </button>
                )}
                {onDownloadMask && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownloadMask();
                            closeAllDropdowns();
                        }} 
                        title="Download Mask"
                    >
                        <div className="button-content">
                            <FontAwesomeIcon icon={faCircleDown} size="lg"/>
                            <span>Download</span>
                        </div>
                    </button>
                )}
            </div>

            <div className="dropdown-container">
                <button 
                    className="dropdown-button"
                    onClick={handleZoomClick}
                    title="Zoom Level"
                >
                    <div className="button-content">
                        <div className="zoom-icon-text">
                            <FontAwesomeIcon icon={faMagnifyingGlass} size="lg"/>
                            <span>{currentZoom}%</span>
                        </div>
                    </div>
                </button>
                {showZoomDropdown && (
                    <div className="dropdown-menu zoom-dropdown">
                        {zoomLevels.map((zoom) => (
                            <button
                                key={zoom}
                                className={`zoom-option ${currentZoom === zoom ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomChange(zoom);
                                }}
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