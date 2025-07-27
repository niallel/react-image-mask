import { useState, useEffect, useRef } from "react";
import { ToolMode, ColorOption, ControlsConfig } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsUpDownLeftRight, faEraser, faMarker, faSquare, faMagnifyingGlass, faRotateLeft, faRotateRight, faTrash, faCircleDown, faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
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

export const ImageMaskControls = ({setToolMode, toolMode, clearCanvas, currentZoom, undo, redo, canUndo, canRedo, onDownloadMask, setMaskColor, currentMaskColor, setOpacity, currentOpacity, setBrushSize, currentBrushSize, setZoom, controlsConfig}: {
    setToolMode: (toolMode: ToolMode) => void, 
    toolMode: ToolMode,
    clearCanvas?: () => void,
    currentZoom?: number,
    undo?: () => void,
    redo?: () => void,
    canUndo?: boolean,
    canRedo?: boolean,
    onDownloadMask?: () => void,
    setMaskColor?: (color: string) => void,
    currentMaskColor?: string,
    setOpacity?: (opacity: number) => void,
    currentOpacity?: number,
    setBrushSize?: (size: number) => void,
    currentBrushSize?: number,
    setZoom?: (zoom: number) => void,
    controlsConfig?: ControlsConfig
}) => {
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    const [showBrushDropdown, setShowBrushDropdown] = useState(false);
    const [showZoomDropdown, setShowZoomDropdown] = useState(false);
    const [showMaskDropdown, setShowMaskDropdown] = useState(false);
    const [showEraserDropdown, setShowEraserDropdown] = useState(false);
    const controlsRef = useRef<HTMLDivElement>(null);

    // Default controls config if not provided
    const config = controlsConfig || {
        showDownloadButton: true,
        showClearButton: true,
        showUndoRedo: true,
        showToolButtons: true,
        showBrushControls: true,
        showColorControls: true,
        showOpacityControls: true,
        showZoomControls: true
    };

    const closeAllDropdowns = () => {
        setShowColorDropdown(false);
        setShowBrushDropdown(false);
        setShowZoomDropdown(false);
        setShowMaskDropdown(false);
        setShowEraserDropdown(false);
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
        setShowMaskDropdown(false);
        setShowEraserDropdown(false);
    };

    const handleBrushClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowBrushDropdown(!showBrushDropdown);
        setShowColorDropdown(false);
        setShowZoomDropdown(false);
        setShowMaskDropdown(false);
        setShowEraserDropdown(false);
    };

    const handleZoomClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowZoomDropdown(!showZoomDropdown);
        setShowColorDropdown(false);
        setShowBrushDropdown(false);
        setShowMaskDropdown(false);
        setShowEraserDropdown(false);
    };

    const handleZoomChange = (zoom: number) => {
        if (setZoom) {
            setZoom(zoom);
        }
        setShowZoomDropdown(false);
    };

    const handleMaskToolSelect = (tool: 'freehand' | 'box' | 'polygon') => {
        setToolMode(`mask-${tool}`);
        setShowMaskDropdown(false);
    };

    const handleEraserToolSelect = (tool: 'freehand' | 'box') => {
        setToolMode(`eraser-${tool}`);
        setShowEraserDropdown(false);
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
            {config.showUndoRedo && (
                <div className="action-buttons">
                    {undo && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                undo();
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
                    {redo && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                redo();
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
            )}
            
            {config.showToolButtons && (
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

                    <div className="dropdown">
                        <button 
                            className={toolMode.startsWith('mask-') ? 'active' : ''}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMaskDropdown(!showMaskDropdown);
                                setShowEraserDropdown(false);
                                setShowColorDropdown(false);
                                setShowBrushDropdown(false);
                                setShowZoomDropdown(false);
                            }}
                            title="Mask Tools"
                        >
                            <div className="button-content">
                                {toolMode === 'mask-freehand' && <FontAwesomeIcon icon={faMarker} size="lg"/>}
                                {toolMode === 'mask-box' && <FontAwesomeIcon icon={faSquare} size="lg"/>}
                                {toolMode === 'mask-polygon' && <FontAwesomeIcon icon={faDrawPolygon} size="lg"/>}
                                {!toolMode.startsWith('mask-') && <FontAwesomeIcon icon={faMarker} size="lg"/>}
                                <span>Mask</span>
                            </div>
                        </button>
                        {showMaskDropdown && (
                            <div className="dropdown-content">
                                <button onClick={() => handleMaskToolSelect('freehand')}>
                                    <div className="button-content">
                                        <FontAwesomeIcon icon={faMarker} size="lg"/>
                                        <span>Freehand</span>
                                    </div>
                                </button>
                                <button onClick={() => handleMaskToolSelect('box')}>
                                    <div className="button-content">
                                        <FontAwesomeIcon icon={faSquare} size="lg"/>
                                        <span>Box</span>
                                    </div>
                                </button>
                                <button onClick={() => handleMaskToolSelect('polygon')}>
                                    <div className="button-content">
                                        <FontAwesomeIcon icon={faDrawPolygon} size="lg"/>
                                        <span>Polygon</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="dropdown">
                        <button 
                            className={toolMode.startsWith('eraser-') ? 'active' : ''}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEraserDropdown(!showEraserDropdown);
                                setShowMaskDropdown(false);
                                setShowColorDropdown(false);
                                setShowBrushDropdown(false);
                                setShowZoomDropdown(false);
                            }}
                            title="Eraser Tools"
                        >
                            <div className="button-content">
                                {toolMode === 'eraser-freehand' && <FontAwesomeIcon icon={faEraser} size="lg"/>}
                                {toolMode === 'eraser-box' && <FontAwesomeIcon icon={faSquare} size="lg"/>}
                                {!toolMode.startsWith('eraser-') && <FontAwesomeIcon icon={faEraser} size="lg"/>}
                                <span>Eraser</span>
                            </div>
                        </button>
                        {showEraserDropdown && (
                            <div className="dropdown-content">
                                <button onClick={() => handleEraserToolSelect('freehand')}>
                                    <div className="button-content">
                                        <FontAwesomeIcon icon={faEraser} size="lg"/>
                                        <span>Freehand</span>
                                    </div>
                                </button>
                                <button onClick={() => handleEraserToolSelect('box')}>
                                    <div className="button-content">
                                        <FontAwesomeIcon icon={faSquare} size="lg"/>
                                        <span>Box</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {config.showBrushControls && (
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
                                        setBrushSize?.(size);
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
            )}

            {config.showColorControls && (
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
                                        setMaskColor?.(color.value);
                                        setShowColorDropdown(false);
                                    }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {config.showOpacityControls && (
                <div className="opacity-control">
                    <div className="button-content">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentOpacity ? currentOpacity * 100 : 50}
                            onChange={(e) => {
                                setOpacity?.(Number(e.target.value) / 100);
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
            )}

            {(config.showClearButton || config.showDownloadButton) && (
                <div className="action-buttons">
                    {clearCanvas && config.showClearButton && (
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
                    {onDownloadMask && config.showDownloadButton && (
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
            )}

            {config.showZoomControls && (
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
            )}
        </div>
    );
};

export default ImageMaskControls;