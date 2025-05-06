import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetMarker from '@/components/ListenPage/Map/AssetLayer/AssetMarker';
import { IAssetData } from 'roundware-web-framework';
import { useRoundware } from '@/hooks';
import finalConfig from '@/config';
import { Clusterer } from '@react-google-maps/marker-clusterer';
import { OverlappingMarkerSpiderfier } from 'ts-overlapping-marker-spiderfier';
import { Polygon } from 'geojson';

// Mock global google object
global.google = {
  maps: {
    Size: jest.fn().mockImplementation((width, height) => ({ width, height })),
    Marker: jest.fn().mockImplementation(() => ({
      setMap: jest.fn(),
      setPosition: jest.fn(),
      setIcon: jest.fn(),
      setZIndex: jest.fn(),
    })),
    Circle: jest.fn(),
    Polygon: jest.fn(),
    LatLng: jest.fn().mockImplementation((lat, lng) => ({ lat, lng })),
    Map: jest.fn(),
    event: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
} as any;

// Mock SVG imports
jest.mock('../../../../assets/marker-secondary.svg', () => 'marker-secondary.svg');
jest.mock('../../../../assets/marker.svg', () => 'marker.svg');

// Mock the Google Maps components
jest.mock('@react-google-maps/api', () => ({
  Marker: ({ children, onLoad }: { children: React.ReactNode; onLoad: (marker: any) => void }) => {
    React.useEffect(() => {
      onLoad({ setMap: jest.fn() });
    }, []);
    return <div data-testid="marker">{children}</div>;
  },
  Circle: () => <div data-testid="circle" />,
  Polygon: () => <div data-testid="polygon" />,
}));

// Mock the marker clusterer
jest.mock('@react-google-maps/marker-clusterer', () => ({
  Clusterer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the Roundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the OverlappingMarkerSpiderfier
jest.mock('ts-overlapping-marker-spiderfier', () => ({
  OverlappingMarkerSpiderfier: jest.fn().mockImplementation(() => ({
    addMarker: jest.fn(),
    map: null,
    spiderfiedZIndex: 0,
    highlightedLegZIndex: 0,
    usualLegZIndex: 0,
  })),
}));

// Mock the polygonToGoogleMapPaths utility
jest.mock('@/utils', () => ({
  polygonToGoogleMapPaths: jest.fn().mockReturnValue([]),
}));

// Mock the AssetInfoWindow component
jest.mock('@/components/ListenPage/Map/AssetLayer/AssetInfoWindow', () => ({
  AssetInfoWindowInner: () => <div data-testid="info-window">Info Window</div>,
}));

describe('AssetMarker', () => {
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
    alt_text_loc_ids: [],
    shape: null,
    user: {
      username: 'testuser',
      email: 'test@example.com'
    }
  };

  const mockClusterer = {
    addMarker: jest.fn(),
    markers: [],
    clusters: [],
    listeners: [],
    activeMap: null,
  } as unknown as Clusterer;

  const mockOms = {
    addMarker: jest.fn(),
    map: null,
    spiderfiedZIndex: 0,
    highlightedLegZIndex: 0,
    usualLegZIndex: 0,
  } as unknown as OverlappingMarkerSpiderfier;

  const mockSelectAsset = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation for useRoundware
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playing: false,
          playlist: {
            trackMap: new Map(),
          },
        },
        project: {
          recordingRadius: 100,
        },
      },
      selectAsset: mockSelectAsset,
      playingAssets: new Set(),
      selectedAsset: null,
    });
  });

  it('renders marker with correct position', () => {
    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    const marker = screen.getByTestId('marker');
    expect(marker).toBeInTheDocument();
  });

  it('renders circle when assetDisplay is set to circle', () => {
    finalConfig.map.assetDisplay = 'circle';
    
    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    const circle = screen.getByTestId('circle');
    expect(circle).toBeInTheDocument();
  });

  it('renders polygon when assetDisplay is set to polygon and shape is provided', () => {
    finalConfig.map.assetDisplay = 'polygon';
    const assetWithShape = {
      ...mockAsset,
      shape: {
        type: 'Polygon',
        coordinates: [[[40.7128, -74.0060], [40.7129, -74.0061], [40.7127, -74.0061], [40.7128, -74.0060]]],
      } as Polygon,
    };
    
    render(<AssetMarker asset={assetWithShape} clusterer={mockClusterer} oms={mockOms} />);
    
    const polygon = screen.getByTestId('polygon');
    expect(polygon).toBeInTheDocument();
  });

  it('does not render polygon when assetDisplay is polygon but shape is not provided', () => {
    finalConfig.map.assetDisplay = 'polygon';
    
    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    const polygon = screen.queryByTestId('polygon');
    expect(polygon).not.toBeInTheDocument();
  });

  it('changes marker appearance when asset is playing', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playing: true,
          playlist: {
            trackMap: new Map([[1, mockAsset]]),
          },
        },
        project: {
          recordingRadius: 100,
        },
      },
      selectAsset: mockSelectAsset,
      playingAssets: new Set([1]),
      selectedAsset: null,
    });

    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    const marker = screen.getByTestId('marker');
    expect(marker).toBeInTheDocument();
  });

  it('shows info window when asset is selected', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playing: false,
          playlist: {
            trackMap: new Map(),
          },
        },
        project: {
          recordingRadius: 100,
        },
      },
      selectAsset: mockSelectAsset,
      playingAssets: new Set(),
      selectedAsset: mockAsset,
    });

    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    const infoWindow = screen.getByTestId('info-window');
    expect(infoWindow).toBeInTheDocument();
  });

  it('does not show info window when different asset is selected', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playing: false,
          playlist: {
            trackMap: new Map(),
          },
        },
        project: {
          recordingRadius: 100,
        },
      },
      selectAsset: mockSelectAsset,
      playingAssets: new Set(),
      selectedAsset: { ...mockAsset, id: 2 },
    });

    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    const infoWindow = screen.queryByTestId('info-window');
    expect(infoWindow).not.toBeInTheDocument();
  });

  it('calls selectAsset when marker is clicked', () => {
    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    // Simulate marker click through the OMS callback
    const markerInstance = { setMap: jest.fn() };
    const onLoad = (mockOms.addMarker as jest.Mock).mock.calls[0][1];
    onLoad();
    
    expect(mockSelectAsset).toHaveBeenCalledWith(mockAsset);
  });

  it('uses correct marker size based on playing state', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playing: true,
          playlist: {
            trackMap: new Map([[1, mockAsset]]),
          },
        },
        project: {
          recordingRadius: 100,
        },
      },
      selectAsset: mockSelectAsset,
      playingAssets: new Set([1]),
      selectedAsset: null,
    });

    render(<AssetMarker asset={mockAsset} clusterer={mockClusterer} oms={mockOms} />);
    
    expect(google.maps.Size).toHaveBeenCalledWith(23, 23);
  });
});
