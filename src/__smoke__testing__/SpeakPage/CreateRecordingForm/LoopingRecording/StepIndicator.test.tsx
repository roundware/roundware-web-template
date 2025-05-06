import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StepIndicator from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/StepIndicator';
import { LoopProvider } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext';

type LoopMode = 'idle' | 'playing-speaker' | 'waiting-to-record' | 'recording' | 'recording-playback' | 'loading';

// Mock AudioContext
const mockAudioContext = {
  createMediaStreamSource: () => ({
    connect: jest.fn()
  }),
  createGain: () => ({
    connect: jest.fn(),
    gain: { value: 1 }
  }),
  createMediaStreamDestination: () => ({
    stream: new MediaStream()
  }),
  // Add required AudioContext properties
  baseLatency: 0,
  outputLatency: 0,
  destination: {},
  sampleRate: 44100,
  state: 'running',
  close: jest.fn(),
  suspend: jest.fn(),
  resume: jest.fn(),
  createBuffer: jest.fn(),
  createBufferSource: jest.fn(),
  createMediaElementSource: jest.fn(),
  createScriptProcessor: jest.fn(),
  createStereoPanner: jest.fn(),
  createAnalyser: jest.fn(),
  createBiquadFilter: jest.fn(),
  createChannelMerger: jest.fn(),
  createChannelSplitter: jest.fn(),
  createConvolver: jest.fn(),
  createDelay: jest.fn(),
  createDynamicsCompressor: jest.fn(),
  createOscillator: jest.fn(),
  createPanner: jest.fn(),
  createPeriodicWave: jest.fn(),
  createWaveShaper: jest.fn(),
  decodeAudioData: jest.fn(),
  audioWorklet: {
    addModule: jest.fn()
  },
  currentTime: 0,
  listener: {},
  onstatechange: null
};

// Mock the Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
global.MediaStream = jest.fn().mockImplementation(() => ({
  getTracks: () => [],
  getAudioTracks: () => []
}));

// Mock the MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, sx }: any) => <div data-testid="box" style={sx}>{children}</div>,
  Stack: ({ children, direction, spacing, justifyContent, alignItems }: any) => (
    <div data-testid={`stack-${direction}`} style={{ display: 'flex', flexDirection: direction, gap: spacing, justifyContent, alignItems }}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, sx }: any) => (
    <div data-testid="typography" style={sx}>{children}</div>
  ),
}));

// Mock the hooks
jest.mock('../../../../hooks', () => ({
  useLocationFromQuery: () => ({ latitude: 40.7128, longitude: -74.0060 }),
  useRoundware: () => ({
    roundware: {
      project: {
        location: { latitude: 40.7128, longitude: -74.0060 }
      }
    }
  }),
  useRoundwareDraft: () => ({
    draftRecording: {
      id: 1,
      location: { latitude: 40.7128, longitude: -74.0060 },
      tags: []
    },
    updateDraftRecording: jest.fn(),
    submitDraftRecording: jest.fn()
  })
}));

// Create a mock function for useLoopContext
const mockUseLoopContext = jest.fn();

// Mock the LoopContext
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext', () => ({
  useLoopContext: () => mockUseLoopContext()
}));

describe('StepIndicator Component', () => {
  const renderWithLoopContext = (mode: LoopMode) => {
    // Update the mock implementation for this test
    mockUseLoopContext.mockImplementation(() => ({
      loop: {
        mode,
        setMode: jest.fn(),
        audioContext: { current: new AudioContext() },
        audioStream: null,
        audioRecorder: null,
        audioPlayer: null,
        recordingUrl: null,
        recordingDuration: 0,
        isPlaying: false,
        isRecording: false,
        startRecording: jest.fn(),
        stopRecording: jest.fn(),
        playRecording: jest.fn(),
        stopPlayback: jest.fn(),
        resetRecording: jest.fn(),
        submitRecording: jest.fn(),
        error: null
      }
    }));

    return render(
      <MemoryRouter>
        <StepIndicator />
      </MemoryRouter>
    );
  };

  it('renders all three steps', () => {
    renderWithLoopContext('idle');
    const stacks = screen.getAllByTestId('stack-column');
    expect(stacks).toHaveLength(3);
  });

  it('shows REHEARSE step for idle mode', () => {
    renderWithLoopContext('idle');
    const typography = screen.getByText('REHEARSE');
    expect(typography).toBeInTheDocument();
  });

  it('shows REHEARSE step for playing-speaker mode', () => {
    renderWithLoopContext('playing-speaker');
    const typography = screen.getByText('REHEARSE');
    expect(typography).toBeInTheDocument();
  });

  it('shows REHEARSE step for waiting-to-record mode', () => {
    renderWithLoopContext('waiting-to-record');
    const typography = screen.getByText('REHEARSE');
    expect(typography).toBeInTheDocument();
  });

  it('shows RECORDING step for recording mode', () => {
    renderWithLoopContext('recording');
    const typography = screen.getByText('RECORDING');
    expect(typography).toBeInTheDocument();
  });

  it('shows REVIEW step for recording-playback mode', () => {
    renderWithLoopContext('recording-playback');
    const typography = screen.getByText('REVIEW');
    expect(typography).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    renderWithLoopContext('idle');
    const rowStack = screen.getByTestId('stack-row');
    expect(rowStack).toBeInTheDocument();
    
    const columnStacks = screen.getAllByTestId('stack-column');
    expect(columnStacks).toHaveLength(3);
  });
});
