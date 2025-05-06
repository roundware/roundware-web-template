import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlaybackInfoOverlay from '@/components/ListenPage/PlaybackInfoOverlay';
import { useRoundware } from '@/hooks';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from '@/styles';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Fade: ({ children, in: visible }: { children: React.ReactNode; in: boolean }) => (
    <div data-testid="fade" data-visible={visible ? 'true' : 'false'}>
      {visible ? children : null}
    </div>
  ),
  Paper: ({ children, sx }: { children: React.ReactNode; sx: any }) => (
    <div data-testid="paper">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Typography: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <span data-testid="typography">{children}</span>
  ),
  Link: ({ children, href, target, rel }: { children: React.ReactNode; href: string; target: string; rel: string }) => (
    <a data-testid="link" href={href} target={target} rel={rel}>
      {children}
    </a>
  ),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the playbackInfo data
jest.mock('../../playbackInfo.json', () => [
  {
    id: 1,
    startTime: 5,
    stopTime: 10,
    displayText: 'Test Info 1',
    url: 'https://test1.com',
  },
  {
    id: 2,
    startTime: 15,
    stopTime: 20,
    displayText: 'Test Info 2',
    url: 'https://test2.com',
  },
]);

// Mock CustomMapControl component
jest.mock('@/components/ListenPage/Map/CustomControl', () => {
  return function MockCustomMapControl({ children }: { children: React.ReactNode }) {
    return <div data-testid="custom-map-control">{children}</div>;
  };
});

// Mock Google Maps
jest.mock('@react-google-maps/api', () => ({
  ...jest.requireActual('@react-google-maps/api'),
  useGoogleMap: () => ({
    controls: {
      [1]: {
        push: jest.fn(),
      },
    },
  }),
}));

// Mock global google object
global.google = {
  maps: {
    ControlPosition: {
      TOP_CENTER: 1,
    },
  },
} as any;

const mockRoundware = {
  mixer: {
    playing: true,
    playlist: {
      elapsedTimeMs: 0,
    },
  },
};

// Mock the useRoundware hook implementation
const mockUseRoundware = useRoundware as jest.Mock;
mockUseRoundware.mockReturnValue({ roundware: mockRoundware });

// Mock OpenInNew icon
jest.mock('@mui/icons-material/OpenInNew', () => () => <span data-testid="open-in-new">↗</span>);

describe('PlaybackInfoOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRoundware.mixer.playing = true;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should not display any info when not playing', () => {
    mockRoundware.mixer.playing = false;
    render(<PlaybackInfoOverlay />);
    expect(screen.getByTestId('fade')).toHaveAttribute('data-visible', 'false');
  });

  it('should display info when elapsed time is within range', () => {
    mockRoundware.mixer.playlist.elapsedTimeMs = 6000; // 6 seconds
    render(<PlaybackInfoOverlay />);
    expect(screen.getByTestId('fade')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByText('Test Info 1')).toBeInTheDocument();
  });

  it('should hide info after stopTime', async () => {
    mockRoundware.mixer.playlist.elapsedTimeMs = 6000; // 6 seconds
    render(<PlaybackInfoOverlay />);
    expect(screen.getByText('Test Info 1')).toBeInTheDocument();

    // Fast forward to after stopTime
    act(() => {
      jest.advanceTimersByTime(5000); // Move to 11 seconds
    });

    expect(screen.getByTestId('fade')).toHaveAttribute('data-visible', 'false');
  });

  it('should schedule future info display', () => {
    mockRoundware.mixer.playlist.elapsedTimeMs = 0;
    render(<PlaybackInfoOverlay />);
    expect(screen.getByTestId('fade')).toHaveAttribute('data-visible', 'false');

    // Fast forward to startTime
    act(() => {
      jest.advanceTimersByTime(5000); // Move to 5 seconds
    });

    expect(screen.getByTestId('fade')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByText('Test Info 1')).toBeInTheDocument();
  });

  it('should clear timeouts when playback stops', () => {
    mockRoundware.mixer.playlist.elapsedTimeMs = 0;
    const { rerender } = render(<PlaybackInfoOverlay />);

    // Fast forward to show info
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Stop playback and trigger cleanup
    mockRoundware.mixer.playing = false;
    rerender(<PlaybackInfoOverlay />);

    // Fast forward again
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Info should not be visible after cleanup
    expect(screen.getByTestId('fade')).toHaveAttribute('data-visible', 'false');
  });

  it('should render link with correct URL', () => {
    mockRoundware.mixer.playlist.elapsedTimeMs = 6000;
    render(<PlaybackInfoOverlay />);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', 'https://test1.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('should handle multiple info items correctly', () => {
    mockRoundware.mixer.playlist.elapsedTimeMs = 16000; // 16 seconds
    render(<PlaybackInfoOverlay />);
    expect(screen.getByText('Test Info 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Info 1')).not.toBeInTheDocument();
  });
});