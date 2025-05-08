import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/elements/ErrorBoundary';

// Mock console.error to avoid test output noise
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
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
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders default fallback UI when there is an error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('renders custom fallback UI when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('updates error state when child component throws', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <MockComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <MockComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('catches runtime errors in children', () => {
    const ComponentWithRuntimeError = () => {
      React.useEffect(() => {
        throw new Error('Runtime error');
      }, []);
      return <div>Should not render</div>;
    };

    render(
      <ErrorBoundary>
        <ComponentWithRuntimeError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('displays error details in the fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const details = screen.getByText(/Error: Test error/);
    expect(details).toBeInTheDocument();
    expect(details.closest('details')).toBeInTheDocument();
  });
});
