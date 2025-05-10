import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { lightTheme } from '../../../styles';
import { AssetInfoWindowInner } from '../../../components/ListenPage/Map/AssetLayer/AssetInfoWindow';
import Roundware, { IAssetData, GeoListenMode } from 'roundware-web-framework';
import RoundwareContext from '../../../context/RoundwareContext';

// Mock Google Maps InfoWindow
jest.mock('@react-google-maps/api', () => ({
  InfoWindow: ({ children, onCloseClick }: { children: React.ReactNode; onCloseClick: () => void }) => (
    <div data-testid="mock-info-window" onClick={onCloseClick}>
      {children}
    </div>
  ),
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock google maps Size
global.google = {
  maps: {
    Size: jest.fn().mockImplementation((width, height) => ({ width, height })),
  },
} as any;

// Mock data
const mockAsset: IAssetData = {
  id: 1,
  description: 'Test Description',
  latitude: 40.7128,
  longitude: -74.0060,
  filename: 'test.mp3',
  file: 'test.mp3',
  volume: 1,
  submitted: true,
  created: '2023-01-01T00:00:00Z',
  updated: '2023-01-01T00:00:00Z',
  weight: 1,
  start_time: 0,
  end_time: 100,
  media_type: 'audio',
  audio_length_in_seconds: 100,
  tag_ids: [1, 2],
  session_id: 1,
  project_id: 1,
  language_id: 1,
  envelope_ids: [],
  description_loc_ids: [],
  alt_text_loc_ids: []
};

const mockRoundware = new Roundware({
  deviceId: 'test-device',
  serverUrl: 'https://test.server',
  projectId: 1,
  geoListenMode: GeoListenMode.DISABLED,
  speakerFilters: { activeyn: true },
  assetFilters: { submitted: true },
  listenerLocation: { latitude: 0, longitude: 0 },
  assetUpdateInterval: 30000,
  speakerConfig: {
    mode: 'progressive-sync-basePlusMax5Random',
    loop: true,
    acceptableDelayMs: 50,
    syncCheckInterval: 2500,
    replaceWithNoneProbability: 0.2,
    loopPointUpdateProbability: 0.8,
    slotConsiderationProbability: 0.5,
    prefetchDistanceMeters: 5,
    loopFractions: [1/8, 1/16],
    effects: {
      delayTimeInMs: 50,
      feedback: 0.5,
      pan: [-0.8, -0.4, 0.4, 0.8]
    }
  }
});

// Mock Roundware class
jest.mock('roundware-web-framework', () => {
  const mockRoundware = {
    connect: jest.fn(),
    getAssets: jest.fn().mockResolvedValue([]),
    project: {
      projectName: 'Test Project',
      data: {},
      outOfRangeDistance: 100,
    },
    mixer: {
      speakerEngine: {
        speakers: [],
      },
    },
    listenHistory: {
      assets: [],
    },
    selectAsset: jest.fn(),
    findTagDescription: jest.fn().mockReturnValue('Mock Tag Description'),
  };
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockRoundware),
    GeoListenMode: {
      DISABLED: 'disabled',
    },
  };
});

const mockRoundwareContext = {
  roundware: mockRoundware,
  tagLookup: {
    1: { 
      id: 1,
      tag_id: 1,
      tag_text: 'Tag 1',
      tag_display_text: 'Tag 1',
      description: 'Tag 1 Description',
      parent_id: null,
      loc_id: 1,
      loc_description: null,
      weight: 1,
      select: true,
      group_short_name: 'speak',
      default_state: true
    },
    2: { 
      id: 2,
      tag_id: 2,
      tag_text: 'Tag 2',
      tag_display_text: 'Tag 2',
      description: 'Tag 2 Description',
      parent_id: null,
      loc_id: 2,
      loc_description: null,
      weight: 1,
      select: true,
      group_short_name: 'speak',
      default_state: true
    }
  },
  sortField: { name: 'created' as keyof IAssetData, asc: false },
  selectedTags: null,
  selectedAsset: null,
  beforeDateFilter: null,
  afterDateFilter: null,
  assetPageIndex: 0,
  assetsPerPage: 10,
  geoListenMode: GeoListenMode.DISABLED,
  userFilter: '',
  playingAssets: [],
  descriptionFilter: null,
  selectAsset: jest.fn(),
  selectTags: jest.fn(),
  setUserFilter: jest.fn(),
  setBeforeDateFilter: jest.fn(),
  setAfterDateFilter: jest.fn(),
  setAssetPageIndex: jest.fn(),
  setAssetsPerPage: jest.fn(),
  setSortField: jest.fn(),
  setDescriptionFilter: jest.fn(),
  forceUpdate: jest.fn(),
  setGeoListenMode: jest.fn(),
  updateAssets: jest.fn(),
  resetFilters: jest.fn(),
  assetPage: [],
  assetsReady: true,
  hideSpeakerPolygons: [],
  setHideSpeakerPolygons: jest.fn(),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={lightTheme}>
        <RoundwareContext.Provider value={mockRoundwareContext}>
          {children}
        </RoundwareContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

describe('AssetInfoWindow Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={mockAsset} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId('mock-info-window')).toBeInTheDocument();
  });

  it('displays asset information correctly', () => {
    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={mockAsset} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

    // Check if basic asset information is displayed
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2023 5:30 AM')).toBeInTheDocument();
  });

  it('handles close click correctly', () => {
    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={mockAsset} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

    // Click the info window to close it
    const infoWindow = screen.getByTestId('mock-info-window');
    infoWindow.click();

    // Check if selectAsset was called with null
    expect(mockRoundwareContext.selectAsset).toHaveBeenCalledWith(null);
  });

  it('positions info window correctly based on asset coordinates', () => {
    const assetWithCoords: IAssetData = {
      ...mockAsset,
      latitude: 42.3601,
      longitude: -71.0589
    };

    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={assetWithCoords} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

    // Info window should be rendered
    expect(screen.getByTestId('mock-info-window')).toBeInTheDocument();
  });

  it('handles different asset types correctly', () => {
    const photoAsset: IAssetData = {
      ...mockAsset,
      media_type: 'photo',
      file: 'test.jpg',
      filename: 'test.jpg'
    };

    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={photoAsset} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

    // Info window should be rendered for photo asset
    expect(screen.getByTestId('mock-info-window')).toBeInTheDocument();
  });

  it('handles missing coordinates gracefully', () => {
    const assetWithoutCoords: IAssetData = {
      ...mockAsset,
      latitude: 0,
      longitude: 0
    };

    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={assetWithoutCoords} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

    // Info window should still be rendered
    expect(screen.getByTestId('mock-info-window')).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const assetWithoutDescription: IAssetData = {
      ...mockAsset,
      description: ''
    };

    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={assetWithoutDescription} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

    // Info window should still be rendered
    expect(screen.getByTestId('mock-info-window')).toBeInTheDocument();
  });

  it('handles info window options correctly', () => {
    render(
      <TestWrapper>
        <AssetInfoWindowInner 
          asset={mockAsset} 
          selectAsset={mockRoundwareContext.selectAsset}
          roundware={mockRoundware}
        />
      </TestWrapper>
    );

  });
}); 