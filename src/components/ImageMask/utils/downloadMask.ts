/**
 * Downloads the current mask as a PNG image file
 * 
 * This utility function processes the mask canvas data and converts it to a 
 * standard mask format where white pixels represent masked areas and black 
 * pixels represent background areas. The resulting image is downloaded as 
 * 'mask.png' to the user's default download location.
 * 
 * @param {HTMLCanvasElement | null} maskCanvas - The canvas element containing the mask data
 * @param {number} width - The desired width of the output mask image in pixels
 * @param {number} height - The desired height of the output mask image in pixels
 * 
 * @example
 * ```typescript
 * // Download a mask from a canvas
 * const canvas = document.getElementById('maskCanvas') as HTMLCanvasElement;
 * downloadMask(canvas, 1024, 768);
 * ```
 * 
 * @returns {void} This function doesn't return a value, it triggers a download
 */
export const downloadMask = (maskCanvas: HTMLCanvasElement | null, width: number, height: number) => {
  // Early return if no canvas is provided
  if (!maskCanvas) return;
  
  // Create a temporary canvas to process the mask data
  // This ensures we get the exact dimensions requested
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext('2d');
  
  // Exit if we can't get a 2D context (shouldn't happen in modern browsers)
  if (!ctx) return;

  // Copy the mask canvas content to our temporary canvas
  ctx.drawImage(maskCanvas, 0, 0);

  // Get the raw pixel data from the canvas
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; // RGBA pixel data array

  // Process each pixel to convert to standard mask format
  // Iterate through pixels in groups of 4 (RGBA values)
  for (let i = 0; i < data.length; i += 4) {
    // Check if pixel has any alpha value (was drawn on)
    if (data[i + 3] > 0) { 
      // Masked area: set to pure white
      data[i] = 255;     // Red channel
      data[i + 1] = 255; // Green channel  
      data[i + 2] = 255; // Blue channel
      data[i + 3] = 255; // Alpha channel (full opacity)
    } else { 
      // Background area: set to pure black
      data[i] = 0;       // Red channel
      data[i + 1] = 0;   // Green channel
      data[i + 2] = 0;   // Blue channel
      data[i + 3] = 255; // Alpha channel (full opacity)
    }
  }

  // Apply the processed pixel data back to the canvas
  ctx.putImageData(imageData, 0, 0);

  // Create a download link and trigger the download
  const link = document.createElement('a');
  link.download = 'mask.png'; // Default filename
  link.href = tempCanvas.toDataURL('image/png'); // Convert canvas to PNG data URL
  link.click(); // Programmatically trigger the download
}; 