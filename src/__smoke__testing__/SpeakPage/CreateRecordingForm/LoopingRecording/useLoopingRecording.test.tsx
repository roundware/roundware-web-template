import { renderHook, act } from '@testing-library/react-hooks';
import { useLoopingRecording } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoopingRecording';
import { useLocationFromQuery } from '@/hooks';
import { useBaseSpeakerAudio } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useBaseSpeakerAudio';
import { useLoop } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop';
import { useRecorder } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useRecorder';
import { useSubmission } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useSubmission';
import { useRealtimePlayback } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useRealtimePlayback';

// Mock browser APIs
class MockAudioContext {
  currentTime = 0;
  createBufferSource() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      buffer: null,
    };
  }
  createGain() {
    return {
      connect: jest.fn(),
      gain: {
        value: 1,
        linearRampToValueAtTime: jest.fn(),
      },
    };
  }
  resume() {
    return Promise.resolve();
  }
  decodeAudioData() {
    return Promise.resolve({
      duration: 2,
      length: 88200,
      numberOfChannels: 2,
      sampleRate: 44100,
    });
  }
}

class MockMediaStream {
  getTracks() {
    return [];
  }
}

// Mock all the hooks
jest.mock('@/hooks', () => ({
  useLocationFromQuery: jest.fn(),
}));

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useBaseSpeakerAudio');
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop');
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useRecorder');
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useSubmission');
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useRealtimePlayback');

// Mock global browser APIs
global.AudioContext = MockAudioContext as any;
global.MediaStream = MockMediaStream as any;

describe('useLoopingRecording', () => {
  const mockLocation = { lat: 40.7128, lng: -74.0060 };
  const mockSpeaker = {
    duration: 10,
    baseSpeakers: ['speaker1', 'speaker2'],
  };
  const mockLoop = {
    audioContext: { current: new AudioContext() },
    mode: 'idle',
    isStarted: false,
  };
  const mockRecorder = {
    recorderStream: new MediaStream(),
    recordedAudioBlob: new Blob(['test'], { type: 'audio/wav' }),
  };
  const mockSubmission = {
    isSubmitting: false,
    submit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    (useLocationFromQuery as jest.Mock).mockReturnValue(mockLocation);
    (useBaseSpeakerAudio as jest.Mock).mockReturnValue(mockSpeaker);
    (useLoop as jest.Mock).mockReturnValue(mockLoop);
    (useRecorder as jest.Mock).mockReturnValue(mockRecorder);
    (useSubmission as jest.Mock).mockReturnValue(mockSubmission);
    (useRealtimePlayback as jest.Mock).mockReturnValue(undefined);
  });

  it('should initialize with all required hooks', () => {
    const { result } = renderHook(() => useLoopingRecording());

    // Verify all hooks are called with correct parameters
    expect(useLocationFromQuery).toHaveBeenCalled();
    expect(useBaseSpeakerAudio).toHaveBeenCalledWith(mockLocation.lat, mockLocation.lng, mockLoop);
    expect(useLoop).toHaveBeenCalled();
    expect(useRecorder).toHaveBeenCalledWith({
      duration: mockSpeaker.duration,
      loop: mockLoop,
    });
    expect(useRealtimePlayback).toHaveBeenCalledWith({
      audioContext: mockLoop.audioContext.current,
      recordingStream: mockRecorder.recorderStream,
    });
    expect(useSubmission).toHaveBeenCalledWith({
      location: mockLocation,
      recordedAudioBlob: mockRecorder.recordedAudioBlob,
      baseSpeakers: mockSpeaker.baseSpeakers,
    });

    // Verify returned object structure
    expect(result.current).toEqual({
      speaker: mockSpeaker,
      recorder: mockRecorder,
      location: mockLocation,
      submission: mockSubmission,
      loop: mockLoop,
    });
  });

  it('should handle undefined speaker duration', () => {
    const speakerWithoutDuration = { ...mockSpeaker, duration: undefined };
    (useBaseSpeakerAudio as jest.Mock).mockReturnValue(speakerWithoutDuration);

    renderHook(() => useLoopingRecording());

    expect(useRecorder).toHaveBeenCalledWith({
      duration: undefined,
      loop: mockLoop,
    });
  });

  it('should handle undefined base speakers', () => {
    const speakerWithoutSpeakers = { ...mockSpeaker, baseSpeakers: undefined };
    (useBaseSpeakerAudio as jest.Mock).mockReturnValue(speakerWithoutSpeakers);

    renderHook(() => useLoopingRecording());

    expect(useSubmission).toHaveBeenCalledWith({
      location: mockLocation,
      recordedAudioBlob: mockRecorder.recordedAudioBlob,
      baseSpeakers: [],
    });
  });

  it('should handle undefined recorded audio blob', () => {
    const recorderWithoutBlob = { ...mockRecorder, recordedAudioBlob: undefined };
    (useRecorder as jest.Mock).mockReturnValue(recorderWithoutBlob);

    renderHook(() => useLoopingRecording());

    expect(useSubmission).toHaveBeenCalledWith({
      location: mockLocation,
      recordedAudioBlob: undefined,
      baseSpeakers: mockSpeaker.baseSpeakers,
    });
  });
});
