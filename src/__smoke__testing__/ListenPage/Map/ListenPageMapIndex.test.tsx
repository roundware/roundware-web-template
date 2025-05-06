import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useURLSync } from '@/context/URLContext';
import { GeoListenMode } from 'roundware-web-framework';

// Mock the complex dependencies
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }: any) => <div data-testid="google-map">{children}</div>,
  LoadScript: ({ children }: any) => <div data-testid="load-script">{children}</div>,
  Marker: () => <div data-testid="marker" />,
}));

jest.mock('../../../components/ListenPage/Map/AssetLayer', () => () => <div data-testid="asset-layer" />);
jest.mock('../../../components/ListenPage/Map/AssetLoadingOverlay', () => () => <div data-testid="asset-loading" />);
jest.mock('../../../components/ListenPage/Map/RangeCircleOverlay', () => () => <div data-testid="range-circle" />);
jest.mock('../../../components/ListenPage/Map/WalkingModeButton', () => () => <div data-testid="walking-mode" />);
jest.mock('../../../components/ListenPage/Map/Speakers/SpeakerPolygons', () => () => <div data-testid="speaker-polygons" />);
jest.mock('../../../components/ListenPage/Map/Speakers/SpeakerImages', () => () => <div data-testid="speaker-images" />);
jest.mock('../../../components/ListenPage/Map/Speakers/SpeakerLoadingIndicator', () => () => <div data-testid="speaker-loading" />);
jest.mock('../../../components/ListenPage/Map/Speakers/SpeakerReplayButton', () => () => <div data-testid="speaker-replay" />);
jest.mock('../../../components/App/ShareDialog', () => () => <div data-testid="share-dialog" />);
jest.mock('../../../components/ListenPage/Map/ResetButton', () => () => <div data-testid="reset-button" />);
jest.mock('../../../components/ListenPage/PlaybackInfoOverlay', () => () => <div data-testid="playback-info" />);
jest.mock('../../../components/ListenPage/Map/OutOfRangeMessage', () => () => <div data-testid="out-of-range" />);
jest.mock('../../../components/ListenPage/Map/AddLoopVoiceButton', () => () => <div data-testid="add-loop-voice" />);

// Mock the hooks
interface MockMixer {
  toggle: jest.Mock;
  playlist: any[] | null;
  updateParams: jest.Mock;
}

interface MockRoundware {
  project: {
    location: {
      latitude: number;
      longitude: number;
    };
  } | null;
  updateLocation: jest.Mock;
  getMapBounds: jest.Mock;
  mixer: MockMixer | null;
  uiConfig: {
    listen: Array<{
      display_items: Array<{ tag_id: number }>;
    }>;
  };
  activateMixer: jest.Mock;
  listenerLocation: { latitude: number; longitude: number };
}

const mockRoundware: MockRoundware = {
  project: {
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  },
  updateLocation: jest.fn(),
  getMapBounds: jest.fn().mockReturnValue({
    southwest: { latitude: 40.7, longitude: -74.0 },
    northeast: { latitude: 40.8, longitude: -73.9 }
  }),
  mixer: null,
  uiConfig: {
    listen: [{
      display_items: [{ tag_id: 1 }]
    }]
  },
  activateMixer: jest.fn().mockResolvedValue(undefined),
  listenerLocation: { latitude: 40.7128, longitude: -74.0060 }
};

const mockForceUpdate = jest.fn();

const mockUseRoundware = jest.fn(() => ({
  roundware: mockRoundware,
  forceUpdate: mockForceUpdate
}));

jest.mock('../../../hooks', () => ({
  useRoundware: () => mockUseRoundware()
}));

jest.mock('@/context/URLContext', () => ({
  useURLSync: jest.fn(),
}));

// Import the component after mocks
import RoundwareMap from '../../../components/ListenPage/Map';

