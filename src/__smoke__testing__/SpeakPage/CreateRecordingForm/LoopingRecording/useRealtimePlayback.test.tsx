import { renderHook, act } from '@testing-library/react-hooks';
import { useRealtimePlayback } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useRealtimePlayback';

// Mock audio nodes and their methods
const mockConnect = jest.fn().mockReturnThis();
const mockDisconnect = jest.fn();

class MockGainNode {
  gain = { value: 0 };
  connect = mockConnect;
  disconnect = mockDisconnect;
}

class MockDelayNode {
  delayTime = { value: 0 };
  connect = mockConnect;
  disconnect = mockDisconnect;
}

class MockCompressorNode {
  threshold = { value: 0 };
  knee = { value: 0 };
  ratio = { value: 0 };
  attack = { value: 0 };
  release = { value: 0 };
  connect = mockConnect;
  disconnect = mockDisconnect;
}

class MockConvolverNode {
  buffer: AudioBuffer | null = null;
  connect = mockConnect;
  disconnect = mockDisconnect;
}

class MockMediaStreamSource {
  connect = mockConnect;
  disconnect = mockDisconnect;
}

class MockMediaStream {
  id: string;
  constructor() {
    this.id = 'test-stream-id';
  }
  getTracks() {
    return [];
  }
}

class MockAudioContext {
  destination = {};
  sampleRate = 44100;

  createGain = jest.fn(() => new MockGainNode());
  createDelay = jest.fn(() => new MockDelayNode());
  createDynamicsCompressor = jest.fn(() => new MockCompressorNode());
  createConvolver = jest.fn(() => new MockConvolverNode());
  createMediaStreamSource = jest.fn(() => new MockMediaStreamSource());
  createBuffer = jest.fn((numChannels, length, sampleRate) => ({
    getChannelData: jest.fn(() => new Float32Array(length)),
    length,
    duration: length / sampleRate,
    numberOfChannels: numChannels,
    sampleRate,
  }));
}

// Mock global browser APIs
global.AudioContext = MockAudioContext as any;
global.MediaStream = MockMediaStream as any;

describe('useRealtimePlayback', () => {
  let audioContext: MockAudioContext;
  let recordingStream: MediaStream;

  beforeEach(() => {
    jest.clearAllMocks();
    audioContext = new MockAudioContext();
    recordingStream = new MediaStream();
  });

  it('should set up audio nodes with correct parameters when recording stream is provided', () => {
    const { result } = renderHook(() =>
      useRealtimePlayback({ audioContext: audioContext as unknown as AudioContext, recordingStream })
    );

    // Verify audio nodes were created
    expect(audioContext.createGain).toHaveBeenCalled();
    expect(audioContext.createDelay).toHaveBeenCalled();
    expect(audioContext.createDynamicsCompressor).toHaveBeenCalled();
    expect(audioContext.createConvolver).toHaveBeenCalled();
    expect(audioContext.createMediaStreamSource).toHaveBeenCalledWith(recordingStream);

    // Verify parameters were set correctly
    const gainNode = audioContext.createGain.mock.results[0].value;
    const delayNode = audioContext.createDelay.mock.results[0].value;
    const compressorNode = audioContext.createDynamicsCompressor.mock.results[0].value;

    expect(gainNode.gain.value).toBe(1); // PARAMS.vol
    expect(delayNode.delayTime.value).toBe(0.1); // PARAMS.delay (minimum value)
    expect(compressorNode.threshold.value).toBe(-20); // PARAMS.threshold
    expect(compressorNode.knee.value).toBe(20); // PARAMS.knee
    expect(compressorNode.ratio.value).toBe(12); // PARAMS.ratio
    expect(compressorNode.attack.value).toBe(0.01); // PARAMS.attack
    expect(compressorNode.release.value).toBe(0.25); // PARAMS.release

    // Verify connections were made
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should not set up audio nodes when recording stream is not provided', () => {
    const { result } = renderHook(() =>
      useRealtimePlayback({ audioContext: audioContext as unknown as AudioContext, recordingStream: undefined })
    );

    // Verify no audio nodes were created
    expect(audioContext.createGain).not.toHaveBeenCalled();
    expect(audioContext.createDelay).not.toHaveBeenCalled();
    expect(audioContext.createDynamicsCompressor).not.toHaveBeenCalled();
    expect(audioContext.createConvolver).not.toHaveBeenCalled();
    expect(audioContext.createMediaStreamSource).not.toHaveBeenCalled();
  });

  it('should clean up audio nodes when unmounting', () => {
    const { unmount } = renderHook(() =>
      useRealtimePlayback({ audioContext: audioContext as unknown as AudioContext, recordingStream })
    );

    unmount();

    // Verify all nodes were disconnected
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should clean up and recreate audio nodes when recording stream changes', () => {
    const { rerender } = renderHook(
      ({ stream }) => useRealtimePlayback({ audioContext: audioContext as unknown as AudioContext, recordingStream: stream }),
      {
        initialProps: { stream: recordingStream },
      }
    );

    // Create a new stream
    const newStream = new MediaStream();

    // Rerender with new stream
    rerender({ stream: newStream });

    // Verify new nodes were created with the new stream
    expect(audioContext.createMediaStreamSource).toHaveBeenCalledWith(newStream);
  });

  it('should handle errors gracefully when setting up audio nodes', () => {
    // Mock console.error to prevent actual error output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Make createMediaStreamSource throw an error
    audioContext.createMediaStreamSource.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const { result } = renderHook(() =>
      useRealtimePlayback({ audioContext: audioContext as unknown as AudioContext, recordingStream })
    );

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting up audio nodes: ', expect.any(Error));

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
