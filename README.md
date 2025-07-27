# React Image Mask

A React component for creating image masks with drawing tools. Features include freehand drawing, box selection, polygon selection, eraser tools, and more.

## Installation

```bash
npm install react-image-mask
```

## Dependencies

This package has the following peer dependencies:
- `react` >= 16.8.0
- `react-dom` >= 16.8.0

## Usage

### CSS Import

**Important**: You need to import the CSS file for the component to display correctly:

```tsx
import 'react-image-mask/dist/index.css';
```

### Basic Usage

```tsx
import React from 'react';
import { ImageMask } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  return (
    <div>
      {/* Uses default placeholder image */}
      <ImageMask />
    </div>
  );
}
```

### With Custom Image and Mask Callback

```tsx
import React, { useState } from 'react';
import { ImageMask } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  const [maskData, setMaskData] = useState<string | null>(null);

  const handleMaskChange = (newMaskData: string | null) => {
    setMaskData(newMaskData);
    console.log('Mask updated:', newMaskData);
  };

  return (
    <div>
      <ImageMask
        src="https://example.com/your-image.jpg"
        onMaskChange={handleMaskChange}
        maskColor="rgba(255, 0, 0, 1)"
        opacity={0.7}
        brushSize={15}
      />
      
      {maskData && (
        <div>
          <h3>Mask Preview:</h3>
          <img src={maskData} alt="Generated mask" style={{ maxWidth: '200px' }} />
        </div>
      )}
    </div>
  );
}
```

### Using Ref to Control the Component

```tsx
import React, { useRef } from 'react';
import { ImageMask, ImageMaskRef } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  const maskRef = useRef<ImageMaskRef>(null);

  const handleDownload = () => {
    const maskData = maskRef.current?.getMaskData();
    if (maskData) {
      const link = document.createElement('a');
      link.href = maskData;
      link.download = 'mask.png';
      link.click();
    }
  };

  const handleClear = () => {
    maskRef.current?.clearMask();
  };

  return (
    <div>
      <ImageMask
        ref={maskRef}
        src="https://example.com/image.jpg"
        onMaskChange={(maskData) => console.log('Mask changed:', maskData)}
        onZoomChange={(zoom) => console.log('Zoom:', zoom)}
        onHistoryChange={(canUndo, canRedo) => console.log('History:', { canUndo, canRedo })}
      />
      
      <div>
        <button onClick={handleDownload}>Download Mask</button>
        <button onClick={handleClear}>Clear Mask</button>
        <button onClick={() => maskRef.current?.undo()}>Undo</button>
        <button onClick={() => maskRef.current?.redo()}>Redo</button>
      </div>
    </div>
  );
}
```

### With Controls Configuration

```tsx
import React from 'react';
import { ImageMask, ControlsConfig } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  // Configure which controls to show
  const controlsConfig: ControlsConfig = {
    showDownloadButton: false,  // Hide download button in controls
    showClearButton: true,
    showUndoRedo: true,
    showToolButtons: true,
    showBrushControls: true,
    showColorControls: true,
    showOpacityControls: true,
    showZoomControls: true
  };

  return (
    <div>
      <ImageMask
        src="https://example.com/image.jpg"
        controlsConfig={controlsConfig}
        maskColor="rgba(0, 255, 0, 1)"  // Green mask
        opacity={0.6}
        brushSize={20}
      />
    </div>
  );
}
```

## Components

### ImageMask

The main component that includes both the canvas and controls. This is the primary component you'll use in most cases.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `"https://picsum.photos/1024/1024"` | Image source URL |
| `maskColor` | `string` | `"rgba(0, 0, 0, 1)"` | Initial mask color (RGBA format) |
| `opacity` | `number` | `0.5` | Initial opacity (0-1) |
| `brushSize` | `number` | `10` | Initial brush size in pixels |
| `controlsConfig` | `ControlsConfig` | See below | Configuration for which controls to show |
| `onMaskChange` | `(maskData: string \| null) => void` | `undefined` | Callback when mask changes |
| `onZoomChange` | `(zoom: number) => void` | `undefined` | Callback when zoom changes |
| `onHistoryChange` | `(canUndo: boolean, canRedo: boolean) => void` | `undefined` | Callback when history changes |
| `className` | `string` | `"tool-mode"` | Custom CSS class for the container |
| `ref` | `React.Ref<ImageMaskRef>` | `undefined` | Ref to control the component programmatically |

#### Default ControlsConfig

```typescript
{
  showDownloadButton: true,
  showClearButton: true,
  showUndoRedo: true,
  showToolButtons: true,
  showBrushControls: true,
  showColorControls: true,
  showOpacityControls: true,
  showZoomControls: true
}
```

