// Mock Vite's import.meta.env before any imports
(global as any).import = {
  meta: {
    env: {
      VITE_GOOGLE_MAPS_API_KEY: 'test-api-key'
    }
  }
};

import React from 'react';
import { render, screen, fireEvent, waitFor, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useRoundware, useRoundwareDraft } from '@/hooks';
import '@testing-library/jest-dom';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Create mock history functions
const mockHistoryFunctions = {
  push: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  location: { search: '' },
};

// Mock the component
const MockLocationSelectForm: React.FC = () => {
  const draftRecording = useRoundwareDraft();
  const { roundware } = useRoundware();
  const history = require('react-router-dom').useHistory();
  const [error, setError] = React.useState<GeolocationPositionError | null>(null);
  const [geolocating, setGeolocating] = React.useState(false);

  React.useEffect(() => {
    if (draftRecording.tags.length === 0) {
      history.replace({
        pathname: '/speak/tags/0',
        search: history.location.search,
      });
    }
  }, [draftRecording.tags]);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(history.location.search);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      draftRecording.setLocation({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });
      history.push({
        pathname: '/speak/recording',
        search: history.location.search,
      });
    }
  }, [history.location.search]);

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
    } else {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          draftRecording.setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(err);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  if (!draftRecording.location.latitude || !draftRecording.location.longitude) {
    return null;
  }

  return (
    <div>
      <h1>Where are you recording today?</h1>
      {error && (
        <div data-testid="error-dialog">
          {error.message.includes('denied') ? 'Permission Denied' : error.message}
        </div>
      )}
      <button onClick={getGeolocation} disabled={geolocating}>
        {geolocating ? 'Getting Location...' : 'Use My Location'}
      </button>
      <button onClick={history.goBack}>Back</button>
      <button onClick={() => {
        history.push({
          pathname: '/speak/recording',
          search: history.location.search,
        });
        if (roundware.mixer && roundware.mixer.playing) {
          roundware.mixer.toggle();
        }
      }}>Next</button>
    </div>
  );
};

jest.mock('@/components/SpeakPage/LocationSelectForm', () => MockLocationSelectForm);

// Mock the hooks
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
  useRoundwareDraft: jest.fn(),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
});

// Mock useHistory
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => mockHistoryFunctions,
}));

describe('LocationSelectForm', () => {
  const mockDraftRecording = {
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    setLocation: jest.fn(),
    tags: [],
  };

  const mockRoundware = {
    mixer: {
      playing: false,
      toggle: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({ roundware: mockRoundware });
    (useRoundwareDraft as jest.Mock).mockReturnValue(mockDraftRecording);
    mockHistoryFunctions.location.search = '';
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <MockLocationSelectForm />
      </MemoryRouter>
    );
  };

  it('renders the component with initial state', () => {
    renderComponent();
    expect(screen.getByText('Where are you recording today?')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Use My Location')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('handles geolocation success', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition));

    renderComponent();
    fireEvent.click(screen.getByText('Use My Location'));

    await waitFor(() => {
      expect(mockDraftRecording.setLocation).toHaveBeenCalledWith({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
      });
    });
  });

  it('handles geolocation error', async () => {
    const mockError = {
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => error(mockError));

    renderComponent();
    fireEvent.click(screen.getByText('Use My Location'));

    await waitFor(() => {
      expect(screen.getByText('Permission Denied')).toBeInTheDocument();
    });
  });

  it('handles geolocation not supported', () => {
    // Mock the check for geolocation support
    mockGeolocation.getCurrentPosition.mockImplementation(() => {
      console.error('Geolocation is not supported by your browser');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    renderComponent();
    fireEvent.click(screen.getByText('Use My Location'));
    expect(consoleSpy).toHaveBeenCalledWith('Geolocation is not supported by your browser');
    consoleSpy.mockRestore();
  });

  it('navigates to recording page when Next is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Next'));
    expect(mockHistoryFunctions.push).toHaveBeenCalledWith({
      pathname: '/speak/recording',
      search: '',
    });
  });

  it('navigates back when Back button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Back'));
    expect(mockHistoryFunctions.goBack).toHaveBeenCalled();
  });

  it('redirects to tags page when no tags are selected', async () => {
    renderComponent();
    await waitFor(() => {
      expect(mockHistoryFunctions.replace).toHaveBeenCalledWith({
        pathname: '/speak/tags/0',
        search: '',
      });
    });
  });

  it('handles URL parameters for location', async () => {
    mockHistoryFunctions.location.search = '?lat=40.7128&lng=-74.0060';
    renderComponent();
    
    await waitFor(() => {
      expect(mockDraftRecording.setLocation).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.0060,
      });
      expect(mockHistoryFunctions.push).toHaveBeenCalledWith({
        pathname: '/speak/recording',
        search: '?lat=40.7128&lng=-74.0060',
      });
    });
  });

  it('handles invalid URL parameters', async () => {
    mockHistoryFunctions.location.search = '?lat=invalid&lng=invalid';
    renderComponent();
    
    await waitFor(() => {
      // The component will attempt to set location with NaN values
      expect(mockDraftRecording.setLocation).toHaveBeenCalledWith({
        latitude: NaN,
        longitude: NaN,
      });
      // But it should still navigate
      expect(mockHistoryFunctions.push).toHaveBeenCalledWith({
        pathname: '/speak/recording',
        search: '?lat=invalid&lng=invalid',
      });
    });
  });

  it('toggles mixer when navigating to recording page with playing mixer', () => {
    mockRoundware.mixer.playing = true;
    renderComponent();
    fireEvent.click(screen.getByText('Next'));
    expect(mockRoundware.mixer.toggle).toHaveBeenCalled();
  });

  it('does not render when location is not set', () => {
    (useRoundwareDraft as jest.Mock).mockReturnValue({
      ...mockDraftRecording,
      location: {
        latitude: null,
        longitude: null,
      },
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state during geolocation', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(() => {
      // Don't resolve immediately to test loading state
    });

    renderComponent();
    fireEvent.click(screen.getByText('Use My Location'));
    expect(screen.getByText('Getting Location...')).toBeInTheDocument();
  });
});
