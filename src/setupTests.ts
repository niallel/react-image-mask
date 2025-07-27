// vitest-dom adds custom vitest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Konva
vi.mock('konva', () => ({
  default: {
    Stage: vi.fn(),
    Layer: vi.fn(),
    Image: vi.fn(),
    Group: vi.fn(),
    Line: vi.fn(),
    Rect: vi.fn(),
    Circle: vi.fn(),
  },
}));

// Mock react-konva components
vi.mock('react-konva', () => ({
  Stage: vi.fn(({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-stage' }, children);
  }),
  Layer: vi.fn(({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-layer' }, children);
  }),
  Image: vi.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-image' });
  }),
  Group: vi.fn(({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-group' }, children);
  }),
  Line: vi.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-line' });
  }),
  Rect: vi.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-rect' });
  }),
  Circle: vi.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-circle' });
  }),
}));

// Mock canvas-related APIs
const mockCanvasContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
  globalCompositeOperation: '',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  })),
  putImageData: vi.fn(),
};

const mockCanvas = {
  getContext: vi.fn(() => mockCanvasContext),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  width: 1024,
  height: 1024,
};

// Mock HTMLCanvasElement
(global as any).HTMLCanvasElement = vi.fn(() => mockCanvas);

// Mock Image
(global as any).Image = vi.fn(() => ({
  src: '',
  onload: null,
  width: 1024,
  height: 1024,
  addEventListener: vi.fn(),
}));

// Mock createImageBitmap
(global as any).createImageBitmap = vi.fn(() => Promise.resolve({
  width: 1024,
  height: 1024,
  close: vi.fn(),
}));

// Mock URL.createObjectURL
(global as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');

// Mock document.createElement for canvas elements
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return mockCanvas as any;
  }
  return originalCreateElement.call(document, tagName);
});
