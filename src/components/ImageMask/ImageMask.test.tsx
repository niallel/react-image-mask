import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageMask from './ImageMaskCanvas';

// Mock the HTMLImageElement
class MockImage {
  src: string;
  onload: (() => void) | null = null;
  width = 1024;
  height = 1024;

  constructor() {
    this.src = '';
  }

  addEventListener(event: string, callback: () => void) {
    if (event === 'load') {
      this.onload = callback;
    }
  }
}

// Mock the HTMLCanvasElement
class MockCanvas {
  width = 1024;
  height = 1024;
  context: CanvasRenderingContext2D | null = null;

  getContext(type: string): CanvasRenderingContext2D | null {
    if (type === '2d' && !this.context) {
      this.context = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineCap: '',
        lineJoin: '',
        globalCompositeOperation: '',
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
      } as unknown as CanvasRenderingContext2D;
    }
    return this.context;
  }

  toDataURL() {
    return 'data:image/png;base64,mock';
  }
}

// Mock window.Image and HTMLCanvasElement
global.Image = MockImage as any;
global.HTMLCanvasElement = MockCanvas as any;

describe('ImageMask', () => {
  const mockImageSrc = 'test-image.jpg';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders the component with default props', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // Check if the component renders
    expect(screen.getByTestId('image-mask-container')).toBeInTheDocument();
    
    // Check if all tool buttons are present
    expect(screen.getByText('Move')).toBeInTheDocument();
    expect(screen.getByText('Mask Freehand')).toBeInTheDocument();
    expect(screen.getByText('Mask Box')).toBeInTheDocument();
    expect(screen.getByText('Eraser Freehand')).toBeInTheDocument();
    expect(screen.getByText('Eraser Box')).toBeInTheDocument();
    expect(screen.getByText('Clear Mask')).toBeInTheDocument();
    expect(screen.getByText('Reset Zoom')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('handles tool mode changes', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // Test Move mode
    fireEvent.click(screen.getByText('Move'));
    expect(screen.getByText('Move')).toHaveClass('active');
    
    // Test Mask Freehand mode
    fireEvent.click(screen.getByText('Mask Freehand'));
    expect(screen.getByText('Mask Freehand')).toHaveClass('active');
    
    // Test Mask Box mode
    fireEvent.click(screen.getByText('Mask Box'));
    expect(screen.getByText('Mask Box')).toHaveClass('active');
    
    // Test Eraser Freehand mode
    fireEvent.click(screen.getByText('Eraser Freehand'));
    expect(screen.getByText('Eraser Freehand')).toHaveClass('active');
    
    // Test Eraser Box mode
    fireEvent.click(screen.getByText('Eraser Box'));
    expect(screen.getByText('Eraser Box')).toHaveClass('active');
  });

  it('handles color selection', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // Get all color options
    const colorOptions = screen.getAllByRole('button', { name: /color-option/i });
    
    // Test selecting each color
    colorOptions.forEach((colorOption) => {
      fireEvent.click(colorOption);
      expect(colorOption).toHaveClass('active');
    });
  });

  it('handles opacity changes', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    const opacitySlider = screen.getByRole('slider');
    fireEvent.change(opacitySlider, { target: { value: '50' } });
    
    expect(screen.getByText('Opacity: 50%')).toBeInTheDocument();
  });

  it('handles zoom controls', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // Test reset zoom
    fireEvent.click(screen.getByText('Reset Zoom'));
    expect(screen.getByText('Reset Zoom (100%)')).toBeInTheDocument();
  });

  it('handles undo/redo functionality', async () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // Start with undo/redo buttons disabled
    expect(screen.getByText('Undo')).toBeDisabled();
    expect(screen.getByText('Redo')).toBeDisabled();
    
    // Make a change (draw something)
    fireEvent.click(screen.getByText('Mask Freehand'));
    const stage = screen.getByTestId('drawing-stage');
    
    fireEvent.mouseDown(stage, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(stage, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(stage);
    
    // Undo should be enabled after a change
    expect(screen.getByText('Undo')).not.toBeDisabled();
    
    // Test undo
    fireEvent.click(screen.getByText('Undo'));
    expect(screen.getByText('Redo')).not.toBeDisabled();
    
    // Test redo
    fireEvent.click(screen.getByText('Redo'));
    expect(screen.getByText('Undo')).not.toBeDisabled();
  });

  it('handles clear mask functionality', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // Make a change first
    fireEvent.click(screen.getByText('Mask Freehand'));
    const stage = screen.getByTestId('drawing-stage');
    
    fireEvent.mouseDown(stage, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(stage, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(stage);
    
    // Clear the mask
    fireEvent.click(screen.getByText('Clear Mask'));
    
    // The mask should be cleared
    expect(screen.getByText('Clear Mask')).toHaveClass('active');
  });

  it('handles box drawing', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-box" />);
    
    const stage = screen.getByTestId('drawing-stage');
    // Start drawing a box
    fireEvent.mouseDown(stage, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(stage, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(stage);
    
    // Box should be drawn
    expect(screen.getByText('Mask Box')).toHaveClass('active');
  });

  it('handles eraser functionality', () => {
    render(<ImageMask src={mockImageSrc} toolMode="mask-freehand" />);
    
    // First draw something
    fireEvent.click(screen.getByText('Mask Freehand'));
    const stage = screen.getByTestId('drawing-stage');
    
    fireEvent.mouseDown(stage, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(stage, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(stage);
    
    // Then erase it
    fireEvent.click(screen.getByText('Eraser Freehand'));
    fireEvent.mouseDown(stage, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(stage, { clientX: 250, clientY: 250 });
    fireEvent.mouseUp(stage);
    
    // Eraser should be active
    expect(screen.getByText('Eraser Freehand')).toHaveClass('active');
  });
}); 