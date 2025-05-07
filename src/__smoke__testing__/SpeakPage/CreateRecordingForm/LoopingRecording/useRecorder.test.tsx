import { renderHook, act } from '@testing-library/react-hooks';
import { useRecorder } from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/useRecorder';
import { useLoop } from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop';

// Mock the useLoop hook
jest.mock('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop', () => ({
  useLoop: jest.fn(),
}));

// Mock the audio context and related functions
const mockAudioContext = {
  decodeAudioData: jest.fn().mockImplementation((arrayBuffer) => Promise.resolve({
    duration: 4,
    getChannelData: () => new Float32Array(100),
    numberOfChannels: 1,
    sampleRate: 44100,
    length: 44100 * 4,
  })),
  createBuffer: jest.fn().mockImplementation((channels, length, sampleRate) => ({
    duration: length / sampleRate,
    getChannelData: () => new Float32Array(length),
    copyToChannel: jest.fn(),
    numberOfChannels: channels,
    sampleRate,
    length,
  })),
};

const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  state: 'inactive',
  ondataavailable: null as ((event: BlobEvent) => void) | null,
  onstop: null as (() => void) | null,
  onstart: null as (() => void) | null,
};

// Mock the MediaRecorder constructor
const MockMediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
(MockMediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);
global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock Blob
const mockArrayBuffer = new ArrayBuffer(8);
global.Blob = class MockBlob {
  size: number;
  type: string;
  constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
    this.size = 8;
    this.type = options?.type || '';
  }
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(mockArrayBuffer);
  }
} as any;

describe('useRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock useLoop implementation
    (useLoop as jest.Mock).mockReturnValue({
      setMode: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      audioContext: { current: mockAudioContext },
      nextLoopPointAt: { current: Date.now() + 1000 },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    expect(result.current.recordedAudioBlob).toBeNull();
    expect(result.current.isPermissionDenied).toBeFalsy();
    expect(result.current.startingRecordingInSeconds).toBe(0);
  });

  it('should handle microphone permission check successfully', async () => {
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn(), readyState: 'live' }],
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    const hasPermission = await result.current.checkMicrophonePermission();
    expect(hasPermission).toBe(true);
    expect(result.current.isPermissionDenied).toBe(false);
  });

  it('should handle microphone permission denial', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    const hasPermission = await result.current.checkMicrophonePermission();
    expect(hasPermission).toBe(false);
    expect(result.current.isPermissionDenied).toBe(true);
  });

  it('should schedule recording correctly', async () => {
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn(), readyState: 'live' }],
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    await act(async () => {
      await result.current.scheduleRecording();
    });

    expect(result.current.startingRecordingInSeconds).toBeGreaterThan(0);
  });

  it('should handle recording data available event', async () => {
    const mockBlob = new Blob(['test'], { type: 'audio/wav' });
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    await act(async () => {
      await result.current.scheduleRecording();
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      if (mockMediaRecorder.ondataavailable) {
        mockMediaRecorder.ondataavailable({ data: mockBlob } as BlobEvent);
      }
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(mockAudioContext.decodeAudioData).toHaveBeenCalledWith(mockArrayBuffer);
  });

  it('should handle recording errors', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Recording failed'));

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    await act(async () => {
      await result.current.scheduleRecording();
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isPermissionDenied).toBe(true);
  });

  it('should clean up resources when stopping recording', async () => {
    const mockTrack = { stop: jest.fn() };
    const mockStream = {
      getTracks: () => [mockTrack],
    };
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    await act(async () => {
      await result.current.scheduleRecording();
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('should not schedule recording without duration', async () => {
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn(), readyState: 'live' }],
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop() }));
    
    await act(async () => {
      await result.current.scheduleRecording();
    });

    expect(result.current.startingRecordingInSeconds).toBe(0);
    expect(mockMediaRecorder.start).not.toHaveBeenCalled();
  });

  it('should update countdown timer correctly', async () => {
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn(), readyState: 'live' }],
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    await act(async () => {
      await result.current.scheduleRecording();
    });

    const initialSeconds = result.current.startingRecordingInSeconds;

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.startingRecordingInSeconds).toBe(initialSeconds - 1);
  });

  it('should handle longer audio duration by trimming', async () => {
    const mockBlob = new Blob(['test'], { type: 'audio/wav' });
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }],
    });

    // Mock a longer audio buffer
    mockAudioContext.decodeAudioData.mockImplementationOnce(() => Promise.resolve({
      duration: 10, // Longer than our target duration of 5
      getChannelData: () => new Float32Array(441000), // 10 seconds at 44.1kHz
      numberOfChannels: 1,
      sampleRate: 44100,
      length: 441000,
    }));

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    await act(async () => {
      await result.current.scheduleRecording();
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      if (mockMediaRecorder.ondataavailable) {
        mockMediaRecorder.ondataavailable({ data: mockBlob } as BlobEvent);
      }
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(mockAudioContext.createBuffer).toHaveBeenCalled();
    expect(result.current.recordedAudioBlob).not.toBeNull();
  });

  it('should handle multiple recording sessions', async () => {
    const mockTrack = { stop: jest.fn() };
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [mockTrack],
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    // First recording session
    await act(async () => {
      await result.current.scheduleRecording();
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.stopRecording();
    });

    // Second recording session
    await act(async () => {
      await result.current.scheduleRecording();
      jest.advanceTimersByTime(1000);
    });

    expect(mockMediaRecorder.start).toHaveBeenCalledTimes(2);
    expect(mockTrack.stop).toHaveBeenCalledTimes(2);
  });

  it('should reset state when scheduling new recording', async () => {
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }],
    });

    // Mock the loop timing to ensure consistent behavior
    const nextLoopPointAt = Date.now() + 5000;
    (useLoop as jest.Mock).mockReturnValue({
      setMode: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      audioContext: { current: mockAudioContext },
      nextLoopPointAt: { current: nextLoopPointAt },
    });

    const { result } = renderHook(() => useRecorder({ loop: useLoop(), duration: 5 }));
    
    // Set some initial state
    await act(async () => {
      await result.current.scheduleRecording();
      // Advance time to start recording
      jest.advanceTimersByTime(1000);

      // Simulate recording completion
      if (mockMediaRecorder.ondataavailable) {
        mockMediaRecorder.ondataavailable({ data: new Blob(['test'], { type: 'audio/wav' }) } as BlobEvent);
      }
      await Promise.resolve();
    });

    // Schedule new recording
    await act(async () => {
      await result.current.scheduleRecording();
      // Let the scheduling complete
      await Promise.resolve();
      // Advance time to update the countdown
      jest.advanceTimersByTime(100);
    });

    expect(result.current.recordedAudioBlob).toBeNull();
    expect(result.current.startingRecordingInSeconds).toBeGreaterThan(0);
  });
});
