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

### Basic Usage

```tsx
import React from 'react';
import { ImageMask } from 'react-image-mask';

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

## Components

### ImageMask

The main component that includes both the canvas and controls.

#### Props
- `src?: string` - Image source URL (defaults to a placeholder image)
- `maskColor?: string` - Initial mask color (defaults to black)
- `opacity?: number` - Initial opacity (defaults to 0.5)
- `brushSize?: number` - Initial brush size (defaults to 10)
- `onMaskChange?: (maskData: string | null) => void` - Callback when mask changes
- `onZoomChange?: (zoom: number) => void` - Callback when zoom changes
- `onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void` - Callback when history changes
- `className?: string` - Custom CSS class for the container
- `ref?: React.Ref<ImageMaskRef>` - Ref to control the component programmatically

### ImageMaskCanvas

The canvas component for image masking.

#### Props
- `src: string` - Image source URL
- `toolMode: ToolMode` - Current tool mode
- `onZoomChange?: (zoom: number) => void` - Zoom change callback
- `onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void` - History change callback

### ImageMaskControls

The controls component for tool selection and settings.

#### Props
- `setToolMode: (toolMode: ToolMode) => void` - Tool mode setter
- `toolMode: ToolMode` - Current tool mode
- `clearCanvas?: () => void` - Clear canvas function
- `currentZoom?: number` - Current zoom level
- `undo?: () => void` - Undo function
- `redo?: () => void` - Redo function
- `canUndo?: boolean` - Whether undo is available
- `canRedo?: boolean` - Whether redo is available
- `onDownloadMask?: () => void` - Download mask function
- `setMaskColor?: (color: string) => void` - Set mask color function
- `currentMaskColor?: string` - Current mask color
- `setOpacity?: (opacity: number) => void` - Set opacity function
- `currentOpacity?: number` - Current opacity
- `setBrushSize?: (size: number) => void` - Set brush size function
- `currentBrushSize?: number` - Current brush size
- `setZoom?: (zoom: number) => void` - Set zoom function

## Types

### ToolMode

```typescript
type ToolMode = 'move' | 'mask-freehand' | 'mask-box' | 'mask-polygon' | 'eraser-freehand' | 'eraser-box' | 'clear';
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