#### Example Usage

```tsx
import React, { useRef, useState } from 'react';
import { ImageMask, ImageMaskRef, ControlsConfig } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  const maskRef = useRef<ImageMaskRef>(null);
  const [maskData, setMaskData] = useState<string | null>(null);

  const controlsConfig: ControlsConfig = {
    showDownloadButton: false,  // We'll handle download ourselves
    showClearButton: true,
    showUndoRedo: true,
    showToolButtons: true,
    showBrushControls: true,
    showColorControls: true,
    showOpacityControls: true,
    showZoomControls: true
  };

  const handleDownload = () => {
    const data = maskRef.current?.getMaskData();
    if (data) {
      const link = document.createElement('a');
      link.href = data;
      link.download = 'mask.png';
      link.click();
    }
  };

  return (
    <div>
      <ImageMask
        ref={maskRef}
        src="https://example.com/image.jpg"
        maskColor="rgba(255, 0, 0, 1)"
        opacity={0.7}
        brushSize={15}
        controlsConfig={controlsConfig}
        onMaskChange={setMaskData}
        onZoomChange={(zoom) => console.log('Zoom:', zoom)}
        onHistoryChange={(canUndo, canRedo) => console.log('History:', { canUndo, canRedo })}
        className="custom-image-mask"
      />
      
      <button onClick={handleDownload}>Download Mask</button>
      
      {maskData && (
        <div>
          <h3>Current Mask:</h3>
          <img src={maskData} alt="Mask preview" style={{ maxWidth: '200px' }} />
        </div>
      )}
    </div>
  );
}
```

### ImageMaskCanvas

The canvas component for image masking. This is the low-level component that handles the actual drawing and image display.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `src` | `string` | Yes | Image source URL |
| `toolMode` | `ToolMode` | Yes | Current tool mode |
| `maskColor` | `string` | No | Mask color (RGBA format) |
| `width` | `number` | No | Canvas width |
| `height` | `number` | No | Canvas height |
| `opacity` | `number` | No | Mask opacity (0-1) |
| `onZoomChange` | `(zoom: number) => void` | No | Zoom change callback |
| `onHistoryChange` | `(canUndo: boolean, canRedo: boolean) => void` | No | History change callback |
| `ref` | `React.Ref<ImageMaskCanvasRef>` | No | Ref to control the canvas programmatically |

#### Example Usage

```tsx
import React, { useRef, useState } from 'react';
import { ImageMaskCanvas, ImageMaskCanvasRef, ToolMode } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  const canvasRef = useRef<ImageMaskCanvasRef>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
  const [maskColor, setMaskColor] = useState('rgba(0, 0, 0, 1)');
  const [opacity, setOpacity] = useState(0.5);
  const [brushSize, setBrushSize] = useState(10);

  const handleDownload = () => {
    const maskData = canvasRef.current?.getMaskData();
    if (maskData) {
      const link = document.createElement('a');
      link.href = maskData;
      link.download = 'mask.png';
      link.click();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setToolMode('mask-freehand')}>Freehand</button>
        <button onClick={() => setToolMode('mask-box')}>Box</button>
        <button onClick={() => setToolMode('eraser-freehand')}>Eraser</button>
        <button onClick={() => canvasRef.current?.clearMask()}>Clear</button>
        <button onClick={handleDownload}>Download</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>
          Color:
          <input
            type="color"
            value={maskColor}
            onChange={(e) => setMaskColor(e.target.value)}
          />
        </label>
        <label>
          Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
        </label>
        <label>
          Brush Size:
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </label>
      </div>

      <ImageMaskCanvas
        ref={canvasRef}
        src="https://example.com/image.jpg"
        toolMode={toolMode}
        maskColor={maskColor}
        opacity={opacity}
        onZoomChange={(zoom) => console.log('Zoom:', zoom)}
        onHistoryChange={(canUndo, canRedo) => console.log('History:', { canUndo, canRedo })}
      />
    </div>
  );
}
```

### ImageMaskControls

