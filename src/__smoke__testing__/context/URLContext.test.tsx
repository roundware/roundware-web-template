import { render, act } from '@testing-library/react';
import { URLContext, useURLSync, IURLContext } from '../../context/URLContext';
import { ReactNode } from 'react';

// Create a wrapper component for testing
const TestWrapper = ({ children, value }: { children: ReactNode; value: IURLContext }) => {
  return (
    <URLContext.Provider value={value}>
      {children}
    </URLContext.Provider>
  );
};

// Test component that uses the context
const TestComponent = () => {
  const context = useURLSync();
  return (
    <div>
      <div data-testid="params">{context.params.toString()}</div>
      <button onClick={() => context.addToURL('test', 'value')}>Add Param</button>
      <button onClick={() => context.deleteFromURL('test')}>Delete Param</button>
      <button onClick={() => context.deleteFromURL(['test1', 'test2'])}>Delete Multiple Params</button>
    </div>
  );
};

describe('URLContext', () => {
  let mockContextValue: IURLContext;
  let mockParams: URLSearchParams;

  beforeEach(() => {
    mockParams = new URLSearchParams();
    mockContextValue = {
      params: mockParams,
      addToURL: jest.fn(),
      deleteFromURL: jest.fn()
    };
  });

  it('should provide context value to children', () => {
    const { getByTestId } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    expect(getByTestId('params')).toHaveTextContent('');
  });

  it('should handle adding a parameter to URL', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Add Param').click();
    });

    expect(mockContextValue.addToURL).toHaveBeenCalledWith('test', 'value');
  });

  it('should handle deleting a single parameter from URL', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Delete Param').click();
    });

    expect(mockContextValue.deleteFromURL).toHaveBeenCalledWith('test');
  });

  it('should handle deleting multiple parameters from URL', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Delete Multiple Params').click();
    });

    expect(mockContextValue.deleteFromURL).toHaveBeenCalledWith(['test1', 'test2']);
  });

  it('should display URL parameters', () => {
    const params = new URLSearchParams();
    params.append('test1', 'value1');
    params.append('test2', 'value2');

    const contextWithParams = {
      ...mockContextValue,
      params
    };

    const { getByTestId } = render(
      <TestWrapper value={contextWithParams}>
        <TestComponent />
      </TestWrapper>
    );

    expect(getByTestId('params')).toHaveTextContent('test1=value1&test2=value2');
  });

  it('should handle empty URL parameters', () => {
    const emptyParams = new URLSearchParams();
    const contextWithEmptyParams = {
      ...mockContextValue,
      params: emptyParams
    };

    const { getByTestId } = render(
      <TestWrapper value={contextWithEmptyParams}>
        <TestComponent />
      </TestWrapper>
    );

    expect(getByTestId('params')).toHaveTextContent('');
  });
});
