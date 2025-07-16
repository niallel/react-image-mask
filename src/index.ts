// Main exports for the react-image-mask library
export { default as ImageMask } from './components/ImageMask/ImageMask';
export { default as ImageMaskCanvas } from './components/ImageMask/ImageMaskCanvas';
export { default as ImageMaskControls } from './components/ImageMask/ImageMaskControls';

// Export types
export type {
  ToolMode,
  Point,
  BoxSelection,
  HistoryState,
  ImageMaskProps,
  ColorOption,
  ImageMaskCanvasRef
} from './components/ImageMask/types';

// Export utilities
export { downloadMask } from './components/ImageMask/utils/downloadMask'; 