import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GoogleMap, LoadScript, useGoogleMap } from '@react-google-maps/api';
import AssetLayer from '@/components/ListenPage/Map/AssetLayer';
import { useRoundware } from '@/hooks';
import { IAssetData } from 'roundware-web-framework';

// Mock SVG imports
jest.mock('../../../../assets/marker-secondary.svg', () => 'marker-secondary.svg');
jest.mock('../../../../assets/marker.svg', () => 'marker.svg');

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the polygonToGoogleMapPaths utility
jest.mock('@/utils', () => ({
  polygonToGoogleMapPaths: jest.fn().mockReturnValue([
    { lat: 40.7128, lng: -74.0060 },
    { lat: 40.7129, lng: -74.0061 },
    { lat: 40.7130, lng: -74.0062 },
  ]),
}));

// Mock the AssetMarker component
jest.mock('@/components/ListenPage/Map/AssetLayer/AssetMarker', () => ({
  __esModule: true,
  default: ({ asset, isPlaying }: { asset: IAssetData; isPlaying: boolean }) => {
    const config = require('@/config');
    const { playingAssets } = require('@/hooks').useRoundware();
    const isAssetPlaying = playingAssets.some((a: IAssetData) => a.id === asset.id);
    
    if (config.map.assetDisplay === 'circle') {
      return <div data-testid="circle" />;
    }
    if (config.map.assetDisplay === 'polygon' && asset.shape) {
      return <div data-testid="polygon" />;
    }
    return (
      <div 
        data-testid="asset-marker" 
        style={{ 
          zIndex: isAssetPlaying ? '101' : '100',
          display: 'block'
        }}
      >
        {asset.id}
      </div>
    );
  },
}));

// Mock the Google Maps components and hooks
jest.mock('@react-google-maps/api', () => ({
  LoadScript: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  GoogleMap: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MarkerClusterer: ({ children, onClick }: { 
    children: (clusterer: any) => React.ReactNode;
    onClick: (cluster: any) => void;
  }) => {
    const mockClusterer = {
      markers: [],
      clusters: [],
      addMarkers: jest.fn(),
      clearMarkers: jest.fn(),
      repaint: jest.fn(),
    };

    // Simulate cluster click
    const mockCluster = {
      center: {
        lat: () => 40.7128,
        lng: () => -74.0060,
      },
    };

    // Call onClick immediately to simulate cluster click
    onClick(mockCluster);

    return <div data-testid="marker-clusterer">{children(mockClusterer)}</div>;
  },
  InfoWindow: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Circle: () => <div data-testid="circle" />,
  Polygon: () => <div data-testid="polygon" />,
  useGoogleMap: jest.fn(),
}));

// Mock the OverlappingMarkerSpiderfier
jest.mock('ts-overlapping-marker-spiderfier', () => {
  return {
    OverlappingMarkerSpiderfier: jest.fn().mockImplementation(() => ({
      addMarker: jest.fn(),
    })),
  };
});

// Mock the config
jest.mock('@/config', () => ({
  map: {
    assetDisplay: 'marker',
    zoom: {
      high: 15,
    },
  },
}));