describe('RoundwareMap Component Smoke Tests', () => {
  const mockDeleteFromURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoundware.mockReturnValue({
      roundware: mockRoundware,
      forceUpdate: mockForceUpdate
    });
    (useURLSync as jest.Mock).mockReturnValue({ deleteFromURL: mockDeleteFromURL });
  });

  it('renders without crashing', () => {
    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    expect(screen.getByTestId('load-script')).toBeInTheDocument();
  });

  it('renders launch button when showLaunch is true', () => {
    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    expect(screen.getByText('LAUNCH')).toBeInTheDocument();
  });

  it('handles launch button click', async () => {
    const mockToggle = jest.fn();
    const mockUpdateParams = jest.fn();
    
    const mockMixer: MockMixer = {
      toggle: mockToggle,
      playlist: null,
      updateParams: mockUpdateParams
    };

    const mockRoundwareWithMixer: MockRoundware = {
      ...mockRoundware,
      activateMixer: jest.fn().mockImplementation(() => {
        (mockRoundwareWithMixer as any).mixer = mockMixer;
        return Promise.resolve();
      }),
      mixer: null
    };

    mockUseRoundware.mockReturnValue({
      roundware: mockRoundwareWithMixer,
      forceUpdate: mockForceUpdate
    });

    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    
    const launchButton = screen.getByText('LAUNCH');
    fireEvent.click(launchButton);

    // Wait for the state update and mixer activation
    await waitFor(() => {
      expect(mockRoundwareWithMixer.activateMixer).toHaveBeenCalledWith({ geoListenMode: GeoListenMode.MANUAL });
    });


  });

  it('renders map with correct initial props', () => {
    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('does not render when project is null', () => {
    const nullProjectMock = {
      ...mockRoundware,
      project: null as MockRoundware['project']
    };
    mockUseRoundware.mockReturnValueOnce({
      roundware: nullProjectMock,
      forceUpdate: mockForceUpdate
    });
    
    const { container } = render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all required components', () => {
    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    expect(screen.getByTestId('asset-layer')).toBeInTheDocument();
    expect(screen.getByTestId('asset-loading')).toBeInTheDocument();
    expect(screen.getByTestId('range-circle')).toBeInTheDocument();
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('handles launch button click and activates mixer', async () => {
    const mockToggle = jest.fn();
    const mockUpdateParams = jest.fn();
    
    const mockMixer: MockMixer = {
      toggle: mockToggle,
      playlist: null,
      updateParams: mockUpdateParams
    };

    const mockRoundwareWithMixer: MockRoundware = {
      ...mockRoundware,
      activateMixer: jest.fn().mockImplementation(() => {
        (mockRoundwareWithMixer as any).mixer = mockMixer;
        return Promise.resolve();
      }),
      mixer: null
    };

    mockUseRoundware.mockReturnValue({
      roundware: mockRoundwareWithMixer,
      forceUpdate: mockForceUpdate
    });

    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    
    const launchButton = screen.getByText('LAUNCH');
    fireEvent.click(launchButton);

    await waitFor(() => {
      expect(mockRoundwareWithMixer.activateMixer).toHaveBeenCalledWith({ geoListenMode: GeoListenMode.MANUAL });
      expect(mockUpdateParams).toHaveBeenCalledWith({
        listenerLocation: mockRoundwareWithMixer.listenerLocation,
        minDist: 0,
        maxDist: 0,
        recordingRadius: 0,
        listenTagIds: [1]
      });
      expect(mockToggle).toHaveBeenCalled();
      expect(mockForceUpdate).toHaveBeenCalled();
    });
  });

  it('handles launch button click with existing mixer', async () => {
    const mockToggle = jest.fn();
    const mockUpdateParams = jest.fn();
    
    const mockMixer: MockMixer = {
      toggle: mockToggle,
      playlist: [],
      updateParams: mockUpdateParams
    };

    const mockRoundwareWithMixer: MockRoundware = {
      ...mockRoundware,
      mixer: mockMixer
    };

    mockUseRoundware.mockReturnValue({
      roundware: mockRoundwareWithMixer,
      forceUpdate: mockForceUpdate
    });

    render(<RoundwareMap googleMapsApiKey="test-key" className="test-class" />);
    
    const launchButton = screen.getByText('LAUNCH');
    fireEvent.click(launchButton);

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalled();
      expect(mockForceUpdate).toHaveBeenCalled();
    });
  });
});
