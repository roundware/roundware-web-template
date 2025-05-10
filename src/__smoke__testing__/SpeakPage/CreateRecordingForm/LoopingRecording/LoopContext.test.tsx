import { render, screen } from '@testing-library/react';
import { useLoopContext, LoopProvider } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext';
import { useLoopingRecording } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoopingRecording';

// Mock AudioContext
class MockAudioContext {
  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      loop: false
    };
  }
  createGain() {
    return {
      gain: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }
  createDelay() {
    return {
      delayTime: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }
  createDynamicsCompressor() {
    return {
      threshold: { value: 0 },
      knee: { value: 0 },
      ratio: { value: 0 },
      attack: { value: 0 },
      release: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }
  createConvolver() {
    return {
      buffer: null,
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }
  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(0),
      numberOfChannels: 1,
      length: 0,
      sampleRate: 44100
    };
  }
  decodeAudioData() {
    return Promise.resolve({
      duration: 1,
      numberOfChannels: 1,
      length: 44100,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(44100)
    });
  }
  destination: any = {};
  currentTime: number = 0;
  sampleRate: number = 44100;
}

// Mock the useLoopingRecording hook
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoopingRecording');

describe('LoopContext', () => {
  const mockLoopValue = {
    speaker: {
      baseSpeakers: [],
      duration: 10,
      isReady: true
    },
    recorder: {
      recordedAudioBlob: null,
      isPermissionDenied: false,
      setIsPermissionDenied: jest.fn(),
      scheduleRecording: jest.fn(),
      stopRecording: jest.fn(),
      checkMicrophonePermission: jest.fn(),
      startingRecordingInSeconds: 0,
      recorderStream: undefined
    },
    location: {
      lat: 0,
      lng: 0
    },
    submission: {
      status: 'idle'
    },
    loop: {
      isLoading: false,
      setIsLoading: jest.fn(),
      isStarted: false,
      mode: 'idle',
      setMode: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      nextLoopPointAt: { current: null },
      speakerAudioBuffer: { current: null },
      audioContext: { current: new MockAudioContext() },
      startedAtTime: { current: null }
    }
  };

  beforeEach(() => {
    (useLoopingRecording as jest.Mock).mockReturnValue(mockLoopValue);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should provide loop context to children', () => {
    const TestComponent = () => {
      const context = useLoopContext();
      return <div data-testid="test-component">{context.loop.mode}</div>;
    };

    render(
      <LoopProvider>
        <TestComponent />
      </LoopProvider>
    );

    expect(screen.getByTestId('test-component')).toHaveTextContent('idle');
  });

  it('should throw error when useLoopContext is used outside of LoopProvider', () => {
    const TestComponent = () => {
      useLoopContext();
      return null;
    };

    // Suppress console.error for this test
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLoopContext must be used within a LoopProvider');

    // Restore console.error
    console.error = consoleError;
  });

  it('should render children with provided context', () => {
    const TestComponent = () => {
      const context = useLoopContext();
      return (
        <div>
          <button onClick={() => context.loop.start('playing-speaker')}>Start Loop</button>
          <button onClick={context.recorder.scheduleRecording}>Record</button>
        </div>
      );
    };

    render(
      <LoopProvider>
        <TestComponent />
      </LoopProvider>
    );

    expect(screen.getByText('Start Loop')).toBeInTheDocument();
    expect(screen.getByText('Record')).toBeInTheDocument();
  });
});
