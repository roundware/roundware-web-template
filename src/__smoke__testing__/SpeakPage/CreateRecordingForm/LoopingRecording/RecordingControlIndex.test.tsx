import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Router, Prompt } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import RecordingControls from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/index';
import { useLoopContext } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

// Mock the context
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext', () => ({
  useLoopContext: jest.fn(),
}));

// Mock the hooks and components
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/hooks', () => ({
  useDimensions: () => ({
    svgSize: 300,
    circleSize: 250,
    strokeWidth: 10,
  }),
}));

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/AnimatedCircle', () => {
  return function MockAnimatedCircle() {
    return <div data-testid="animated-circle" />;
  };
});

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/ControlButton', () => {
  return function MockControlButton({ onPlayClick, onRecordClick }: any) {
    return (
      <div data-testid="control-button">
        <button onClick={onPlayClick}>Play</button>
        <button onClick={onRecordClick}>Record</button>
      </div>
    );
  };
});

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/StepIndicator', () => {
  return function MockStepIndicator() {
    return <div data-testid="step-indicator" />;
  };
});

// Mock UserConfirmation
jest.mock('../../../../components/UserConfirmation', () => ({
  __esModule: true,
  default: (message: string, callback: (result: boolean) => void) => {
    const parsedMessage = JSON.parse(message);
    callback(false); // Simulate clicking "Keep Recording"
  },
}));

// Mock react-router-dom's Prompt component
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Prompt: jest.fn(() => null),
  };
});

interface MockLoop {
  mode: string;
  start: jest.Mock;
  startedAtTime: number;
}

interface MockRecorder {
  scheduleRecording: jest.Mock;
  isPermissionDenied: boolean;
  setIsPermissionDenied: jest.Mock;
  recordedAudioBlob: Blob | null;
}

interface MockSubmission {
  status: string;
}

interface MockSpeaker {
  duration: number | null;
}

interface MockProps {
  loop?: Partial<MockLoop>;
  recorder?: Partial<MockRecorder>;
  submission?: Partial<MockSubmission>;
  speaker?: Partial<MockSpeaker>;
}

describe('RecordingControls Component', () => {
  const mockLoop: MockLoop = {
    mode: 'idle',
    start: jest.fn(),
    startedAtTime: 0,
  };

  const mockRecorder: MockRecorder = {
    scheduleRecording: jest.fn(),
    isPermissionDenied: false,
    setIsPermissionDenied: jest.fn(),
    recordedAudioBlob: null,
  };

  const mockSubmission: MockSubmission = {
    status: 'idle',
  };

  const mockSpeaker: MockSpeaker = {
    duration: 1000,
  };

  const renderComponent = (props: MockProps = {}) => {
    (useLoopContext as jest.Mock).mockReturnValue({
      loop: { ...mockLoop, ...props.loop },
      recorder: { ...mockRecorder, ...props.recorder },
      submission: { ...mockSubmission, ...props.submission },
      speaker: { ...mockSpeaker, ...props.speaker },
    });

    return render(
      <MemoryRouter>
        <RecordingControls />
      </MemoryRouter>
    );
  };

  const renderWithHistory = (props: MockProps = {}) => {
    const history = createMemoryHistory();
    (useLoopContext as jest.Mock).mockReturnValue({
      loop: { ...mockLoop, ...props.loop },
      recorder: { ...mockRecorder, ...props.recorder },
      submission: { ...mockSubmission, ...props.submission },
      speaker: { ...mockSpeaker, ...props.speaker },
    });

    return {
      history,
      ...render(
        <Router history={history}>
          <RecordingControls />
        </Router>
      ),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when speaker duration is not available', () => {
    const { container } = renderComponent({ speaker: { duration: null } });
    expect(container.firstChild).toBeNull();
  });

  it('renders all main components', () => {
    renderComponent();
    
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('animated-circle')).toBeInTheDocument();
    expect(screen.getByTestId('control-button')).toBeInTheDocument();
  });

  it('displays correct instruction text based on loop mode', () => {
    // Test idle mode
    renderComponent();
    expect(screen.getByText('Press play to start rehearsing')).toBeInTheDocument();

    // Test playing-speaker mode
    renderComponent({ loop: { mode: 'playing-speaker' } });
    expect(screen.getByText('Press record when ready to sing')).toBeInTheDocument();

    // Test waiting-to-record mode
    renderComponent({ loop: { mode: 'waiting-to-record' } });
    expect(screen.getByText('Get ready')).toBeInTheDocument();
  });

  it('handles play button click', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Play'));
    expect(mockLoop.start).toHaveBeenCalledWith('playing-speaker');
  });

  it('handles record button click', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Record'));
    expect(mockRecorder.scheduleRecording).toHaveBeenCalled();
  });

  it('shows permission denied dialog when permission is denied', () => {
    renderComponent({ recorder: { isPermissionDenied: true } });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles permission denied dialog close', () => {
    renderComponent({ recorder: { isPermissionDenied: true } });
    const watchVideosButton = screen.getByRole('button', { name: /watch videos/i });
    fireEvent.click(watchVideosButton);
    expect(mockOpen).toHaveBeenCalledWith('https://roundware.org/', '_blank');
  });

  it('shows prompt when recording is submitted', () => {
    (useLoopContext as jest.Mock).mockReturnValue({
      loop: mockLoop,
      recorder: { ...mockRecorder, recordedAudioBlob: new Blob() },
      submission: { ...mockSubmission, status: 'submitted' },
      speaker: mockSpeaker,
    });

    render(
      <MemoryRouter>
        <RecordingControls />
      </MemoryRouter>
    );

    // Check if Prompt is rendered with correct props
    expect(Prompt).toHaveBeenCalledWith(
      expect.objectContaining({
        when: true,
        message: JSON.stringify({
          message: 'Are you sure you want to leave without submitting your recording? If you do, your recording will be deleted.',
          stay: 'Keep Recording',
          leave: 'Delete Recording',
        }),
      }),
      expect.any(Object)
    );
  });
});
