import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageErrorBoundary from '../../components/elements/ImageErrorBoundary';

// Mock console.error to avoid test output noise
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ImageErrorBoundary Component', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const MockComponent = ({ shouldThrow = false }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Normal content</div>;
  };

  it('renders children when there is no error', () => {
    render(
      <ImageErrorBoundary>
        <div>Test content</div>
      </ImageErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders nothing when there is an error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { container } = render(
      <ImageErrorBoundary>
        <ThrowError />
      </ImageErrorBoundary>
    );

    // The error boundary should render nothing (null)
    expect(container.firstChild).toBeNull();
    
    spy.mockRestore();
  });

  it('updates error state when child component throws', () => {
    const { rerender, container } = render(
      <ImageErrorBoundary>
        <MockComponent shouldThrow={false} />
      </ImageErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();

    rerender(
      <ImageErrorBoundary>
        <MockComponent shouldThrow={true} />
      </ImageErrorBoundary>
    );

    // After error, should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('catches runtime errors in children', () => {
    const ComponentWithRuntimeError = () => {
      React.useEffect(() => {
        throw new Error('Runtime error');
      }, []);
      return <div>Should not render</div>;
    };

    const { container } = render(
      <ImageErrorBoundary>
        <ComponentWithRuntimeError />
      </ImageErrorBoundary>
    );

    // Should render nothing after runtime error
    expect(container.firstChild).toBeNull();
  });

  it('logs error to console when error occurs', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ImageErrorBoundary>
        <ThrowError />
      </ImageErrorBoundary>
    );

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