The controls component for tool selection and settings. This provides the UI for all the drawing tools and settings.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `setToolMode` | `(toolMode: ToolMode) => void` | Yes | Function to set the current tool mode |
| `toolMode` | `ToolMode` | Yes | Current tool mode |
| `clearCanvas` | `() => void` | No | Function to clear the canvas |
| `currentZoom` | `number` | No | Current zoom level |
| `undo` | `() => void` | No | Function to undo last action |
| `redo` | `() => void` | No | Function to redo last action |
| `canUndo` | `boolean` | No | Whether undo is available |
| `canRedo` | `boolean` | No | Whether redo is available |
| `onDownloadMask` | `() => void` | No | Function to download the mask |
| `setMaskColor` | `(color: string) => void` | No | Function to set mask color |
| `currentMaskColor` | `string` | No | Current mask color |
| `setOpacity` | `(opacity: number) => void` | No | Function to set opacity |
| `currentOpacity` | `number` | No | Current opacity |
| `setBrushSize` | `(size: number) => void` | No | Function to set brush size |
| `currentBrushSize` | `number` | No | Current brush size |
| `setZoom` | `(zoom: number) => void` | No | Function to set zoom |
| `controlsConfig` | `ControlsConfig` | No | Configuration for which controls to show |

#### Example Usage

```tsx
import React, { useState } from 'react';
import { ImageMaskControls, ToolMode, ControlsConfig } from 'react-image-mask';
import 'react-image-mask/dist/index.css';

function App() {
  const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
  const [maskColor, setMaskColor] = useState('rgba(0, 0, 0, 1)');
  const [opacity, setOpacity] = useState(0.5);
  const [brushSize, setBrushSize] = useState(10);
  const [zoom, setZoom] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const controlsConfig: ControlsConfig = {
    showDownloadButton: true,
    showClearButton: true,
    showUndoRedo: true,
    showToolButtons: true,
    showBrushControls: true,
    showColorControls: true,
    showOpacityControls: true,
    showZoomControls: true
  };

  const handleClearCanvas = () => {
    // Implement clear canvas logic
    console.log('Clear canvas');
  };

  const handleUndo = () => {
    // Implement undo logic
    console.log('Undo');
  };

  const handleRedo = () => {
    // Implement redo logic
    console.log('Redo');
  };

  const handleDownloadMask = () => {
    // Implement download logic
    console.log('Download mask');
  };

  return (
    <div>
      <ImageMaskControls
        setToolMode={setToolMode}
        toolMode={toolMode}
        clearCanvas={handleClearCanvas}
        currentZoom={zoom}
        undo={handleUndo}
        redo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDownloadMask={handleDownloadMask}
        setMaskColor={setMaskColor}
        currentMaskColor={maskColor}
        setOpacity={setOpacity}
        currentOpacity={opacity}
        setBrushSize={setBrushSize}
        currentBrushSize={brushSize}
        setZoom={setZoom}
        controlsConfig={controlsConfig}
      />
      
      <div style={{ marginTop: '20px' }}>
        <p>Current Tool: {toolMode}</p>
        <p>Current Color: {maskColor}</p>
        <p>Current Opacity: {opacity}</p>
        <p>Current Brush Size: {brushSize}px</p>
        <p>Current Zoom: {zoom}%</p>
      </div>
    </div>
  );
}
```

## Types

### ToolMode

```typescript
type ToolMode = 'move' | 'mask-freehand' | 'mask-box' | 'mask-polygon' | 'eraser-freehand' | 'eraser-box' | 'clear';
```

### ControlsConfig

```typescript
interface ControlsConfig {
  showDownloadButton?: boolean;
  showClearButton?: boolean;
  showUndoRedo?: boolean;
  showToolButtons?: boolean;
  showBrushControls?: boolean;
  showColorControls?: boolean;
  showOpacityControls?: boolean;
  showZoomControls?: boolean;
}
```

### ImageMaskRef

```typescript
interface ImageMaskRef {
  getMaskData: () => string | null;
  clearMask: () => void;
  undo: () => void;
  redo: () => void;
}
```

### ImageMaskCanvasRef

```typescript
interface ImageMaskCanvasRef {
  getMaskData: () => string | null;
  clearMask: () => void;
  undo: () => void;
  redo: () => void;
  setToolMode: (mode: ToolMode) => void;
  setMaskColor: (color: string) => void;
  setOpacity: (opacity: number) => void;
  setBrushSize: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  setZoom: (zoomPercentage: number) => void;
}
```

## Features

- **Multiple Drawing Tools**: Freehand, box selection, polygon selection
- **Eraser Tools**: Freehand and box eraser
- **Zoom Controls**: Zoom in/out with mouse wheel or controls
- **History**: Undo/redo functionality
- **Customizable**: Adjustable brush size, opacity, and colors
- **Download**: Export mask as PNG
- **TypeScript**: Full TypeScript support
- **Flexible Controls**: Show/hide specific control sections
- **Responsive**: Automatically scales images to fit container

## Development

To run the development environment:

```bash
npm run dev
```

To build the library:

```bash
npm run build
```

To run Storybook:

```bash
npm run storybook
```

## License

MIT
