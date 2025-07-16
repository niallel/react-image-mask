// Example usage of react-image-mask npm package
import React, { useRef, useState } from 'react';
import { 
  ImageMask, 
  ImageMaskCanvas, 
  ImageMaskControls, 
  ImageMaskCanvasRef, 
  ToolMode 
} from 'react-image-mask';

// Example 1: Basic usage with default ImageMask component
function BasicExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Basic Image Mask</h2>
      <ImageMask />
    </div>
  );
}

// Example 2: Custom implementation with separate components
function CustomExample() {
  const canvasRef = useRef<ImageMaskCanvasRef>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');
  const [zoom, setZoom] = useState<number>(1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const handleDownload = () => {
    const maskData = canvasRef.current?.getMaskData();
    if (maskData) {
      const link = document.createElement('a');
      link.href = maskData;
      link.download = 'my-mask.png';
      link.click();
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearMask();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Custom Image Mask Implementation</h2>
      
      <ImageMaskControls
        toolMode={toolMode}
        setToolMode={setToolMode}
        clearCanvas={handleClear}
        currentZoom={zoom}
        undo={handleUndo}
        redo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDownloadMask={handleDownload}
      />
      
      <ImageMaskCanvas
        ref={canvasRef}
        src="https://picsum.photos/800/600"
        toolMode={toolMode}
        onZoomChange={setZoom}
        onHistoryChange={(canUndo, canRedo) => {
          setCanUndo(canUndo);
          setCanRedo(canRedo);
        }}
      />
    </div>
  );
}

// Example 3: Integration with your own UI
function IntegratedExample() {
  const canvasRef = useRef<ImageMaskCanvasRef>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('mask-freehand');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Integrated with Custom UI</h2>
      
      {/* Your custom toolbar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setToolMode('mask-freehand')}
          style={{ 
            backgroundColor: toolMode === 'mask-freehand' ? '#007bff' : '#f8f9fa',
            color: toolMode === 'mask-freehand' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Freehand Draw
        </button>
        
        <button 
          onClick={() => setToolMode('mask-box')}
          style={{ 
            backgroundColor: toolMode === 'mask-box' ? '#007bff' : '#f8f9fa',
            color: toolMode === 'mask-box' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Box Select
        </button>
        
        <button 
          onClick={() => setToolMode('eraser-freehand')}
          style={{ 
            backgroundColor: toolMode === 'eraser-freehand' ? '#007bff' : '#f8f9fa',
            color: toolMode === 'eraser-freehand' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Eraser
        </button>
        
        <button 
          onClick={() => canvasRef.current?.clearMask()}
          style={{ 
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>
      
      {/* Just the canvas component */}
      <ImageMaskCanvas
        ref={canvasRef}
        src="https://picsum.photos/600/400"
        toolMode={toolMode}
        onZoomChange={(zoom) => console.log('Zoom changed to:', zoom)}
        onHistoryChange={(canUndo, canRedo) => {
          console.log('History changed:', { canUndo, canRedo });
        }}
      />
    </div>
  );
}

// Main App component showcasing all examples
function App() {
  return (
    <div>
      <h1>React Image Mask Examples</h1>
      
      <BasicExample />
      <hr />
      
      <CustomExample />
      <hr />
      
      <IntegratedExample />
    </div>
  );
}

export default App; 