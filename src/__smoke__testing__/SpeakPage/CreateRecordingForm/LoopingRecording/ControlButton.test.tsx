import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ControlButton from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/ControlButton';

// Mock the hooks and components
jest.mock('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/useLoopingRecording', () => ({
  useLoopingRecording: () => ({
    loop: {
      mode: 'idle'
    }
  })
}));

jest.mock('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext', () => ({
  useLoopContext: () => ({
    recorder: {
      scheduleRecording: jest.fn()
    }
  })
}));

jest.mock('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/CountdownTimer', () => ({
  __esModule: true,
  default: () => <div data-testid="countdown-timer">Countdown Timer</div>
}));

jest.mock('@/components/elements/ConfirmationDialog', () => ({
  __esModule: true,
  default: ({ 
    open, 
    onClose, 
    onConfirm, 
    title, 
    description 
  }: { 
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
  }) => (
    open ? (
      <div data-testid="confirmation-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-description">{description}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>Confirm</button>
        <button data-testid="cancel-button" onClick={onClose}>Cancel</button>
      </div>
    ) : null
  )
}));

describe('ControlButton', () => {
  const defaultProps = {
    mode: 'idle' as const,
    onPlayClick: jest.fn(),
    onRecordClick: jest.fn()
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    const theme = createTheme();
    return render(
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders play button in idle mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('PlayCircleFilledIcon')).toBeInTheDocument();
  });

  it('renders mic button in playing-speaker mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="playing-speaker" />);
    expect(screen.getByTestId('MicOutlinedIcon')).toBeInTheDocument();
  });

  it('renders recording indicator in recording mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="recording" />);
    expect(screen.getByTestId('MicOutlinedIcon')).toBeInTheDocument();
  });

  it('renders re-record button in recording-playback mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="recording-playback" />);
    expect(screen.getByText('Re-Record')).toBeInTheDocument();
  });

  it('renders countdown timer in waiting-to-record mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="waiting-to-record" />);
    expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
  });

  it('renders loading text in loading mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="loading" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls onPlayClick when play button is clicked in idle mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onPlayClick).toHaveBeenCalledTimes(1);
  });

  it('calls onRecordClick when mic button is clicked in playing-speaker mode', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="playing-speaker" />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onRecordClick).toHaveBeenCalledTimes(1);
  });

  it('opens confirmation dialog when re-record button is clicked', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="recording-playback" />);
    fireEvent.click(screen.getByText('Re-Record'));
    expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
  });

  it('closes confirmation dialog when cancel is clicked', () => {
    renderWithTheme(<ControlButton {...defaultProps} mode="recording-playback" />);
    fireEvent.click(screen.getByText('Re-Record'));
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
  });

  it('triggers re-recording when confirmed', () => {
    const mockScheduleRecording = jest.fn();
    jest.spyOn(require('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext'), 'useLoopContext')
      .mockReturnValue({
        recorder: {
          scheduleRecording: mockScheduleRecording
        }
      });

    renderWithTheme(<ControlButton {...defaultProps} mode="recording-playback" />);
    fireEvent.click(screen.getByText('Re-Record'));
    fireEvent.click(screen.getByTestId('confirm-button'));
    expect(mockScheduleRecording).toHaveBeenCalledTimes(1);
  });
});
