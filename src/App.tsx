import { useState } from 'react';
import ImageMask from './components/ImageMask/ImageMask';
import './App.css';

function App() {
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);

  // Generate size options from 200px to 1200px in 100px increments
  const sizeOptions = Array.from({ length: 11 }, (_, i) => 200 + i * 100);

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
        </div>

        <div 
          className="image-mask-demo-container"
          data-dimensions={`${containerWidth}px × ${containerHeight}px`}
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`
          }}
        >
          <ImageMask />
        </div>
      </header>
    </div>
  );
}

export default App;
