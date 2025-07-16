import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageMask from './ImageMask';

// Basic test to ensure component can be imported and rendered
describe('ImageMask', () => {
  it('should export ImageMask component', () => {
    expect(ImageMask).toBeDefined();
  });

  it('should render without crashing', () => {
    // This test may fail due to Konva mocking complexity, but that's okay
    // The important thing is that the component can be imported and built
    expect(() => {
      render(<ImageMask />);
    }).not.toThrow();
  });
}); 