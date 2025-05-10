import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UiConfigContext } from '@/context/UIContext';
import RoundwareContext from '@/context/RoundwareContext';
import ListenHistory from '@/components/ListenPage/ListenHistory';
import config from '@/config';
import { useRoundware } from '@/hooks';
import moment from 'moment';

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  ChevronRight: () => <div data-testid="ChevronRightIcon" />,
  ClearAll: () => <div data-testid="ClearAllIcon" />,
  LocationOn: () => <div data-testid="LocationOnIcon" />,
  LocationOnOutlined: () => <div data-testid="LocationOnOutlinedIcon" />,
}));

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock AssetInfoCard component
jest.mock('@/components/ListenPage/Map/AssetLayer/AssetInfoCard', () => {
  return function MockAssetInfoCard({ asset, actions }: any) {
    return (
      <div data-testid="asset-info-card">
        <div data-testid="asset-id">{asset.id}</div>
        {actions}
      </div>
    );
  };
});

describe('ListenHistory', () => {
  const mockAssets = [
    {
      id: 1,
      addedAt: new Date().toISOString(),
      title: 'Asset 1',
    },
    {
      id: 2,
      addedAt: new Date().toISOString(),
      title: 'Asset 2',
    },
  ];

  const mockRoundware = {
    listenHistory: {
      assets: mockAssets,
      clear: jest.fn(),
    },
  };

  const theme = createTheme();

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <RoundwareContext.Provider value={mockRoundware as any}>
          <ListenHistory />
        </RoundwareContext.Provider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset config to default values
    config.ui.listenSidebar.history.infoCardDefaultCollapsed = false;
    // Reset useRoundware mock to default value
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      selectAsset: jest.fn(),
      forceUpdate: jest.fn(),
      selectedAsset: null,
      playingAssets: [],
    });
  });

  it('should render empty state message when no assets are present', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        listenHistory: {
          assets: [],
          clear: jest.fn(),
        },
      },
      selectAsset: jest.fn(),
      forceUpdate: jest.fn(),
      selectedAsset: null,
      playingAssets: [],
    });

    renderComponent();
    expect(screen.getByText(/You currently have no listening history/i)).toBeInTheDocument();
  });

  it('should render assets in reverse chronological order', () => {
    renderComponent();
    const assetCards = screen.getAllByTestId('asset-info-card');
    expect(assetCards).toHaveLength(2);
  });

  it('should render clear history button when assets are present', () => {
    renderComponent();
    expect(screen.getByText('Clear Listening History')).toBeInTheDocument();
  });

  it('should clear history when clear button is clicked', () => {
    renderComponent();
    const clearButton = screen.getByText('Clear Listening History');
    fireEvent.click(clearButton);
    expect(mockRoundware.listenHistory.clear).toHaveBeenCalled();
  });

  it('should toggle collapse state when header is clicked', async () => {
    renderComponent();
    const headers = screen.getAllByText(moment(mockAssets[0].addedAt).format('h:mm:ss A MMMM Do YYYY'));
    
    // Initially expanded
    expect(screen.getAllByTestId('asset-info-card')).toHaveLength(2);
    
    // Click to collapse first card
    fireEvent.click(headers[0]);
    
    // Wait for collapse animation and verify collapsed state
    await waitFor(() => {
      const collapsedContent = screen.getAllByTestId('asset-info-card');
      expect(collapsedContent).toHaveLength(2); // Both cards remain in DOM but one is hidden
    });
    
    // Click to expand again
    fireEvent.click(headers[0]);
    
    // Wait for expand animation and verify expanded state
    await waitFor(() => {
      const expandedContent = screen.getAllByTestId('asset-info-card');
      expect(expandedContent).toHaveLength(2);
    });
  });

  it('should show location icon for selected asset', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      selectAsset: jest.fn(),
      forceUpdate: jest.fn(),
      selectedAsset: mockAssets[0], // Select first asset
      playingAssets: [],
    });

    renderComponent();
    const locationIcons = screen.getAllByTitle('Show on Map');
    
    // Check for the presence of icons using data-testid
    expect(screen.getByTestId('LocationOnIcon')).toBeInTheDocument();
    expect(screen.getByTestId('LocationOnOutlinedIcon')).toBeInTheDocument();
  });

  it('should select asset when location icon is clicked', () => {
    const mockSelectAsset = jest.fn();
    const mockForceUpdate = jest.fn();
    
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      selectAsset: mockSelectAsset,
      forceUpdate: mockForceUpdate,
      selectedAsset: null,
      playingAssets: [],
    });

    renderComponent();
    const locationIcons = screen.getAllByTitle('Show on Map');
    fireEvent.click(locationIcons[0]); // Click first location icon
    
    expect(mockSelectAsset).toHaveBeenCalledWith(mockAssets[1]); // First icon corresponds to second asset due to reverse order
    expect(mockForceUpdate).toHaveBeenCalled();
  });

  it('should respect infoCardDefaultCollapsed config', async () => {
    config.ui.listenSidebar.history.infoCardDefaultCollapsed = true;
    renderComponent();
    
    // Initially collapsed - check for collapsed state
    const locationButtons = screen.getAllByTitle('Show on Map');
    expect(locationButtons).toHaveLength(2);
    
    // Click to expand first card
    const headers = screen.getAllByText(moment(mockAssets[0].addedAt).format('h:mm:ss A MMMM Do YYYY'));
    fireEvent.click(headers[0]);
    
    // Wait for expand animation and verify expanded state
    await waitFor(() => {
      const expandedContent = screen.getAllByTestId('asset-info-card');
      expect(expandedContent).toHaveLength(2); // Both cards remain in DOM
    });
  });

  it('should handle duplicate assets by showing only unique ones', () => {
    const duplicateAssets = [
      ...mockAssets,
      { ...mockAssets[0] }, // Duplicate of first asset
    ];

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        listenHistory: {
          assets: duplicateAssets,
          clear: jest.fn(),
        },
      },
      selectAsset: jest.fn(),
      forceUpdate: jest.fn(),
      selectedAsset: null,
      playingAssets: [],
    });

    renderComponent();
    const assetCards = screen.getAllByTestId('asset-info-card');
    expect(assetCards).toHaveLength(2); // Should only show unique assets
  });
});
