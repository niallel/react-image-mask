// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Konva
jest.mock('konva', () => ({
  default: {
    Stage: jest.fn(),
    Layer: jest.fn(),
    Image: jest.fn(),
    Group: jest.fn(),
    Line: jest.fn(),
    Rect: jest.fn(),
    Circle: jest.fn(),
  },
}));

// Mock react-konva components
jest.mock('react-konva', () => ({
  Stage: jest.fn(({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-stage' }, children);
  }),
  Layer: jest.fn(({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-layer' }, children);
  }),
  Image: jest.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-image' });
  }),
  Group: jest.fn(({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-group' }, children);
  }),
  Line: jest.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-line' });
  }),
  Rect: jest.fn((props) => {
    const React = require('react');
    return React.createElement('div', { ...props, 'data-testid': 'konva-rect' });
  }),
  Circle: jest.fn((props) => {
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
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  })),
  putImageData: jest.fn(),
};

const mockCanvas = {
  getContext: jest.fn(() => mockCanvasContext),
  toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
  width: 1024,
  height: 1024,
};

// Mock HTMLCanvasElement
(global as any).HTMLCanvasElement = jest.fn(() => mockCanvas);

// Mock Image
(global as any).Image = jest.fn(() => ({
  src: '',
  onload: null,
  width: 1024,
  height: 1024,
  addEventListener: jest.fn(),
}));

// Mock createImageBitmap
(global as any).createImageBitmap = jest.fn(() => Promise.resolve({
  width: 1024,
  height: 1024,
  close: jest.fn(),
}));

// Mock URL.createObjectURL
(global as any).URL.createObjectURL = jest.fn(() => 'blob:mock-url');

// Mock document.createElement for canvas elements
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return mockCanvas as any;
  }
  return originalCreateElement.call(document, tagName);
});