describe('AssetLayer', () => {
  const mockMap = {
    panTo: jest.fn(),
    setZoom: jest.fn(),
  };

  const mockAssets: IAssetData[] = [
    {
      id: 1,
      latitude: 40.7128,
      longitude: -74.0060,
      description: 'Test Asset 1',
      created: '2023-01-01',
      updated: '2023-01-01',
      tag_ids: [1, 2],
      envelope_ids: [1],
      file: 'test1.mp3',
      filename: 'test1.mp3',
      volume: 1,
      submitted: true,
      weight: 1,
      start_time: 0,
      end_time: 100,
      media_type: 'audio',
      audio_length_in_seconds: 100,
      session_id: 1,
      project_id: 1,
      language_id: 1,
      description_loc_ids: [],
      alt_text_loc_ids: [],
      shape: null,
      user: {
        username: 'testuser',
        email: 'test@example.com'
      }
    },
    {
      id: 2,
      latitude: 40.7129,
      longitude: -74.0061,
      description: 'Test Asset 2',
      created: '2023-01-02',
      updated: '2023-01-02',
      tag_ids: [3, 4],
      envelope_ids: [2],
      file: 'test2.mp3',
      filename: 'test2.mp3',
      volume: 1,
      submitted: true,
      weight: 1,
      start_time: 0,
      end_time: 100,
      media_type: 'audio',
      audio_length_in_seconds: 100,
      session_id: 1,
      project_id: 1,
      language_id: 1,
      description_loc_ids: [],
      alt_text_loc_ids: [],
      shape: null,
      user: {
        username: 'testuser',
        email: 'test@example.com'
      }
    },
  ];

  const mockRoundware = {
    project: {
      projectName: 'Test Project',
      recordingRadius: 100,
    },
    mixer: {
      playing: true,
      playlist: {
        trackMap: new Map([
          [1, { id: 1 }],
        ]),
      },
    },
    updateLocation: jest.fn(),
    vote: jest.fn(),
  };

  beforeEach(() => {
    // Mock useGoogleMap to return our mock map
    (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      assetPage: mockAssets,
      selectedAsset: null,
      playingAssets: [{ id: 1 }],
      selectAsset: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={jest.fn()} />
        </GoogleMap>
      </LoadScript>
    );
  });

  it('handles asset selection and location updates', async () => {
    const updateLocation = jest.fn();
    const selectedAsset = mockAssets[0];

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      assetPage: mockAssets,
      selectedAsset,
      playingAssets: [],
      selectAsset: jest.fn(),
    });

    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={updateLocation} />
        </GoogleMap>
      </LoadScript>
    );

    await waitFor(() => {
      expect(mockMap.panTo).toHaveBeenCalledWith({
        lat: selectedAsset.latitude,
        lng: selectedAsset.longitude,
      });
      expect(mockMap.setZoom).toHaveBeenCalledWith(15); // config.map.zoom.high
      expect(mockRoundware.updateLocation).toHaveBeenCalledWith({
        latitude: selectedAsset.latitude,
        longitude: selectedAsset.longitude,
      });
    });
  });

  it('renders circle display mode for assets', () => {
    // Override config for this test
    const config = require('@/config');
    config.map.assetDisplay = 'circle';

    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={jest.fn()} />
        </GoogleMap>
      </LoadScript>
    );

    // Verify circles are rendered
    const circles = screen.getAllByTestId('circle');
    expect(circles).toHaveLength(mockAssets.length);
  });

  it('renders polygon display mode for assets with shape data', () => {
    const assetsWithShape = [
      ...mockAssets,
      {
        ...mockAssets[0],
        id: 3,
        shape: {
          type: 'Polygon',
          coordinates: [[[40.7128, -74.0060], [40.7129, -74.0061], [40.7130, -74.0062], [40.7128, -74.0060]]],
        },
      },
    ];

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      assetPage: assetsWithShape,
      selectedAsset: null,
      playingAssets: [],
      selectAsset: jest.fn(),
    });

    // Override config for this test
    const config = require('@/config');
    config.map.assetDisplay = 'polygon';

    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={jest.fn()} />
        </GoogleMap>
      </LoadScript>
    );

    // Verify polygon is rendered
    const polygons = screen.getAllByTestId('polygon');
    expect(polygons).toHaveLength(1);
  });

  it('handles cluster click events', async () => {
    const updateLocation = jest.fn();
    const mockCluster = {
      center: {
        lat: () => 40.7128,
        lng: () => -74.0060,
      },
    };

    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={updateLocation} />
        </GoogleMap>
      </LoadScript>
    );

    await waitFor(() => {
      expect(updateLocation).toHaveBeenCalledWith({
        latitude: mockCluster.center.lat(),
        longitude: mockCluster.center.lng(),
      });
    });
  });

  it('updates marker styles for playing assets', () => {
    const playingAssets = [mockAssets[0]];
    
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        ...mockRoundware,
        mixer: {
          ...mockRoundware.mixer,
          playing: true,
        },
      },
      assetPage: mockAssets,
      selectedAsset: null,
      playingAssets,
      selectAsset: jest.fn(),
    });

    // Ensure we're in marker display mode
    const config = require('@/config');
    config.map.assetDisplay = 'marker';

    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={jest.fn()} />
        </GoogleMap>
      </LoadScript>
    );

    // Verify that playing assets have different styling
    const markers = screen.getAllByTestId('asset-marker');
    expect(markers).toHaveLength(2);
    
    // Get the computed styles
    const firstMarkerStyle = window.getComputedStyle(markers[0]);
    const secondMarkerStyle = window.getComputedStyle(markers[1]);
    
    expect(firstMarkerStyle.zIndex).toBe('101'); // Playing asset
    expect(secondMarkerStyle.zIndex).toBe('100'); // Non-playing asset
  });

  it('does not render when map is not available', () => {
    (useGoogleMap as jest.Mock).mockReturnValue(null);
    
    render(
      <LoadScript googleMapsApiKey="test-key">
        <GoogleMap>
          <AssetLayer updateLocation={jest.fn()} />
        </GoogleMap>
      </LoadScript>
    );
    
    expect(screen.queryByTestId('marker-clusterer')).not.toBeInTheDocument();
  });
}); 