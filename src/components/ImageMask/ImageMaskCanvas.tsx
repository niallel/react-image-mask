import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image, Group, Line, Rect, Circle } from 'react-konva';
import Konva from 'konva';

import { ToolMode, Point, BoxSelection, HistoryState, ImageMaskCanvasProps, ImageMaskCanvasRef } from './types';
import './ImageMaskCanvas.css';

const ImageMaskCanvas = forwardRef<ImageMaskCanvasRef, ImageMaskCanvasProps>((props, ref) => {
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
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [maskColor, setMaskColor] = useState<string>('rgba(0, 0, 0, 1)');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [tempPolygonPoint, setTempPolygonPoint] = useState<Point | null>(null);
  
  // Container size tracking for responsive layout
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Calculate dimensions that fit the image within the container while maintaining aspect ratio
  const getScaledDimensions = useCallback(() => {
    if (!image) return { width: containerSize.width, height: containerSize.height, scale: 1 };
    
    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = image.width / image.height;
    
    let scaledWidth, scaledHeight, imageScale;
    
    if (imageAspect > containerAspect) {
      // Image is wider than container
      scaledWidth = containerSize.width;
      scaledHeight = containerSize.width / imageAspect;
      imageScale = containerSize.width / image.width;
    } else {
      // Image is taller than container
      scaledWidth = containerSize.height * imageAspect;
      scaledHeight = containerSize.height;
      imageScale = containerSize.height / image.height;
    }
    
    return { width: scaledWidth, height: scaledHeight, scale: imageScale };
  }, [image, containerSize]);



  // Update container size
  useEffect(() => {
        const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        const newWidth = Math.max(Math.round(rect.width - 32 - 2), 200);  // padding + small buffer
        const newHeight = Math.max(Math.round(rect.height - 32 - 16 - 2), 200);  // padding + gap + small buffer
        

        
        setContainerSize(prevSize => {
                    // Only update if there's a meaningful difference (> 1px)
          if (Math.abs(prevSize.width - newWidth) > 1 || Math.abs(prevSize.height - newHeight) > 1) {

            return { width: newWidth, height: newHeight };
          }
          return prevSize;
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateSize(); // Set initial size
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
  
      setImage(img);
      
      // Initialize mask canvas ONLY when image loads
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
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
      
      // Send initial zoom value when image is loaded
      onZoomChange?.(Math.round(scale * 100));
    };
  }, [src]); // Only depend on src - don't recreate canvas on zoom!

  // Initialize temporary canvas for drawing operations
  useEffect(() => {
    if (!image) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    tempCanvasRef.current = canvas;
    return () => {
      tempCanvasRef.current = null;
    };
  }, [image]);

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
      if (ctx && image) {
        // Clear the canvas
        ctx.clearRect(0, 0, image.width, image.height);
        // Draw the previous state
        ctx.drawImage(img, 0, 0);
        
        // Apply current opacity to the loaded state
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
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
    if (!maskCanvas || !tempCanvasRef.current || !image) return;
    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');
    if (!ctx || !tempCtx) return;
    if (points.length < 2) return;

    // Convert display points to image coordinates
    // Points come in as "group coordinates" (already have zoom/pan applied)
    // We need to convert them to image coordinates
    const currentDimensions = calculateDimensions();
    const imagePoints = points.map(point => ({
      x: (point.x / currentDimensions.width) * image.width,
      y: (point.y / currentDimensions.height) * image.height
    }));

    // Use the current dimensions for brush size scaling
    const displayWidth = currentDimensions.width;

    // Clear the temporary canvas
    tempCtx.clearRect(0, 0, image.width, image.height);
    
    // Copy the current mask state to the temporary canvas
    tempCtx.drawImage(maskCanvas, 0, 0);

    if (isEraser) {
      // For eraser, use destination-out to remove existing mask
      tempCtx.globalCompositeOperation = 'destination-out';
      tempCtx.beginPath();
      tempCtx.moveTo(imagePoints[0].x, imagePoints[0].y);
      for (let i = 1; i < imagePoints.length; i++) {
        tempCtx.lineTo(imagePoints[i].x, imagePoints[i].y);
      }
      // Use the same display width calculation as getImagePoint for consistency
      tempCtx.lineWidth = (brushSize / displayWidth) * image.width;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      tempCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
      tempCtx.stroke();
    } else {
      // For drawing mask, use source-over to replace existing content
      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.beginPath();
      tempCtx.moveTo(imagePoints[0].x, imagePoints[0].y);
      for (let i = 1; i < imagePoints.length; i++) {
        tempCtx.lineTo(imagePoints[i].x, imagePoints[i].y);
      }
      // Use the same display width calculation as getImagePoint for consistency
      tempCtx.lineWidth = (brushSize / displayWidth) * image.width;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      tempCtx.strokeStyle = getMaskColorWithOpacity();
      tempCtx.stroke();
    }

    // Reset composite operation
    tempCtx.globalCompositeOperation = 'source-over';

    // Copy the result back to the main canvas
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.drawImage(tempCanvasRef.current, 0, 0);

    // Update the mask image
    updateMaskImage();
  }, [maskCanvas, brushSize, getMaskColorWithOpacity, updateMaskImage, image]);

  const drawBoxOnMask = useCallback((box: BoxSelection, isEraser: boolean = false) => {
    if (!maskCanvas || !tempCanvasRef.current || !image) return;
    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');
    if (!ctx || !tempCtx) return;

    // Convert display coordinates to image coordinates
    // New approach: Stage is exactly the image display size, so direct conversion
    // Note: box coordinates are already in display space (post-getScaledPoint)
    
    // Calculate current display dimensions
    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = image.width / image.height;
    
    let displayWidth, displayHeight;
    if (imageAspect > containerAspect) {
      displayWidth = containerSize.width;
      displayHeight = containerSize.width / imageAspect;
    } else {
      displayWidth = containerSize.height * imageAspect;
      displayHeight = containerSize.height;
    }
    
    // Direct conversion from display coordinates to image coordinates
    const imageBox = {
      x: (box.x / displayWidth) * image.width,
      y: (box.y / displayHeight) * image.height,
      width: (box.width / displayWidth) * image.width,
      height: (box.height / displayHeight) * image.height
    };

    if (isEraser) {
      // For eraser, draw directly on the main canvas
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(imageBox.x, imageBox.y, imageBox.width, imageBox.height);
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // For drawing mask, draw directly on the main canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = getMaskColorWithOpacity();
      ctx.fillRect(imageBox.x, imageBox.y, imageBox.width, imageBox.height);
    }

    // Update the mask image
    updateMaskImage();
  }, [maskCanvas, getMaskColorWithOpacity, updateMaskImage, containerSize, image]);

  const drawPolygonOnMask = useCallback((points: Point[]) => {
    if (!maskCanvas || !tempCanvasRef.current || !image) return;
    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');
    if (!ctx || !tempCtx) return;
    if (points.length < 3) return;

    // Convert display points to image coordinates  
    // New approach: Stage is exactly the image display size, so direct conversion
    // Note: points are already in display space (post-getScaledPoint)
    
    // Calculate current display dimensions  
    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = image.width / image.height;
    
    let displayWidth, displayHeight;
    if (imageAspect > containerAspect) {
      displayWidth = containerSize.width;
      displayHeight = containerSize.width / imageAspect;
    } else {
      displayWidth = containerSize.height * imageAspect;
      displayHeight = containerSize.height;
    }
    
    // Direct conversion from display coordinates to image coordinates
    const imagePoints = points.map(point => ({
      x: (point.x / displayWidth) * image.width,
      y: (point.y / displayHeight) * image.height
    }));

    // Clear the temporary canvas
    tempCtx.clearRect(0, 0, image.width, image.height);
    
    // Copy the current mask state to the temporary canvas
    tempCtx.drawImage(maskCanvas, 0, 0);

    // Draw the polygon
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.beginPath();
    tempCtx.moveTo(imagePoints[0].x, imagePoints[0].y);
    for (let i = 1; i < imagePoints.length; i++) {
      tempCtx.lineTo(imagePoints[i].x, imagePoints[i].y);
    }
    tempCtx.closePath();
    tempCtx.fillStyle = getMaskColorWithOpacity();
    tempCtx.fill();

    // Copy the result back to the main canvas
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.drawImage(tempCanvasRef.current, 0, 0);

    // Update the mask image
    updateMaskImage();
  }, [maskCanvas, getMaskColorWithOpacity, updateMaskImage, containerSize, image]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    // Convert to group coordinates (accounting for zoom/pan)
    const groupPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };
    setCursorPosition(groupPoint);

          if (props.toolMode === 'mask-polygon') {
        if (isDrawingPolygon && polygonPoints.length > 0) {
          setTempPolygonPoint(groupPoint);
        }
        return;
      }

      if (!isDrawing || !startPoint) return;

      if (props.toolMode === 'mask-box' || props.toolMode === 'eraser-box') {
        const x = Math.min(startPoint.x, groupPoint.x);
        const y = Math.min(startPoint.y, groupPoint.y);
        const width = Math.abs(groupPoint.x - startPoint.x);
        const height = Math.abs(groupPoint.y - startPoint.y);
        setCurrentBox({ x, y, width, height });
      } else {
        // Add point to the ref instead of state
        drawingPathRef.current.push(groupPoint);
      
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

    // Convert to group coordinates (accounting for zoom/pan)
    const groupPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };

    if (props.toolMode === 'mask-polygon') {
      if (!isDrawingPolygon) {
        setIsDrawingPolygon(true);
        setPolygonPoints([groupPoint]);
      } else {
        // Check if we're closing the polygon (clicking near the first point)
        if (polygonPoints.length > 2) {
          const firstPoint = polygonPoints[0];
          const distance = Math.sqrt(
            Math.pow(groupPoint.x - firstPoint.x, 2) +
            Math.pow(groupPoint.y - firstPoint.y, 2)
          );
          if (distance < 10) { // Close the polygon if within 10 pixels of first point
            drawPolygonOnMask(polygonPoints);
            saveToHistory();
            setIsDrawingPolygon(false);
            setPolygonPoints([]);
            setTempPolygonPoint(null);
            return;
          }
        }
        setPolygonPoints([...polygonPoints, groupPoint]);
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(groupPoint);
    
    if (props.toolMode === 'mask-box' || props.toolMode === 'eraser-box') {
      setCurrentBox({ x: groupPoint.x, y: groupPoint.y, width: 0, height: 0 });
    } else {
      setCurrentPath([groupPoint]);
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
    if (!maskCanvas || !tempCanvas || !image) return;

    const ctx = maskCanvas.getContext('2d');
    const tempCtx = tempCanvas.getContext('2d');
    if (!ctx || !tempCtx) return;

    // Clear both canvases
    ctx.clearRect(0, 0, image.width, image.height);
    tempCtx.clearRect(0, 0, image.width, image.height);
    
    // Reset the canvases to transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, image.width, image.height);
    tempCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    tempCtx.fillRect(0, 0, image.width, image.height);
    
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

    // If we're at minimum zoom (100%), center the image in the container
    if (boundedScale === 1) {
      const dimensions = getScaledDimensions();
      const newPosition = {
        x: (stage.width() - dimensions.width) / 2,
        y: (stage.height() - dimensions.height) / 2,
      };
      setScale(boundedScale);
      setPosition(newPosition);
    } else {
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
    }
    
    // Call the callback if provided, converting scale to percentage
    props.onZoomChange?.(Math.round(boundedScale * 100));
  };

  const updateMaskColor = (newColor: string) => {
    if (!maskCanvas || !image) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Get the current mask data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
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
    if (!maskCanvas || !image) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Get the current mask data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
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
    
    // Limit scale between 1 and 10
    const boundedScale = Math.min(Math.max(1, newScale), 10);

    // If we're at minimum zoom (100%), center the image in the container
    if (boundedScale === 1) {
      const dimensions = getScaledDimensions();
      const newPosition = {
        x: (stage.width() - dimensions.width) / 2,
        y: (stage.height() - dimensions.height) / 2,
      };
      setScale(boundedScale);
      setPosition(newPosition);
    } else {
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
    }
    
    props.onZoomChange?.(Math.round(boundedScale * 100));
  };

  const setOpacity = useCallback((opacity: number) => {
    setCurrentOpacity(opacity);
    if (!maskCanvas || !image) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Get the current mask data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
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
    getMaskData: () => {
      if (!maskCanvas || !image) return null;
      
      // Create a temporary canvas to convert to solid black pixels
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return null;

      // Draw the current mask
      ctx.drawImage(maskCanvas, 0, 0);

      // Get the image data
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      const data = imageData.data;

      // Convert to mask format: white for masked areas, black for background
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // If pixel was drawn on (masked area)
          data[i] = 255;     // R (white)
          data[i + 1] = 255; // G (white)
          data[i + 2] = 255; // B (white)
          data[i + 3] = 255; // A (full opacity)
        } else { // If pixel is transparent (background)
          data[i] = 0;       // R (black)
          data[i + 1] = 0;   // G (black)
          data[i + 2] = 0;   // B (black)
          data[i + 3] = 255; // A (full opacity)
        }
      }

      // Put the modified data back
      ctx.putImageData(imageData, 0, 0);

      // Return as data URL
      return tempCanvas.toDataURL('image/png');
    },
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

  // Calculate dimensions consistently
  const calculateDimensions = useCallback(() => {
    if (!image) {
      // Assume 1:1 aspect ratio when image isn't loaded yet
      const size = Math.min(containerSize.width, containerSize.height);
      return { width: size, height: size, scale: 1 };
    }
    
    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = image.width / image.height;
    
    let scaledWidth, scaledHeight, imageScale;
    
    if (imageAspect > containerAspect) {
      // Image is wider than container
      scaledWidth = containerSize.width;
      scaledHeight = containerSize.width / imageAspect;
      imageScale = containerSize.width / image.width;
    } else {
      // Image is taller than container
      scaledWidth = containerSize.height * imageAspect;
      scaledHeight = containerSize.height;
      imageScale = containerSize.height / image.height;
    }
    
    return { width: scaledWidth, height: scaledHeight, scale: imageScale };
  }, [image, containerSize]);

  const dimensions = calculateDimensions();
  

  

  


  // Force Stage to update its size
  useEffect(() => {
    if (stageRef.current && image) {
      const targetDimensions = calculateDimensions();
      const stage = stageRef.current.getStage();
      

      
      // Explicitly set the Stage size
      stage.width(targetDimensions.width);
      stage.height(targetDimensions.height);
      stage.draw();
      

    }
  }, [containerSize, image, calculateDimensions]);

  return (
    <div className="image-mask-container" ref={containerRef}>
      <div className="controls">
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
                width: '100%',
        height: '100%'
      }}>
        <Stage
          key={`${dimensions.width}-${dimensions.height}`}
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onMouseLeave={handleMouseLeave}
          data-testid="drawing-stage"
          style={{
                      cursor: props.toolMode === 'move' ? 'grab' :
                 props.toolMode === 'mask-box' || props.toolMode === 'eraser-box' || props.toolMode === 'mask-polygon' ? 'crosshair' :
                 props.toolMode === 'clear' ? 'pointer' : 'none'
          }}
        >
        <Layer ref={layerRef}>
          <Group
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
          >
            {image && (
              <Image
                image={image}
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
              />
            )}
            {maskImage && (
              <Image
                image={maskImage}
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
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
          </Group>
        </Layer>
      </Stage>
      </div>
    </div>
  );
});

ImageMaskCanvas.displayName = 'ImageMaskCanvas';

export default ImageMaskCanvas;