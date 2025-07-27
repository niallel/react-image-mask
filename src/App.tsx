import { useState, useRef } from 'react';
import ImageMask from './components/ImageMask/ImageMask';
import { ImageMaskRef } from './components/ImageMask/types';
import './App.css';

function App() {
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const imageMaskRef = useRef<ImageMaskRef>(null);

  // Generate size options from 200px to 1200px in 100px increments
  const sizeOptions = Array.from({ length: 11 }, (_, i) => 200 + i * 100);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Image Mask Demo</h1>
        
        <div className="container-controls">
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
          <ImageMask ref={imageMaskRef} />
        </div>
      </header>
    </div>
  );
}

export default App;
