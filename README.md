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
      <ImageMask />
    </div>
  );
}
```

### Advanced Usage with Custom Props

```tsx
import React, { useRef } from 'react';
import { ImageMask, ImageMaskCanvas, ImageMaskControls, ImageMaskCanvasRef } from 'react-image-mask';

function App() {
  const canvasRef = useRef<ImageMaskCanvasRef>(null);

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
      <ImageMaskCanvas
        ref={canvasRef}
        src="https://example.com/image.jpg"
        toolMode="mask-freehand"
        onZoomChange={(zoom) => console.log('Zoom changed:', zoom)}
        onHistoryChange={(canUndo, canRedo) => console.log('History:', { canUndo, canRedo })}
      />
      <button onClick={handleDownload}>Download Mask</button>
    </div>
  );
}
```

## Components

### ImageMask

The main component that includes both the canvas and controls.

#### Props
- All props are optional - the component works with sensible defaults
- Includes an image source URL (defaults to a placeholder image)

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
