import { render, screen, act, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeakerLoadingIndicator from '@/components/ListenPage/Map/Speakers/SpeakerLoadingIndicator';
import { useRoundware } from '@/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Create a test theme
const testTheme = createTheme({
  zIndex: {
    appBar: 1100,
  },
});

// Mock MUI components
jest.mock('@mui/material/Backdrop', () => {
  return ({ open, children, sx }: any) => {
    const style = typeof sx === 'function' ? sx(testTheme) : sx;
    return (
      <div data-testid="backdrop" data-open={open} style={style}>
        {children}
      </div>
    );
  };
});

jest.mock('@mui/material/LinearProgress', () => {
  return ({ value, variant }: any) => (
    <div data-testid="linear-progress" data-value={value} data-variant={variant} />
  );
});

jest.mock('@mui/material/Stack', () => {
  return ({ children, spacing, p }: any) => (
    <div data-testid="stack" data-spacing={spacing} data-p={p}>
      {children}
    </div>
  );
});

jest.mock('@mui/material/Typography', () => {
  return ({ variant, children }: any) => (
    <div data-testid="typography" data-variant={variant}>
      {children}
    </div>
  );
});

describe('SpeakerLoadingIndicator', () => {
  let mockEventListeners: { [key: string]: (event: any) => void } = {};
  const mockSpeakers = [
    {
      data: { id: 1 },
      request: {
        addEventListener: jest.fn((event, callback) => {
          mockEventListeners[`speaker1_${event}`] = callback;
        }),
        removeEventListener: jest.fn((event, callback) => {
          delete mockEventListeners[`speaker1_${event}`];
        }),
      },
    },
    {
      data: { id: 2 },
      request: {
        addEventListener: jest.fn((event, callback) => {
          mockEventListeners[`speaker2_${event}`] = callback;
        }),
        removeEventListener: jest.fn((event, callback) => {
          delete mockEventListeners[`speaker2_${event}`];
        }),
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventListeners = {};
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

  const renderWithLoadingState = (progress: number): RenderResult => {
    const result = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerLoadingIndicator />
      </ThemeProvider>
    );
    act(() => {
      mockEventListeners['speaker1_progress']?.({ loaded: progress, total: 100 });
    });
    return result;
  };

  it('renders without crashing', () => {
    const { unmount } = renderWithLoadingState(50);
    expect(screen.getByTestId('backdrop')).toBeInTheDocument();
    unmount();
  });

  it('does not render when all speakers are loaded', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerLoadingIndicator />
      </ThemeProvider>
    );
    expect(screen.queryByTestId('backdrop')).not.toBeInTheDocument();
  });

  it('renders loading indicators for each speaker', () => {
    const { unmount } = renderWithLoadingState(50);
    const progressBars = screen.getAllByTestId('linear-progress');
    expect(progressBars).toHaveLength(1);
    expect(progressBars[0]).toHaveAttribute('data-value', '50');
    unmount();
  });

  it('sorts speakers by ID in descending order', () => {
    const { unmount } = renderWithLoadingState(30);
    act(() => {
      mockEventListeners['speaker2_progress']?.({ loaded: 70, total: 100 });
    });
    
    const progressBars = screen.getAllByTestId('linear-progress');
    expect(progressBars[0]).toHaveAttribute('data-value', '70'); // Speaker 2 should be first
    expect(progressBars[1]).toHaveAttribute('data-value', '30'); // Speaker 1 should be second
    unmount();
  });

  it('removes completed speakers from loading state', () => {
    const { unmount } = renderWithLoadingState(100);
    const progressBars = screen.queryAllByTestId('linear-progress');
    expect(progressBars).toHaveLength(0);
    unmount();
  });

  it('updates progress for individual speakers', () => {
    const { unmount } = renderWithLoadingState(30);
    let progressBars = screen.getAllByTestId('linear-progress');
    expect(progressBars[0]).toHaveAttribute('data-value', '30');

    act(() => {
      mockEventListeners['speaker1_progress']?.({ loaded: 60, total: 100 });
    });

    progressBars = screen.getAllByTestId('linear-progress');
    expect(progressBars[0]).toHaveAttribute('data-value', '60');
    unmount();
  });

  it('handles multiple speakers loading simultaneously', () => {
    const { unmount } = renderWithLoadingState(30);
    act(() => {
      mockEventListeners['speaker2_progress']?.({ loaded: 70, total: 100 });
    });
    
    const progressBars = screen.getAllByTestId('linear-progress');
    expect(progressBars).toHaveLength(2);
    expect(progressBars[0]).toHaveAttribute('data-value', '70');
    expect(progressBars[1]).toHaveAttribute('data-value', '30');
    unmount();
  });

  

  it('displays correct loading message', () => {
    const { unmount } = renderWithLoadingState(50);
    const typography = screen.getByTestId('typography');
    expect(typography.textContent).toBe('Downloading awesome music... Please wait');
    unmount();
  });

  it('applies correct z-index to backdrop', () => {
    const { unmount } = renderWithLoadingState(50);
    const backdrop = screen.getByTestId('backdrop');
    expect(backdrop).toHaveStyle({ zIndex: 1101 }); // appBar + 1
    unmount();
  });
}); 