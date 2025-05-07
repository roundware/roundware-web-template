import { renderHook, act } from '@testing-library/react-hooks';
import { useLoop } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop';

// Mock AudioContext and its methods
const mockConnect = jest.fn();
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockDisconnect = jest.fn();
const mockLinearRampToValueAtTime = jest.fn();

const mockBufferSource = {
  connect: mockConnect,
  start: mockStart,
  stop: mockStop,
  disconnect: mockDisconnect,
  loop: false,
  buffer: null,
};

const mockGain = {
  connect: mockConnect,
  gain: {
    value: 1,
    linearRampToValueAtTime: mockLinearRampToValueAtTime,
  },
};

const mockAudioContext = {
  createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
  createGain: jest.fn().mockReturnValue(mockGain),
  resume: jest.fn().mockResolvedValue(undefined),
  currentTime: 0,
  destination: {},
  decodeAudioData: jest.fn().mockImplementation((arrayBuffer, successCallback) => {
    const mockBuffer = {
      duration: 2,
      length: 88200,
      numberOfChannels: 2,
      sampleRate: 44100,
    };
    successCallback(mockBuffer);
    return Promise.resolve(mockBuffer);
  }),
};

// Mock AudioContext constructor
(global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

// Mock setInterval and clearInterval
let intervalCallback: Function | null = null;
const mockSetInterval = jest.fn((callback: Function, duration: number) => {
  intervalCallback = callback;
  return 123; // Return a dummy interval ID
});
const mockClearInterval = jest.fn();
(global as any).setInterval = mockSetInterval;
(global as any).clearInterval = mockClearInterval;

// Mock Date.now
const mockDateNow = jest.fn(() => 1000);
const realDateNow = Date.now;
Date.now = mockDateNow;

describe('useLoop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    intervalCallback = null;
  });

  afterEach(() => {
    jest.useRealTimers();
    Date.now = realDateNow;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLoop());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isStarted).toBe(false);
    expect(result.current.mode).toBe('idle');
    expect(result.current.audioContext.current).toBeDefined();
  });

  it('should start the loop in playing-speaker mode', async () => {
    const { result } = renderHook(() => useLoop());

    // Set up initial conditions
    act(() => {
      result.current.setIsLoading(false);
      result.current.speakerAudioBuffer.current = {
        duration: 2,
        length: 88200,
        numberOfChannels: 2,
        sampleRate: 44100,
      } as AudioBuffer;
    });

    // Start the loop
    await act(async () => {
      await result.current.start('playing-speaker');
    });

    // Wait for the mode change timeout
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
    expect(result.current.isStarted).toBe(true);
    expect(result.current.mode).toBe('playing-speaker');
  });

  it('should stop the loop', async () => {
    const { result } = renderHook(() => useLoop());

    // Set up and start the loop
    act(() => {
      result.current.setIsLoading(false);
      result.current.speakerAudioBuffer.current = {
        duration: 2,
        length: 88200,
        numberOfChannels: 2,
        sampleRate: 44100,
      } as AudioBuffer;
    });

    await act(async () => {
      await result.current.start('playing-speaker');
    });

    // Wait for the mode change timeout
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Stop the loop
    act(() => {
      result.current.stop();
    });

    expect(mockBufferSource.stop).toHaveBeenCalled();
    expect(mockBufferSource.disconnect).toHaveBeenCalled();
  });

  it('should handle recorded audio playback', async () => {
    const { result } = renderHook(() => useLoop());

    // Set up initial conditions
    act(() => {
      result.current.setIsLoading(false);
      result.current.speakerAudioBuffer.current = {
        duration: 2,
        length: 88200,
        numberOfChannels: 2,
        sampleRate: 44100,
      } as AudioBuffer;
    });

    // Create a mock Blob with arrayBuffer method
    const mockArrayBuffer = new ArrayBuffer(8);
    const mockBlob = {
      arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      size: 8,
      type: 'audio/wav',
      slice: jest.fn(),
      stream: jest.fn(),
      text: jest.fn(),
    };

    // Start with recorded audio
    await act(async () => {
      await result.current.start('recording-playback', mockBlob as unknown as Blob);
    });

    // Wait for the mode change timeout
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    expect(result.current.mode).toBe('recording-playback');
  });

  it('should calculate next loop point', async () => {
    const { result } = renderHook(() => useLoop());

    // Set up initial conditions
    act(() => {
      result.current.setIsLoading(false);
      result.current.speakerAudioBuffer.current = {
        duration: 2,
        length: 88200,
        numberOfChannels: 2,
        sampleRate: 44100,
      } as AudioBuffer;
    });

    // Start the loop
    await act(async () => {
      await result.current.start('playing-speaker');
    });

    // Wait for the mode change timeout
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(result.current.nextLoopPointAt.current).not.toBeNull();
    
    // Fast forward 2 seconds (duration of the buffer)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // The interval should have updated the next loop point
    expect(result.current.nextLoopPointAt.current).not.toBeNull();
  });

  it('should not start if still loading', async () => {
    const { result } = renderHook(() => useLoop());

    await act(async () => {
      await result.current.start('playing-speaker');
    });

    expect(mockAudioContext.resume).not.toHaveBeenCalled();
    expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled();
    expect(result.current.isStarted).toBe(false);
  });

  
});
