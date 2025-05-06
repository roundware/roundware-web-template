import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoundwareMixerControl from '@/components/ListenPage/RoundwareMixerControl';
import { useRoundware } from '@/hooks';
import { GeoListenMode } from 'roundware-web-framework/dist/index';
import finalConfig from '@/config';

// Extend global type to include _roundwareSpeakerStartedAt
declare global {
  var _roundwareSpeakerStartedAt: Date | undefined;
}

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDisabled(): R;
    }
  }
}

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
    <button data-testid="play-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  IconButton: ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
    <button 
      data-testid="icon-button" 
      onClick={onClick} 
      disabled={disabled ? true : undefined}
    >
      {children}
    </button>
  ),
  Snackbar: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    <div data-testid="snackbar" data-open={open}>
      {children}
    </div>
  ),
  Alert: ({ children, severity }: { children: React.ReactNode; severity: string }) => (
    <div data-testid="alert" data-severity={severity}>
      {children}
    </div>
  ),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material/VolumeUp', () => () => <span data-testid="volume-up">🔊</span>);
jest.mock('@mui/icons-material/VolumeOff', () => () => <span data-testid="volume-off">🔇</span>);
jest.mock('@mui/icons-material/Replay', () => () => <span data-testid="replay-icon">↺</span>);

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock finalConfig
jest.mock('@/config', () => ({
  ui: {
    listenTransport: {
      includeSkipBackButton: true,
      includeSkipForwardButton: true,
    },
  },
  listen: {
    skipDuration: 5,
  },
}));

describe('RoundwareMixerControl', () => {
  const mockRoundware = {
    mixer: {
      playing: false,
      playlist: null as any,
      toggle: jest.fn(),
      updateParams: jest.fn(),
      speakerEngine: {
        speakers: [
          {
            player: {
              audio: {
                currentTime: 0,
                duration: 100,
              },
            },
          },
        ],
      },
    },
    uiConfig: {
      listen: [
        {
          display_items: [{ tag_id: 1 }, { tag_id: 2 }],
        },
      ],
    },
    listenerLocation: { lat: 0, lng: 0 },
    activateMixer: jest.fn().mockResolvedValue(undefined),
  };

  const mockUseRoundware = useRoundware as jest.Mock;
  const mockForceUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoundware.mockReturnValue({ roundware: mockRoundware, forceUpdate: mockForceUpdate });
    // Reset global state
    global._roundwareSpeakerStartedAt = undefined;
  });

  it('should render play button with volume off icon when not playing', () => {
    render(<RoundwareMixerControl />);
    const playButton = screen.getByRole('button', { name: /🔇/ });
    expect(playButton).toBeInTheDocument();
    expect(screen.getByTestId('volume-off')).toBeInTheDocument();
  });

  it('should render play button with volume up icon when playing', () => {
    mockRoundware.mixer.playing = true;
    render(<RoundwareMixerControl />);
    const playButton = screen.getByRole('button', { name: /🔊/ });
    expect(playButton).toBeInTheDocument();
    expect(screen.getByTestId('volume-up')).toBeInTheDocument();
  });

  it('should initialize mixer on mount', async () => {
    render(<RoundwareMixerControl />);
    
    expect(mockRoundware.activateMixer).toHaveBeenCalledWith({
      geoListenMode: GeoListenMode.MANUAL,
    });

    // Wait for the promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRoundware.mixer.updateParams).toHaveBeenCalledWith({
      listenerLocation: mockRoundware.listenerLocation,
      minDist: 0,
      maxDist: 0,
      recordingRadius: 0,
      listenTagIds: [1, 2],
    });
  });

  it('should toggle playback when play button is clicked', () => {
    mockRoundware.mixer.playlist = {}; // Simulate existing playlist
    render(<RoundwareMixerControl />);
    
    const playButton = screen.getByRole('button', { name: /🔊|🔇/ });
    fireEvent.click(playButton);
    
    expect(mockRoundware.mixer.toggle).toHaveBeenCalled();
    expect(mockForceUpdate).toHaveBeenCalled();
  });

  it('should initialize mixer and start playback when play button is clicked without playlist', async () => {
    render(<RoundwareMixerControl />);
    
    const playButton = screen.getByRole('button', { name: /🔊|🔇/ });
    fireEvent.click(playButton);
    
    expect(mockRoundware.activateMixer).toHaveBeenCalledWith({
      geoListenMode: GeoListenMode.MANUAL,
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRoundware.mixer.updateParams).toHaveBeenCalled();
    expect(mockRoundware.mixer.toggle).toHaveBeenCalled();
    expect(mockForceUpdate).toHaveBeenCalled();
  });

  it('should seek backward when skip back button is clicked', () => {
    mockRoundware.mixer.playing = true;
    render(<RoundwareMixerControl />);
    
    const skipButtons = screen.getAllByRole('button', { name: /↺/ });
    fireEvent.click(skipButtons[0]);
    
    expect(mockRoundware.mixer.speakerEngine.speakers[0].player.audio.currentTime).toBe(0);
  });

  it('should seek forward when skip forward button is clicked', () => {
    mockRoundware.mixer.playing = true;
    render(<RoundwareMixerControl />);
    
    const skipButtons = screen.getAllByRole('button', { name: /↺/ });
    fireEvent.click(skipButtons[1]);
    
    expect(mockRoundware.mixer.speakerEngine.speakers[0].player.audio.currentTime).toBe(5);
  });

  it('should not allow seeking when not playing', () => {
    mockRoundware.mixer.playing = false;
    render(<RoundwareMixerControl />);
    
    const skipButtons = screen.getAllByRole('button', { name: /↺/ });
    skipButtons.forEach(button => {
      expect(button).toHaveAttribute('disabled');
    });
  });

  it('should update global speaker start time when seeking', () => {
    mockRoundware.mixer.playing = true;
    const startTime = new Date();
    global._roundwareSpeakerStartedAt = startTime;
    
    render(<RoundwareMixerControl />);
    
    const skipButtons = screen.getAllByRole('button', { name: /↺/ });
    fireEvent.click(skipButtons[1]);
    
    expect(global._roundwareSpeakerStartedAt).not.toEqual(startTime);
  });

  it('should clean up mixer on unmount', () => {
    const { unmount } = render(<RoundwareMixerControl />);
    unmount();
    
    expect(mockRoundware.mixer.toggle).toHaveBeenCalledWith(false);
  });
});
