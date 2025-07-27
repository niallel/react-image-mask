import { useState, useRef } from 'react';
import ImageMask from './components/ImageMask/ImageMask';
import { ImageMaskRef, ControlsConfig } from './components/ImageMask/types';
import './App.css';

function App() {
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/1024/1024');
  const imageMaskRef = useRef<ImageMaskRef>(null);

  // Generate size options from 200px to 1200px in 100px increments
  const sizeOptions = Array.from({ length: 11 }, (_, i) => 200 + i * 100);

  // Configure which controls to show in the ImageMask component
  const controlsConfig: ControlsConfig = {
    showDownloadButton: false, // Hide the download button in ImageMaskControls
    showClearButton: true,
    showUndoRedo: true,
    showToolButtons: true,
    showBrushControls: true,
    showColorControls: true,
    showOpacityControls: true,
    showZoomControls: true
  };

  const handleDownloadMask = () => {
    const maskData = imageMaskRef.current?.getMaskData();
    if (maskData) {
      const link = document.createElement('a');
      link.href = maskData;
      link.download = 'mask.png';
      link.click();
    } else {
      alert('No mask data available to download. Please create a mask first.');
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Image Mask Demo</h1>
        
        <div className="container-controls">
          <div className="control-group">
            <label htmlFor="image-url-input">Image URL:</label>
            <input
              id="image-url-input"
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="Enter image URL"
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '14px',
                minWidth: '300px'
              }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="width-select">Container Width:</label>
            <select 
              id="width-select"
              value={containerWidth} 
              onChange={(e) => setContainerWidth(Number(e.target.value))}
            >
              {sizeOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="height-select">Container Height:</label>
            <select 
              id="height-select"
              value={containerHeight} 
              onChange={(e) => setContainerHeight(Number(e.target.value))}
            >
              {sizeOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button 
              onClick={handleDownloadMask}
              className="download-mask-button"
              title="Download the current mask as a PNG file"
            >
              Download Mask
            </button>
          </div>
        </div>

        <div 
          className="image-mask-demo-container"
          data-dimensions={`${containerWidth}px × ${containerHeight}px`}
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`
          }}
        >
          <ImageMask 
            ref={imageMaskRef} 
            src={imageUrl}
            controlsConfig={controlsConfig} 
          />
        </div>
      </header>
    </div>
  );
}

export default App;
