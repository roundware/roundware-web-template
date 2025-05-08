import { render, act } from '@testing-library/react';
import { UiConfigContext, useUIContext } from '../../context/UIContext';
import { ReactNode } from 'react';

// Create a wrapper component for testing
const TestWrapper = ({ children, value }: { children: ReactNode; value: any }) => {
  return (
    <UiConfigContext.Provider value={value}>
      {children}
    </UiConfigContext.Provider>
  );
};

// Test component that uses the context
const TestComponent = () => {
  const context = useUIContext();
  return (
    <div>
      <div data-testid="show-share">{context.showShare}</div>
      <div data-testid="drawer-open">{context.drawerOpen.toString()}</div>
      <button onClick={() => context.handleShare('test-link')}>Share</button>
      <button onClick={() => context.handleCloseShare()}>Close Share</button>
      <button onClick={() => context.setDrawerOpen(true)}>Open Drawer</button>
    </div>
  );
};

describe('UIContext', () => {
  let mockContextValue: any;

  beforeEach(() => {
    mockContextValue = {
      showShare: '',
      handleShare: jest.fn(),
      handleCloseShare: jest.fn(),
      drawerOpen: false,
      setDrawerOpen: jest.fn()
    };
  });

  it('should provide context value to children', () => {
    const { getByTestId } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    expect(getByTestId('show-share')).toHaveTextContent('');
    expect(getByTestId('drawer-open')).toHaveTextContent('false');
  });

  it('should handle share with custom link', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Share').click();
    });

    expect(mockContextValue.handleShare).toHaveBeenCalledWith('test-link');
  });

  it('should handle share without custom link', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Share').click();
    });

    expect(mockContextValue.handleShare).toHaveBeenCalled();
  });

  it('should handle close share', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Close Share').click();
    });

    expect(mockContextValue.handleCloseShare).toHaveBeenCalled();
  });

  it('should handle drawer open state', () => {
    const { getByText } = render(
      <TestWrapper value={mockContextValue}>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      getByText('Open Drawer').click();
    });

    expect(mockContextValue.setDrawerOpen).toHaveBeenCalledWith(true);
  });

  it('should update context values', () => {
    const updatedContext = {
      ...mockContextValue,
      showShare: 'test-share',
      drawerOpen: true
    };

    const { getByTestId } = render(
      <TestWrapper value={updatedContext}>
        <TestComponent />
      </TestWrapper>
    );

    expect(getByTestId('show-share')).toHaveTextContent('test-share');
    expect(getByTestId('drawer-open')).toHaveTextContent('true');
  });
});
