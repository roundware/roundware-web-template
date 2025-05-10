import { renderHook } from '@testing-library/react-hooks';
import { useBaseSpeakerAudio } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useBaseSpeakerAudio';
import { useRoundware } from '@/hooks/index';
import { useLoop } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop';
import { Dispatch, SetStateAction, MutableRefObject } from 'react';

// Mock dependencies
jest.mock('@/hooks/index', () => ({
  useRoundware: jest.fn(),
}));

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoop', () => ({
  useLoop: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);

// Mock AudioContext and its methods
const mockAudioContext = {
  createBuffer: jest.fn().mockReturnValue({
    getChannelData: () => new Float32Array(44100),
    numberOfChannels: 1,
    length: 44100,
    sampleRate: 44100,
    duration: 1,
  }),
  decodeAudioData: jest.fn().mockResolvedValue({
    getChannelData: () => new Float32Array(44100),
    numberOfChannels: 1,
    length: 44100,
    sampleRate: 44100,
    duration: 1,
  }),
  createBufferSource: jest.fn(),
  createGain: jest.fn(),
  createDelay: jest.fn(),
  createDynamicsCompressor: jest.fn(),
  createConvolver: jest.fn(),
  createMediaStreamSource: jest.fn(),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  baseLatency: 0,
  outputLatency: 0,
  close: jest.fn(),
  createMediaElementSource: jest.fn(),
  createOscillator: jest.fn(),
  createPeriodicWave: jest.fn(),
  createScriptProcessor: jest.fn(),
  createAnalyser: jest.fn(),
  createBiquadFilter: jest.fn(),
  createChannelMerger: jest.fn(),
  createChannelSplitter: jest.fn(),
  createConstantSource: jest.fn(),
  createGainNode: jest.fn(),
  createIIRFilter: jest.fn(),
  createPanner: jest.fn(),
  createStereoPanner: jest.fn(),
  createWaveShaper: jest.fn(),
  createMediaStreamDestination: jest.fn(),
  createOfflineAudioContext: jest.fn(),
  resume: jest.fn(),
  suspend: jest.fn(),
  state: 'running',
  onstatechange: null,
  getOutputTimestamp: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  audioWorklet: {},
} as unknown as AudioContext;

describe('useBaseSpeakerAudio', () => {
  const mockLoop = {
    isLoading: true,
    setIsLoading: jest.fn() as unknown as Dispatch<SetStateAction<boolean>>,
    isStarted: false,
    mode: 'idle' as const,
    setMode: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    nextLoopPointAt: { current: null } as MutableRefObject<number | null>,
    speakerAudioBuffer: { current: null } as MutableRefObject<AudioBuffer | null>,
    audioContext: { current: mockAudioContext } as MutableRefObject<AudioContext>,
    startedAtTime: { current: null } as MutableRefObject<number | null>
  };

  const mockRoundware = {
    mixer: {
      initContext: jest.fn(),
      speakerEngine: {
        speakers: [
          {
            data: { id: 1, name: 'Speaker 1' },
            uri: 'http://example.com/audio1.mp3',
            outerBoundaryContains: jest.fn().mockReturnValue(true),
            attenuationShapeContains: jest.fn().mockReturnValue(false),
            volumeByLocation: jest.fn().mockReturnValue(0.5),
          },
          {
            data: { id: 2, name: 'Speaker 2' },
            uri: 'http://example.com/audio2.mp3',
            outerBoundaryContains: jest.fn().mockReturnValue(false),
            attenuationShapeContains: jest.fn().mockReturnValue(true),
            volumeByLocation: jest.fn().mockReturnValue(0.3),
          },
        ],
        latestBaseTrack: {
          data: { id: 1, name: 'Speaker 1' },
          uri: 'http://example.com/audio1.mp3',
        },
        updateParams: jest.fn(),
        calculateVolumesByLocation: jest.fn(),
      },
    },
    speakers: jest.fn().mockReturnValue([
      { id: 1, name: 'Speaker 1' },
      { id: 2, name: 'Speaker 2' },
    ]),
  };

  beforeEach(() => {
    (useRoundware as jest.Mock).mockReturnValue({ roundware: mockRoundware });
    (useLoop as jest.Mock).mockReturnValue(mockLoop);
    jest.clearAllMocks();
  });

  it('should return not ready state when no speakers are available', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        ...mockRoundware,
        speakers: jest.fn().mockReturnValue([]),
      },
    });

    const { result } = renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    expect(result.current).toEqual({
      baseSpeakers: null,
      duration: null,
      isReady: false,
    });
  });

  it('should return not ready state when mixer is not initialized', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        ...mockRoundware,
        mixer: null,
      },
    });

    const { result } = renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    expect(result.current).toEqual({
      baseSpeakers: null,
      duration: null,
      isReady: false,
    });
  });

  it('should initialize mixer and update speaker engine params', () => {
    renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    expect(mockRoundware.mixer.initContext).toHaveBeenCalled();
    expect(mockRoundware.mixer.speakerEngine.updateParams).toHaveBeenCalled();
    expect(mockRoundware.mixer.speakerEngine.calculateVolumesByLocation).toHaveBeenCalled();
  });

  it('should filter speakers based on location', () => {
    renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    expect(mockRoundware.mixer.speakerEngine.speakers[0].outerBoundaryContains).toHaveBeenCalled();
    expect(mockRoundware.mixer.speakerEngine.speakers[1].attenuationShapeContains).toHaveBeenCalled();
  });

  it('should set loading state to false after processing', async () => {
    renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockLoop.setIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle single speaker case', async () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        ...mockRoundware,
        mixer: {
          ...mockRoundware.mixer,
          speakerEngine: {
            ...mockRoundware.mixer.speakerEngine,
            speakers: [mockRoundware.mixer.speakerEngine.speakers[0]],
          },
        },
      },
    });

    const { result } = renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.isReady).toBe(true);
    expect(result.current.baseSpeakers).toHaveLength(1);
  });

  it('should handle multiple speakers case', async () => {
    const { result } = renderHook(() => useBaseSpeakerAudio(0, 0, mockLoop));

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.isReady).toBe(true);
    expect(result.current.baseSpeakers).toHaveLength(2);
  });
});
