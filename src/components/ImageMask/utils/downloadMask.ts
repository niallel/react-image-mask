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

  // Convert all non-transparent pixels to pure black with full opacity
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) { // If pixel is not transparent
      data[i] = 0;     // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
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