import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import SpeakerReplayButton from '@/components/ListenPage/Map/Speakers/SpeakerReplayButton';
import { useRoundware } from '@/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(() => ({
    roundware: {
      mixer: {
        speakerEngine: {
          speakers: [
            {
              request: {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
              },
            },
            {
              request: {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
              },
            },
          ],
        },
      },
    },
  })),
}));

// Create a test theme
const testTheme = createTheme();

describe('SpeakerReplayButton', () => {
  const mockSpeakers = [
    {
      request: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    },
    {
      request: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset the useRoundware mock
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: mockSpeakers,
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );
  });

  it('initially does not show the replay button', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );
    
    const replayButton = screen.queryByRole('button', { name: /replay/i });
    expect(replayButton).not.toBeInTheDocument();
  });

  it('sets up event listeners for each speaker', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    mockSpeakers.forEach(speaker => {
      expect(speaker.request.addEventListener).toHaveBeenCalledWith(
        'ended',
        expect.any(Function)
      );
    });
  });

  it('shows replay button when all speakers have ended', async () => {
    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    // Simulate all speakers ending
    await act(async () => {
      mockSpeakers.forEach(speaker => {
        const endedCallback = speaker.request.addEventListener.mock.calls.find(
          call => call[0] === 'ended'
        )?.[1];
        if (endedCallback) {
          endedCallback();
        }
      });
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    const replayButton = screen.getByRole('button', { name: /replay/i });
    expect(replayButton).toBeInTheDocument();
  });

  it('hides replay button when clicked', async () => {
    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    // First show the button by simulating all speakers ending
    await act(async () => {
      mockSpeakers.forEach(speaker => {
        const endedCallback = speaker.request.addEventListener.mock.calls.find(
          call => call[0] === 'ended'
        )?.[1];
        if (endedCallback) {
          endedCallback();
        }
      });
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    // Click the replay button
    const replayButton = screen.getByRole('button', { name: /replay/i });
    await act(async () => {
      replayButton.click();
    });

    // Wait for the animation to complete
    await act(async () => {
      jest.runAllTimers();
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    // Button should be hidden
    expect(screen.queryByRole('button', { name: /replay/i })).not.toBeInTheDocument();
  });

  it('handles null speakerEngine gracefully', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: null,
        },
      },
    });

    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    // Component should render without crashing
    expect(screen.queryByRole('button', { name: /replay/i })).not.toBeInTheDocument();
  });

  it('handles empty speakers array gracefully', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: [],
          },
        },
      },
    });

    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    // Component should render without crashing
    expect(screen.queryByRole('button', { name: /replay/i })).not.toBeInTheDocument();
  });

  // Note: The component currently doesn't clean up event listeners on unmount
  // This is a potential memory leak that should be fixed in the component
  it('does not clean up event listeners on unmount', () => {
    const { unmount } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerReplayButton />
      </ThemeProvider>
    );

    unmount();

    // Verify that removeEventListener was never called
    mockSpeakers.forEach(speaker => {
      expect(speaker.request.removeEventListener).not.toHaveBeenCalled();
    });
  });
}); 