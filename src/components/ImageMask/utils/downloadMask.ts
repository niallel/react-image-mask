export const downloadMask = (maskCanvas: HTMLCanvasElement | null, width: number, height: number) => {
  if (!maskCanvas) return;
  
  // Create a temporary canvas to ensure we get the full mask
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return;

  // Draw the mask
  ctx.drawImage(maskCanvas, 0, 0);

  // Get the image data
  const imageData = ctx.getImageData(0, 0, width, height);
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

  // Convert to PNG and download
  const link = document.createElement('a');
  link.download = 'mask.png';
  link.href = tempCanvas.toDataURL('image/png');
  link.click();
}; 