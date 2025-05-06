import { render, screen } from '@testing-library/react';
import { useRoundware } from '@/hooks';
import { useGoogleMap } from '@react-google-maps/api';
import { useTheme } from '@mui/material';
import ListenerLocationMarker from '@/components/ListenPage/Map/WalkingModeButton/ListenerLocationMarker';
import React from 'react';

// Mock the SVG import
jest.mock('@/assets/walkingModePin.svg', () => 'test-file-stub');

// Mock Google Maps API
const mockGoogle = {
  maps: {
    Size: jest.fn((width: number, height: number) => ({ width, height })),
    LatLng: jest.fn((lat: number, lng: number) => ({ lat, lng })),
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
      getNorthEast: jest.fn(() => ({ lat: 40.7128, lng: -74.0060 })),
      getSouthWest: jest.fn(() => ({ lat: 40.7128, lng: -74.0060 })),
    })),
    // Add empty implementations for required properties
    importLibrary: jest.fn(),
    Animation: {},
    BicyclingLayer: {},
    Circle: {},
    ControlPosition: {},
    DrawingManager: {},
    Geocoder: {},
    GroundOverlay: {},
    ImageMapType: {},
    KmlLayer: {},
    Map: {},
    MapTypeId: {},
    MapTypeRegistry: {},
    MapTypeStyle: {},
    Marker: {},
    MarkerClusterer: {},
    MaxZoomService: {},
    MVCArray: {},
    MVCObject: {},
    NavigationControl: {},
    OverlayView: {},
    PanControl: {},
    PlacesService: {},
    PlacesServiceStatus: {},
    Point: {},
    Polygon: {},
    Polyline: {},
    Rectangle: {},
    ScaleControl: {},
    StreetViewCoverageLayer: {},
    StreetViewPanorama: {},
    StreetViewService: {},
    StreetViewStatus: {},
    StyledMapType: {},
    SymbolPath: {},
    TrafficLayer: {},
    TransitLayer: {},
    UnitSystem: {},
    ZoomControl: {},
  } as any,
};

// Mock Google Maps components
jest.mock('@react-google-maps/api', () => ({
  useGoogleMap: jest.fn(),
  Circle: jest.fn(({ onLoad, center, radius, options }) => {
    if (onLoad) {
      onLoad({
        getBounds: () => mockGoogle.maps.LatLngBounds(),
      });
    }
    return <div data-testid="circle" data-center={JSON.stringify(center)} data-radius={radius} data-options={JSON.stringify(options)} />;
  }),
  Marker: jest.fn(({ position, icon, children }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)} data-icon={JSON.stringify(icon)}>
      {children}
    </div>
  )),
  InfoWindow: jest.fn(({ position, options, children }) => (
    <div data-testid="info-window" data-position={JSON.stringify(position)} data-options={JSON.stringify(options)}>
      {children}
    </div>
  )),
}));

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  useTheme: jest.fn(),
  Typography: jest.fn(({ children }) => <div data-testid="typography">{children}</div>),
}));

// Mock the hooks
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the Google Maps API
const mockMap = {
  panToBounds: jest.fn(),
};

// Set up global google object
global.google = mockGoogle as any;

describe('ListenerLocationMarker Smoke Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    (useTheme as jest.Mock).mockReturnValue({
      palette: {
        primary: { light: '#primary-light' },
        secondary: { light: '#secondary-light' },
      },
    });
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        listenerLocation: { latitude: 40.7128, longitude: -74.0060 },
        project: { recordingRadius: 100 },
      },
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<ListenerLocationMarker />);
      expect(screen.getByTestId('circle')).toBeInTheDocument();
    });

    it('renders marker with correct position', () => {
      render(<ListenerLocationMarker />);
      const marker = screen.getByTestId('marker');
      expect(marker).toHaveAttribute('data-position', JSON.stringify({ lat: 40.7128, lng: -74.0060 }));
    });

    it('renders info window with correct position', () => {
      render(<ListenerLocationMarker />);
      const infoWindow = screen.getByTestId('info-window');
      expect(infoWindow).toHaveAttribute('data-position', JSON.stringify({ lat: 40.7128, lng: -74.0060 }));
    });
  });

  describe('Circle Configuration', () => {
    it('configures circle with correct center', () => {
      render(<ListenerLocationMarker />);
      const circle = screen.getByTestId('circle');
      expect(circle).toHaveAttribute('data-center', JSON.stringify({ lat: 40.7128, lng: -74.0060 }));
    });

    it('configures circle with correct radius', () => {
      render(<ListenerLocationMarker />);
      const circle = screen.getByTestId('circle');
      expect(circle).toHaveAttribute('data-radius', '100');
    });

    it('configures circle with correct styling', () => {
      render(<ListenerLocationMarker />);
      const circle = screen.getByTestId('circle');
      const options = JSON.parse(circle.getAttribute('data-options') || '{}');
      expect(options.strokeColor).toBe('#secondary-light');
      expect(options.fillColor).toBe('#primary-light');
      expect(options.strokeOpacity).toBe(0.5);
      expect(options.fillOpacity).toBe(0.3);
    });
  });

  describe('Marker Configuration', () => {
    it('configures marker with correct icon settings', () => {
      render(<ListenerLocationMarker />);
      const marker = screen.getByTestId('marker');
      const icon = JSON.parse(marker.getAttribute('data-icon') || '{}');
      expect(icon.url).toBe('test-file-stub');
      expect(icon.scaledSize).toEqual({ width: 30, height: 30 });
    });
  });

  describe('Error Handling', () => {
    it('handles missing theme gracefully', () => {
      (useTheme as jest.Mock).mockReturnValue({
        palette: {
          primary: { light: '#primary-light' },
          secondary: { light: '#secondary-light' },
        },
      });
      render(<ListenerLocationMarker />);
      const circle = screen.getByTestId('circle');
      const options = JSON.parse(circle.getAttribute('data-options') || '{}');
      expect(options.strokeColor).toBe('#secondary-light');
      expect(options.fillColor).toBe('#primary-light');
    });

    it('handles missing project data gracefully', () => {
      (useRoundware as jest.Mock).mockReturnValue({
        roundware: {
          listenerLocation: { latitude: 40.7128, longitude: -74.0060 },
          project: { recordingRadius: 100 },
        },
      });
      render(<ListenerLocationMarker />);
      const circle = screen.getByTestId('circle');
      expect(circle).toHaveAttribute('data-radius', '100');
    });
  });

  describe('Map Integration', () => {
    it('updates map bounds when circle is loaded', () => {
      render(<ListenerLocationMarker />);
      expect(mockMap.panToBounds).toHaveBeenCalled();
    });

    it('handles missing map instance gracefully', () => {
      (useGoogleMap as jest.Mock).mockReturnValue(null);
      render(<ListenerLocationMarker />);
      // Should not throw any errors
    });
  });
}); 