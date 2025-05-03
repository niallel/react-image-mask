import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image, Group, Line, Rect, Circle } from 'react-konva';
import Konva from 'konva';
import { downloadMask } from './utils/downloadMask';
import { ToolMode, Point, BoxSelection, HistoryState, ImageMaskProps, ImageMaskCanvasRef } from './types';
import './ImageMaskCanvas.css';

const ImageMaskCanvas = forwardRef<ImageMaskCanvasRef, ImageMaskProps>((props, ref) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentBox, setCurrentBox] = useState<BoxSelection | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [tempCanvas, setTempCanvas] = useState<HTMLCanvasElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentOpacity, setCurrentOpacity] = useState<number>(props.opacity || 0.5);
  const prevOpacityRef = useRef<number>(props.opacity || 0.5);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [maskColor, setMaskColor] = useState<string>('rgba(0, 0, 0, 1)');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [tempPolygonPoint, setTempPolygonPoint] = useState<Point | null>(null);

  const { src, width, height, onZoomChange, toolMode, onHistoryChange } = props;
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const drawingPathRef = useRef<Point[]>([]);
  const lastUpdateTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const getScaledPoint = useCallback((point: Point): Point => {
    return {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };
  }, [position, scale]);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      console.log('Image loaded with dimensions:', img.width, 'x', img.height);
      setImage(img);
      // Send initial zoom value when image is loaded
      onZoomChange?.(Math.round(scale * 100));
    };

    // Initialize mask canvas
    const canvas = document.createElement('canvas');
    canvas.width = width || 1024;
    canvas.height = height || 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setMaskCanvas(canvas);

    // Initialize temp canvas
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tempCtx = temp.getContext('2d');
    if (tempCtx) {
      tempCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setTempCanvas(temp);

    // Add initial empty state to history
    const initialState: HistoryState = {
      canvasData: canvas.toDataURL(),
      toolMode: 'mask-freehand'
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, [src, width, height, scale, onZoomChange]);

  // Initialize temporary canvas for drawing operations
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width || 1024;
    canvas.height = height || 1024;
    tempCanvasRef.current = canvas;
    return () => {
      tempCanvasRef.current = null;
    };
  }, [width, height]);

  const updateMaskImage = useCallback(() => {
    if (!maskCanvas) return;

    const img = new window.Image();
    img.src = maskCanvas.toDataURL();
    img.onload = () => {
      setMaskImage(img);
    };
  }, [maskCanvas]);

  const saveToHistory = useCallback(() => {
    if (!maskCanvas) return;

    const newState: HistoryState = {
      canvasData: maskCanvas.toDataURL(),
      toolMode: toolMode
    };

    // If we're not at the end of history, remove future states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Emit history change event - enable undo if we have more than one state
    onHistoryChange?.(newHistory.length > 1, false);
  }, [maskCanvas, history, historyIndex, toolMode, onHistoryChange]);

  const loadStateFromHistory = (index: number) => {
    if (!maskCanvas || index < 0 || index >= history.length) return;

    const state = history[index];
    const img = new window.Image();
    img.src = state.canvasData;
    img.onload = () => {
      const ctx = maskCanvas.getContext('2d');
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, width || 1024, height || 1024);
        // Draw the previous state
        ctx.drawImage(img, 0, 0);
        
        // Apply current opacity to the loaded state
        const imageData = ctx.getImageData(0, 0, width || 1024, height || 1024);
        const data = imageData.data;

        // Extract RGB values from the mask color
        const rgbMatch = maskColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const [_, r, g, b] = rgbMatch;
          
          // Update the alpha channel for all non-transparent pixels
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {  // If pixel is not transparent
              // Set the RGB values to match the mask color
              data[i-3] = parseInt(r);
              data[i-2] = parseInt(g);
              data[i-1] = parseInt(b);
              // Set the alpha to the current opacity, but never to 0
              data[i] = Math.max(1, Math.round(currentOpacity * 255));
            }
          }
          
          // Put the modified data back
          ctx.putImageData(imageData, 0, 0);
        }
        
        // Update the mask image
        updateMaskImage();
      }
    };
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      loadStateFromHistory(newIndex);
      setHistoryIndex(newIndex);
      onHistoryChange?.(newIndex > 0, true);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      loadStateFromHistory(newIndex);
      setHistoryIndex(newIndex);
      onHistoryChange?.(true, newIndex < history.length - 1);
    }
  };

  const getMaskColorWithOpacity = useCallback(() => {
    // Extract RGB values from the mask color
    const rgbMatch = maskColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return maskColor;
    
    const [_, r, g, b] = rgbMatch;
    // Ensure opacity is never 0
    const opacity = Math.max(0.01, currentOpacity);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, [maskColor, currentOpacity]);

  // Throttle the preview update
  const updatePreview = useCallback(() => {
    if (drawingPathRef.current.length > 0) {
      setCurrentPath([...drawingPathRef.current]);
    }
  }, []);

  const drawOnMask = useCallback((points: Point[], isEraser: boolean = false) => {
    if (!maskCanvas || !tempCanvasRef.current) return;
    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');
    if (!ctx || !tempCtx) return;
    if (points.length < 2) return;

    // Clear the temporary canvas
    tempCtx.clearRect(0, 0, width || 1024, height || 1024);
    
    // Copy the current mask state to the temporary canvas
    tempCtx.drawImage(maskCanvas, 0, 0);

    if (isEraser) {
      // For eraser, use destination-out to remove existing mask
      tempCtx.globalCompositeOperation = 'destination-out';
      tempCtx.beginPath();
      tempCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        tempCtx.lineTo(points[i].x, points[i].y);
      }
      tempCtx.lineWidth = brushSize;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      tempCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
      tempCtx.stroke();
    } else {
      // For drawing mask, use source-over to replace existing content
      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.beginPath();
      tempCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        tempCtx.lineTo(points[i].x, points[i].y);
      }
      tempCtx.lineWidth = brushSize;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      tempCtx.strokeStyle = getMaskColorWithOpacity();
      tempCtx.stroke();
    }

    // Reset composite operation
    tempCtx.globalCompositeOperation = 'source-over';

    // Copy the result back to the main canvas
    ctx.clearRect(0, 0, width || 1024, height || 1024);
    ctx.drawImage(tempCanvasRef.current, 0, 0);

    // Update the mask image
    updateMaskImage();
  }, [maskCanvas, brushSize, getMaskColorWithOpacity, updateMaskImage, width, height]);

  const drawBoxOnMask = useCallback((box: BoxSelection, isEraser: boolean = false) => {
    if (!maskCanvas || !tempCanvasRef.current) return;
    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');
    if (!ctx || !tempCtx) return;

    if (isEraser) {
      // For eraser, draw directly on the main canvas
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(box.x, box.y, box.width, box.height);
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // For drawing mask, draw directly on the main canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = getMaskColorWithOpacity();
      ctx.fillRect(box.x, box.y, box.width, box.height);
    }

    // Update the mask image
    updateMaskImage();
  }, [maskCanvas, getMaskColorWithOpacity, updateMaskImage]);

  const drawPolygonOnMask = useCallback((points: Point[]) => {
    if (!maskCanvas || !tempCanvasRef.current) return;
    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');
    if (!ctx || !tempCtx) return;
    if (points.length < 3) return;

    // Clear the temporary canvas
    tempCtx.clearRect(0, 0, width || 1024, height || 1024);
    
    // Copy the current mask state to the temporary canvas
    tempCtx.drawImage(maskCanvas, 0, 0);

    // Draw the polygon
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.beginPath();
    tempCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      tempCtx.lineTo(points[i].x, points[i].y);
    }
    tempCtx.closePath();
    tempCtx.fillStyle = getMaskColorWithOpacity();
    tempCtx.fill();

    // Copy the result back to the main canvas
    ctx.clearRect(0, 0, width || 1024, height || 1024);
    ctx.drawImage(tempCanvasRef.current, 0, 0);

    // Update the mask image
    updateMaskImage();
  }, [maskCanvas, getMaskColorWithOpacity, updateMaskImage, width, height]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    const scaledPoint = getScaledPoint(point);
    setCursorPosition(scaledPoint);

    if (props.toolMode === 'mask-polygon') {
      if (isDrawingPolygon && polygonPoints.length > 0) {
        setTempPolygonPoint(scaledPoint);
      }
      return;
    }

    if (!isDrawing || !startPoint) return;

    if (props.toolMode === 'mask-box' || props.toolMode === 'eraser-box') {
      const x = Math.min(startPoint.x, scaledPoint.x);
      const y = Math.min(startPoint.y, scaledPoint.y);
      const width = Math.abs(scaledPoint.x - startPoint.x);
      const height = Math.abs(scaledPoint.y - startPoint.y);
      setCurrentBox({ x, y, width, height });
    } else {
      // Add point to the ref instead of state
      drawingPathRef.current.push(scaledPoint);
      
      // Throttle the preview update
      const now = performance.now();
      if (now - lastUpdateTimeRef.current > 16) { // ~60fps
        lastUpdateTimeRef.current = now;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(updatePreview);
      }
    }
  }, [isDrawing, startPoint, props.toolMode, updatePreview, getScaledPoint, isDrawingPolygon, polygonPoints]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (props.toolMode === 'move') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    const scaledPoint = getScaledPoint(point);

    if (props.toolMode === 'mask-polygon') {
      if (!isDrawingPolygon) {
        setIsDrawingPolygon(true);
        setPolygonPoints([scaledPoint]);
      } else {
        // Check if we're closing the polygon (clicking near the first point)
        if (polygonPoints.length > 2) {
          const firstPoint = polygonPoints[0];
          const distance = Math.sqrt(
            Math.pow(scaledPoint.x - firstPoint.x, 2) +
            Math.pow(scaledPoint.y - firstPoint.y, 2)
          );
          if (distance < 10) { // Close the polygon if within 10 pixels of first point
            drawPolygonOnMask(polygonPoints);
            setIsDrawingPolygon(false);
            setPolygonPoints([]);
            setTempPolygonPoint(null);
            return;
          }
        }
        setPolygonPoints([...polygonPoints, scaledPoint]);
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(scaledPoint);
    
    if (props.toolMode === 'mask-box' || props.toolMode === 'eraser-box') {
      setCurrentBox({ x: scaledPoint.x, y: scaledPoint.y, width: 0, height: 0 });
    } else {
      setCurrentPath([scaledPoint]);
    }
  };

  const handleMouseUp = useCallback(() => {
    if (props.toolMode === 'mask-polygon') return;

    if (!isDrawing || !props.toolMode || props.toolMode === 'move') return;

    const isEraser = props.toolMode.startsWith('eraser');
    
    if (props.toolMode === 'mask-box' || props.toolMode === 'eraser-box') {
      if (currentBox) {
        // Clamp box coordinates to image boundaries
        const clampedBox = {
          x: Math.max(0, Math.min(currentBox.x, width || 1024)),
          y: Math.max(0, Math.min(currentBox.y, height || 1024)),
          width: Math.min(width || 1024 - currentBox.x, Math.max(0, currentBox.width)),
          height: Math.min(height || 1024 - currentBox.y, Math.max(0, currentBox.height))
        };
        drawBoxOnMask(clampedBox, isEraser);
        saveToHistory();
      }
    } else if (drawingPathRef.current.length > 1) {
      // Clamp the last point to image boundaries
      const lastPoint = drawingPathRef.current[drawingPathRef.current.length - 1];
      const clampedPoint = {
        x: Math.max(0, Math.min(lastPoint.x, width || 1024)),
        y: Math.max(0, Math.min(lastPoint.y, height || 1024))
      };
      const clampedPath = [...drawingPathRef.current.slice(0, -1), clampedPoint];
      drawOnMask(clampedPath, isEraser);
      saveToHistory();
    }

    // Clean up
    setIsDrawing(false);
    drawingPathRef.current = [];
    setCurrentPath([]);
    setCurrentBox(null);
    setStartPoint(null);
  }, [isDrawing, props.toolMode, currentBox, width, height, drawOnMask, drawBoxOnMask, saveToHistory]);

  const clearMask = () => {
    if (!maskCanvas || !tempCanvas) return;

    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvas.getContext('2d');
    if (!ctx || !tempCtx) return;

    // Clear both canvases
    ctx.clearRect(0, 0, width || 1024, height || 1024);
    tempCtx.clearRect(0, 0, width || 1024, height || 1024);
    
    // Reset the canvases to transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, width || 1024, height || 1024);
    tempCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    tempCtx.fillRect(0, 0, width || 1024, height || 1024);
    
    // Update the mask image
    updateMaskImage();
    
    // Reset states
    setCurrentPath([]);
    setCurrentBox(null);
    setStartPoint(null);
    
    // Save to history
    saveToHistory();
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Calculate new scale
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.98 : oldScale * 1.02;
    // Limit scale between 1 and 10
    const boundedScale = Math.min(Math.max(1, newScale), 10);

    // Calculate new position to zoom towards mouse pointer
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newPosition = {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    };

    setScale(boundedScale);
    setPosition(newPosition);
    
    // Call the callback if provided, converting scale to percentage
    props.onZoomChange?.(Math.round(boundedScale * 100));
  };

  const updateMaskColor = (newColor: string) => {
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Get the current mask data
    const imageData = ctx.getImageData(0, 0, width || 1024, height || 1024);
    const data = imageData.data;

    // Extract RGB values from the new color
    const rgbMatch = newColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return;
    
    const [_, r, g, b] = rgbMatch;

    // Update all non-transparent pixels to the new color
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // If pixel is not transparent
        data[i] = parseInt(r);     // R
        data[i + 1] = parseInt(g); // G
        data[i + 2] = parseInt(b); // B
        // Keep original alpha
      }
    }

    // Put the modified data back
    ctx.putImageData(imageData, 0, 0);
    updateMaskImage();
    saveToHistory();
  };

  const handleMouseLeave = () => {
    setCursorPosition(null);
  };

  useEffect(() => {
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Get the current mask data
    const imageData = ctx.getImageData(0, 0, width || 1024, height || 1024);
    const data = imageData.data;

    // Extract RGB values from the mask color
    const rgbMatch = maskColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return;
    
    const [_, r, g, b] = rgbMatch;

    // Update the alpha channel for all non-transparent pixels
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {  // If pixel is not transparent
        // Set the RGB values to match the mask color
        data[i-3] = parseInt(r);
        data[i-2] = parseInt(g);
        data[i-1] = parseInt(b);
        // Set the alpha to the current opacity, but never to 0
        data[i] = Math.max(1, Math.round(currentOpacity * 255));
      }
    }

    // Put the modified data back
    ctx.putImageData(imageData, 0, 0);
    updateMaskImage();
  }, [currentOpacity, maskCanvas, maskColor, width, height, updateMaskImage]);

  // Reset polygon state when tool mode changes
  useEffect(() => {
    if (props.toolMode !== 'mask-polygon') {
      setIsDrawingPolygon(false);
      setPolygonPoints([]);
      setTempPolygonPoint(null);
    }
  }, [props.toolMode]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const setZoom = (zoomPercentage: number) => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const newScale = zoomPercentage / 100;
    const boundedScale = Math.min(Math.max(1, newScale), 10);

    // Get the center of the visible area
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2
    };

    // Calculate new position to keep the center point fixed
    const mousePointTo = {
      x: (center.x - position.x) / oldScale,
      y: (center.y - position.y) / oldScale,
    };

    const newPosition = {
      x: center.x - mousePointTo.x * boundedScale,
      y: center.y - mousePointTo.y * boundedScale,
    };

    setScale(boundedScale);
    setPosition(newPosition);
    props.onZoomChange?.(Math.round(boundedScale * 100));
  };

  const setOpacity = useCallback((opacity: number) => {
    setCurrentOpacity(opacity);
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Get the current mask data
    const imageData = ctx.getImageData(0, 0, width || 1024, height || 1024);
    const data = imageData.data;

    // Extract RGB values from the mask color
    const rgbMatch = maskColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return;
    
    const [_, r, g, b] = rgbMatch;

    // Update the alpha channel for all non-transparent pixels
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {  // If pixel is not transparent
        // Set the RGB values to match the mask color
        data[i-3] = parseInt(r);
        data[i-2] = parseInt(g);
        data[i-1] = parseInt(b);
        // Set the alpha to the current opacity, but never to 0
        data[i] = Math.max(1, Math.round(opacity * 255));
      }
    }

    // Put the modified data back
    ctx.putImageData(imageData, 0, 0);
    updateMaskImage();
  }, [maskCanvas, maskColor, width, height, updateMaskImage]);

  useImperativeHandle(ref, () => ({
    getMaskData: () => maskCanvas?.toDataURL() || null,
    clearMask,
    undo,
    redo,
    setToolMode: (mode: ToolMode) => {
      // No need to set state since it's controlled by parent
    },
    setMaskColor: (color: string) => {
      setMaskColor(color);
      updateMaskColor(color);
    },
    setOpacity: setOpacity,
    setBrushSize: (size: number) => {
      setBrushSize(size);
    },
    canUndo: history.length > 1,
    canRedo: historyIndex < history.length - 1,
    setZoom: setZoom
  }));

  return (
    <div className="image-mask-container">
      <div className="controls">
      </div>
      <Stage
        ref={stageRef}
        width={width || 1024}
        height={height || 1024}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onMouseLeave={handleMouseLeave}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={props.toolMode === 'move'}
        onDragEnd={(e) => {
          setPosition({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        data-testid="drawing-stage"
        style={{
          cursor: props.toolMode === 'move' ? 'grab' :
                 props.toolMode === 'mask-box' || props.toolMode === 'eraser-box' || props.toolMode === 'mask-polygon' ? 'crosshair' :
                 props.toolMode === 'clear' ? 'pointer' : 'none'
        }}
      >
        <Layer ref={layerRef}>
          {image && (
            <Image
              image={image}
              width={width || 1024}
              height={height || 1024}
            />
          )}
          {maskImage && (
            <Image
              image={maskImage}
              width={width || 1024}
              height={height || 1024}
            />
          )}
          {props.toolMode === 'mask-polygon' && polygonPoints.length > 0 && (
            <Group>
              <Line
                points={[...polygonPoints, tempPolygonPoint].filter((point): point is Point => point !== null).flatMap(point => [point.x, point.y])}
                stroke={getMaskColorWithOpacity()}
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
                closed={false}
              />
              {polygonPoints.map((point, index) => {
                const isFirstPoint = index === 0;
                const isNearFirstPoint = isFirstPoint && tempPolygonPoint && 
                  Math.sqrt(
                    Math.pow(tempPolygonPoint.x - point.x, 2) +
                    Math.pow(tempPolygonPoint.y - point.y, 2)
                  ) < 10;
                
                return (
                  <Circle
                    key={index}
                    x={point.x}
                    y={point.y}
                    radius={isNearFirstPoint ? 8 : 4}
                    fill={getMaskColorWithOpacity()}
                    stroke="white"
                    strokeWidth={1}
                  />
                );
              })}
            </Group>
          )}
          {currentPath.length > 0 && (
            <Group>
              <Line
                points={currentPath.flatMap(point => [point.x, point.y])}
                stroke={props.toolMode?.startsWith('eraser') ? `rgba(255, 0, 0, ${currentOpacity})` : getMaskColorWithOpacity()}
                strokeWidth={brushSize}
                lineCap="round"
                lineJoin="round"
              />
            </Group>
          )}
          {currentBox && (
            <Rect
              x={currentBox.x}
              y={currentBox.y}
              width={currentBox.width}
              height={currentBox.height}
              stroke={props.toolMode?.startsWith('eraser') ? `rgba(255, 0, 0, ${currentOpacity})` : getMaskColorWithOpacity()}
              strokeWidth={2}
              fill={props.toolMode?.startsWith('eraser') ? `rgba(255, 0, 0, ${currentOpacity})` : getMaskColorWithOpacity()}
            />
          )}
          {cursorPosition && (props.toolMode === 'mask-freehand' || props.toolMode === 'eraser-freehand') && (
            <Circle
              x={cursorPosition.x}
              y={cursorPosition.y}
              radius={brushSize / 2}
              stroke={props.toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.5)' : maskColor}
              strokeWidth={0.5}
              fill={props.toolMode?.startsWith('eraser') ? 'rgba(255, 0, 0, 0.3)' : maskColor.replace('1)', '0.3)')}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
});

ImageMaskCanvas.displayName = 'ImageMaskCanvas';

export default ImageMaskCanvas;