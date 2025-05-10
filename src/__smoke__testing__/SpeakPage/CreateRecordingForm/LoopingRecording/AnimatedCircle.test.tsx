import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedCircle from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/AnimatedCircle';

// Mock ProgressRing component
jest.mock('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/ProgressRing', () => ({
  __esModule: true,
  default: ({ progress, mode }: { progress: number; mode: string }) => (
    <div data-testid="progress-ring" data-progress={progress} data-mode={mode} />
  ),
}));

type AnimatedCircleMode = "idle" | "recording" | "playing-speaker" | "waiting-to-record" | "recording-playback" | "loading";

describe('AnimatedCircle', () => {
  const defaultProps = {
    dimensions: {
      size: 306,
      strokeWidth: 2,
      thumbSize: 11,
      padding: 16,
      svgSize: 338,
      radius: 153,
      circumference: 961.3273,
      thumbRadius: 5.5,
    },
    mode: 'idle' as AnimatedCircleMode,
    duration: 1000,
    startedAtTime: { current: Date.now() },
  };

  let animationFrameId = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      animationFrameId += 1;
      window.setTimeout(() => cb(performance.now()), 16);
      return animationFrameId;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders with initial progress of 0', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-progress', '0');
  });

  it('updates progress when mode is not idle', () => {
    const { getByTestId, rerender } = render(<AnimatedCircle {...defaultProps} />);
    
    rerender(<AnimatedCircle {...defaultProps} mode="recording" startedAtTime={defaultProps.startedAtTime} />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const progressRing = getByTestId('progress-ring');
    expect(Number(progressRing.getAttribute('data-progress'))).toBeGreaterThan(0);
  });

  it('resets progress when switching to idle mode', () => {
    const { getByTestId, rerender } = render(<AnimatedCircle {...defaultProps} mode="recording" />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    rerender(<AnimatedCircle {...defaultProps} mode="idle" startedAtTime={defaultProps.startedAtTime} />);
    
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-progress', '0');
  });

  it('maps idle mode to rehearse ProgressRing mode', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} mode="idle" />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-mode', 'rehearse');
  });

  it('maps waiting-to-record mode to rehearse ProgressRing mode', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} mode="waiting-to-record" />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-mode', 'rehearse');
  });

  it('maps recording mode to recording ProgressRing mode', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} mode="recording" />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-mode', 'recording');
  });

  it('maps playing-speaker mode to rehearse ProgressRing mode', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} mode="playing-speaker" />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-mode', 'rehearse');
  });

  it('maps recording-playback mode to review ProgressRing mode', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} mode="recording-playback" />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-mode', 'review');
  });

  it('maps loading mode to review ProgressRing mode', () => {
    const { getByTestId } = render(<AnimatedCircle {...defaultProps} mode="loading" />);
    const progressRing = getByTestId('progress-ring');
    expect(progressRing).toHaveAttribute('data-mode', 'review');
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<AnimatedCircle {...defaultProps} mode="recording" />);
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    unmount();
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });
});
