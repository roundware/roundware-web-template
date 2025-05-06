import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UiConfigContext } from '@/context/UIContext';
import RoundwareContext from '@/context/RoundwareContext';
import ListenDrawer from '@/components/ListenPage/ListenDrawer';
import config from '@/config';
import { useRoundware } from '@/hooks';

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false), // Default to mobile view
}));

// Mock the child components
jest.mock('@/components/ListenPage/Filters', () => () => <div data-testid="filters">Filters Component</div>);
jest.mock('@/components/ListenPage/ListenHistory', () => () => <div data-testid="history">History Component</div>);

describe('ListenDrawer', () => {
  const mockRoundware = {
    uiConfig: {
      listen: true,
    },
  };

  const theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });

  const mockSetDrawerOpen = jest.fn();
  let drawerOpen = false;

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <UiConfigContext.Provider value={{ 
          drawerOpen, 
          setDrawerOpen: (open: boolean) => {
            drawerOpen = open;
            mockSetDrawerOpen(open);
          },
          showShare: '',
          handleShare: jest.fn(),
          handleCloseShare: jest.fn()
        }}>
          <RoundwareContext.Provider value={mockRoundware as any}>
            <ListenDrawer {...props} />
          </RoundwareContext.Provider>
        </UiConfigContext.Provider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    drawerOpen = false;
    // Reset config to default values
    config.ui.listenSidebar.active = true;
    config.ui.listenSidebar.filter.active = true;
    config.ui.listenSidebar.history.active = true;
    // Reset useRoundware mock to default value
    (useRoundware as jest.Mock).mockReturnValue({ roundware: mockRoundware });
  });

  it('should not render when roundware.uiConfig.listen is false', () => {
    (useRoundware as jest.Mock).mockReturnValue({ 
      roundware: { 
        uiConfig: { 
          listen: false 
        } 
      } 
    });
    
    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('should not render when config.ui.listenSidebar.active is false', () => {
    config.ui.listenSidebar.active = false;
    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('should render the drawer toggle button', () => {
    renderComponent();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should toggle drawer when button is clicked', () => {
    const { rerender } = renderComponent();
    const toggleButton = screen.getByRole('button');
    
    // Initially drawer should be closed
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    
    // Click to open drawer
    fireEvent.click(toggleButton);
    expect(mockSetDrawerOpen).toHaveBeenCalledWith(true);
    
    // Re-render with updated drawer state
    rerender(
      <ThemeProvider theme={theme}>
        <UiConfigContext.Provider value={{ 
          drawerOpen: true, 
          setDrawerOpen: mockSetDrawerOpen,
          showShare: '',
          handleShare: jest.fn(),
          handleCloseShare: jest.fn()
        }}>
          <RoundwareContext.Provider value={mockRoundware as any}>
            <ListenDrawer />
          </RoundwareContext.Provider>
        </UiConfigContext.Provider>
      </ThemeProvider>
    );

    // Click close button to close drawer
    const closeButton = screen.getByTestId('CloseIcon');
    fireEvent.click(closeButton);
    expect(mockSetDrawerOpen).toHaveBeenCalledWith(false);
  });

  it('should render tabs when both filter and history are active', () => {
    const { rerender } = renderComponent();
    const toggleButton = screen.getByRole('button');
    
    // Click to open drawer
    fireEvent.click(toggleButton);
    
    // Re-render with updated drawer state
    rerender(
      <ThemeProvider theme={theme}>
        <UiConfigContext.Provider value={{ 
          drawerOpen: true, 
          setDrawerOpen: mockSetDrawerOpen,
          showShare: '',
          handleShare: jest.fn(),
          handleCloseShare: jest.fn()
        }}>
          <RoundwareContext.Provider value={mockRoundware as any}>
            <ListenDrawer />
          </RoundwareContext.Provider>
        </UiConfigContext.Provider>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should switch between tabs when clicked', async () => {
    // Set initial tab to Filters
    config.ui.listenSidebar.history.active = true;
    config.ui.listenSidebar.filter.active = true;
    
    const { rerender } = renderComponent();
    const toggleButton = screen.getByRole('button');
    
    // Click to open drawer
    fireEvent.click(toggleButton);
    
    // Re-render with updated drawer state
    rerender(
      <ThemeProvider theme={theme}>
        <UiConfigContext.Provider value={{ 
          drawerOpen: true, 
          setDrawerOpen: mockSetDrawerOpen,
          showShare: '',
          handleShare: jest.fn(),
          handleCloseShare: jest.fn()
        }}>
          <RoundwareContext.Provider value={mockRoundware as any}>
            <ListenDrawer />
          </RoundwareContext.Provider>
        </UiConfigContext.Provider>
      </ThemeProvider>
    );

    // Wait for and verify History component is initially shown (since history.active is true)
    await waitFor(() => {
      expect(screen.getByTestId('history')).toBeInTheDocument();
    });
    
    // Click Filters tab
    fireEvent.click(screen.getByText('Filters'));
    
    // Wait for and verify Filters component is shown
    await waitFor(() => {
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });
    
    // Click History tab
    fireEvent.click(screen.getByText('History'));
    
    // Wait for and verify History component is shown again
    await waitFor(() => {
      expect(screen.getByTestId('history')).toBeInTheDocument();
    });
  });

  it('should render only Filters tab when History is inactive', () => {
    config.ui.listenSidebar.history.active = false;
    const { rerender } = renderComponent();
    const toggleButton = screen.getByRole('button');
    
    // Click to open drawer
    fireEvent.click(toggleButton);
    
    // Re-render with updated drawer state
    rerender(
      <ThemeProvider theme={theme}>
        <UiConfigContext.Provider value={{ 
          drawerOpen: true, 
          setDrawerOpen: mockSetDrawerOpen,
          showShare: '',
          handleShare: jest.fn(),
          handleCloseShare: jest.fn()
        }}>
          <RoundwareContext.Provider value={mockRoundware as any}>
            <ListenDrawer />
          </RoundwareContext.Provider>
        </UiConfigContext.Provider>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
  });

  it('should render only History tab when Filters is inactive', () => {
    config.ui.listenSidebar.filter.active = false;
    const { rerender } = renderComponent();
    const toggleButton = screen.getByRole('button');
    
    // Click to open drawer
    fireEvent.click(toggleButton);
    
    // Re-render with updated drawer state
    rerender(
      <ThemeProvider theme={theme}>
        <UiConfigContext.Provider value={{ 
          drawerOpen: true, 
          setDrawerOpen: mockSetDrawerOpen,
          showShare: '',
          handleShare: jest.fn(),
          handleCloseShare: jest.fn()
        }}>
          <RoundwareContext.Provider value={mockRoundware as any}>
            <ListenDrawer />
          </RoundwareContext.Provider>
        </UiConfigContext.Provider>
      </ThemeProvider>
    );
    
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });
});
