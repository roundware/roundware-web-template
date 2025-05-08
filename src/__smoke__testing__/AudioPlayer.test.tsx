import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioPlayer from '../components/AudioPlayer';

const mockWaveSurfer = {
  load: jest.fn(),
  on: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  destroy: jest.fn()
};

// Mock WaveSurfer
jest.mock('wavesurfer-react', () => ({
  WaveSurfer: ({ children, onMount }: any) => {
    React.useEffect(() => {
      onMount(mockWaveSurfer);
    }, [onMount]);
    return <div data-testid="wave-surfer">{children}</div>;
  },
  WaveForm: () => <div data-testid="wave-form" />
}));

describe('AudioPlayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no src is provided', () => {
    const { container } = render(<AudioPlayer src="" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders with default small size', () => {
    render(<AudioPlayer src="test.mp3" />);
    const container = screen.getByTestId('wave-surfer').parentElement;
    expect(container).toHaveStyle({ width: '280px', minHeight: '160px' });
  });

  it('renders with medium size', () => {
    render(<AudioPlayer src="test.mp3" size="medium" />);
    const container = screen.getByTestId('wave-surfer').parentElement;
    expect(container).toHaveStyle({ width: '360px', minHeight: '160px' });
  });

  it('shows loading progress initially', () => {
    render(<AudioPlayer src="test.mp3" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows play button after loading', () => {
    render(<AudioPlayer src="test.mp3" />);
    
    // Simulate loading completion
    const readyCallback = mockWaveSurfer.on.mock.calls.find((call: any) => call[0] === 'ready')?.[1];
    if (readyCallback) {
      act(() => {
        readyCallback();
      });
    }

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('toggles play/pause state when button is clicked', () => {
    render(<AudioPlayer src="test.mp3" />);
    
    // Simulate loading completion
    const readyCallback = mockWaveSurfer.on.mock.calls.find((call: any) => call[0] === 'ready')?.[1];
    if (readyCallback) {
      act(() => {
        readyCallback();
      });
    }

    const playButton = screen.getByRole('button');
    
    // Initial state - Play
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    
    // Click to play
    fireEvent.click(playButton);
    expect(mockWaveSurfer.play).toHaveBeenCalled();
    expect(screen.getByTestId('PauseIcon')).toBeInTheDocument();
    
    // Click to pause
    fireEvent.click(playButton);
    expect(mockWaveSurfer.pause).toHaveBeenCalled();
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
  });

  it('updates progress during loading', () => {
    render(<AudioPlayer src="test.mp3" />);
    
    const loadingCallback = mockWaveSurfer.on.mock.calls.find((call: any) => call[0] === 'loading')?.[1];
    if (loadingCallback) {
      act(() => {
        loadingCallback(50);
      });
    }

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('cleans up WaveSurfer instance on unmount', () => {
    const { unmount } = render(<AudioPlayer src="test.mp3" />);
    unmount();
    expect(mockWaveSurfer.destroy).toHaveBeenCalled();
  });
});
