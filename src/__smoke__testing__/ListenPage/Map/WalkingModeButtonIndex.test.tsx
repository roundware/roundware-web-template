import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRoundware } from '@/hooks';
import WalkingModeButton from '@/components/ListenPage/Map/WalkingModeButton';
import { GeoListenMode } from 'roundware-web-framework/dist/index';
import { useGoogleMap } from '@react-google-maps/api';
import { useURLSync } from '@/context/URLContext';

// Mock messages
jest.mock('@/locales/en_US.json', () => ({
  errors: {
    walkingModeNotSupported: {
      title: 'Walking Mode not supported!',
      message: 'Your browser doesn\'t support Walking Mode.',
    },
    permissionDenied: {
      title: 'Location Access Denied',
      message: 'You have denied access to your location.',
    },
    outOfRange: {
      title: 'Out of Range',
      message: 'You are outside the listening area.',
    },
    timeOut: {
      title: 'Location Timeout',
      message: 'Could not determine your location in time.',
    },
    failedToDetermineLocation: {
      title: 'Location Error',
      message: 'Failed to determine your location.',
    },
  },
}));

// Mock Material-UI theme and breakpoints
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false),
}));

jest.mock('@mui/styles', () => ({
  ...jest.requireActual('@mui/styles'),
  makeStyles: jest.fn(() => () => ({
    walkingModeButton: 'test-class',
    hidden: 'hidden-class',
  })),
  useTheme: jest.fn(() => ({
    breakpoints: {
      down: jest.fn(() => false),
    },
  })),
}));

// Mock config
jest.mock('@/config', () => ({
  listen: {
    availableListenModes: ['device'],
  },
  map: {
    zoom: {
      low: 12,
      walking: 18,
    },
    bounds: 'none',
  },
}));

// Mock SVG imports
jest.mock('@/assets/walkingModePin.svg', () => 'test-file-stub');

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the useGoogleMap hook
jest.mock('@react-google-maps/api', () => ({
  useGoogleMap: jest.fn(),
}));

// Mock the useURLSync hook
jest.mock('@/context/URLContext', () => ({
  useURLSync: jest.fn(),
}));

// Mock the ListenerLocationMarker component
jest.mock('@/components/ListenPage/Map/WalkingModeButton/ListenerLocationMarker', () => () => null);

describe('WalkingModeButton Smoke Tests', () => {
  const mockRoundware = {
    project: { id: 1 },
    listenerLocation: { latitude: 40.7128, longitude: -74.0060 },
    geoPosition: {
      enable: jest.fn(),
      waitForInitialGeolocation: jest.fn(),
    },
    events: {
      logEvent: jest.fn(),
    },
    mixer: {
      playlist: {
        trackIdMap: {},
      },
      skipTrack: jest.fn(),
    },
    getMapBounds: jest.fn(),
  };

  const mockMap = {
    setZoom: jest.fn(),
    setOptions: jest.fn(),
    getCenter: jest.fn(),
    panTo: jest.fn(),
  };

  const mockParams = new URLSearchParams();
  const mockDeleteFromURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      forceUpdate: jest.fn(),
      geoListenMode: GeoListenMode.MANUAL,
      setGeoListenMode: jest.fn(),
    });
    (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    (useURLSync as jest.Mock).mockReturnValue({
      params: mockParams,
      deleteFromURL: mockDeleteFromURL,
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<WalkingModeButton />);
    });

    it('displays the walking mode button when available', () => {
      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Enter Walking Mode');
    });

  });

  describe('Geolocation Support', () => {
    it('shows walking mode not supported dialog when geolocation is not available', async () => {
      const originalGeolocation = global.navigator.geolocation;
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Walking Mode not supported!')).toBeInTheDocument();
        expect(screen.getByText('Your browser doesn\'t support Walking Mode.')).toBeInTheDocument();
      });

      const okButton = await screen.findByText('OK');
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(screen.queryByText('Walking Mode not supported!')).not.toBeInTheDocument();
      });

      Object.defineProperty(global.navigator, 'geolocation', {
        value: originalGeolocation,
        configurable: true,
      });
    });

    it('shows location permission dialog when entering walking mode', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn(),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });

      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invisible Choir needs access')).toBeInTheDocument();
      });

      const allowButton = await screen.findByText('Allow');
      fireEvent.click(allowButton);

      await waitFor(() => {
        expect(mockRoundware.geoPosition.enable).toHaveBeenCalled();
      });
    });

    it('handles location permission denied', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn().mockImplementation((success, error) => {
          error({ code: 1 }); // PERMISSION_DENIED
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });

      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invisible Choir needs access')).toBeInTheDocument();
      });

      const blockButton = await screen.findByText('Block');
      fireEvent.click(blockButton);

      await waitFor(() => {
        expect(screen.getByText('SORRY!')).toBeInTheDocument();
        expect(screen.getByText(/To participate fully in the artwork experience we need access to your location/)).toBeInTheDocument();
      });
    });
  });

  describe('Mode Switching', () => {
    it('toggles between walking and map modes', async () => {
      const setGeoListenMode = jest.fn();
      (useRoundware as jest.Mock).mockReturnValue({
        roundware: mockRoundware,
        forceUpdate: jest.fn(),
        geoListenMode: GeoListenMode.MANUAL,
        setGeoListenMode,
      });

      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invisible Choir needs access')).toBeInTheDocument();
      });

      const allowButton = await screen.findByText('Allow');
      fireEvent.click(allowButton);

      await waitFor(() => {
        expect(setGeoListenMode).toHaveBeenCalledWith(GeoListenMode.AUTOMATIC);
      });

      // Click again to switch back to map mode
      fireEvent.click(button);
      await waitFor(() => {
        expect(setGeoListenMode).toHaveBeenCalledWith(GeoListenMode.MANUAL);
      });
    });

    it('updates map zoom level when switching modes', async () => {
      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invisible Choir needs access')).toBeInTheDocument();
      });

      const allowButton = await screen.findByText('Allow');
      fireEvent.click(allowButton);

      await waitFor(() => {
        expect(mockMap.setZoom).toHaveBeenCalledWith(18); // walking mode zoom
      });

      // Click again to switch back to map mode
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockMap.setZoom).toHaveBeenCalledWith(12); // map mode zoom
      });
    });

    it('updates map options when switching modes', async () => {
      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invisible Choir needs access')).toBeInTheDocument();
      });

      const allowButton = await screen.findByText('Allow');
      fireEvent.click(allowButton);

      await waitFor(() => {
        expect(mockMap.setOptions).toHaveBeenCalledWith({ gestureHandling: 'none' });
      });

      // Click again to switch back to map mode
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockMap.setOptions).toHaveBeenCalledWith({ gestureHandling: 'cooperative' });
      });
    });
  });

  describe('Error Handling', () => {
    

    it('logs events when switching modes', async () => {
      render(<WalkingModeButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invisible Choir needs access')).toBeInTheDocument();
      });

      const allowButton = await screen.findByText('Allow');
      fireEvent.click(allowButton);

      await waitFor(() => {
        expect(mockRoundware.events.logEvent).toHaveBeenCalledWith('change_listen_mode', {
          data: 'listen_mode: walking',
        });
      });

      // Click again to switch back to map mode
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockRoundware.events.logEvent).toHaveBeenCalledWith('change_listen_mode', {
          data: 'listen_mode: map',
        });
      });
    });
  });
});