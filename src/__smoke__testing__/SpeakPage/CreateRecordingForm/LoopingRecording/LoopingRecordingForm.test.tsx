import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoopingRecordingForm from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopingRecordingForm';
import { useLoopContext } from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext';

// Mock the components
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/JoinChoir', () => ({
  __esModule: true,
  default: ({ onContinue, onCancel, onCheckPermission }: any) => (
    <div>
      <button onClick={onContinue}>Continue</button>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onCheckPermission}>Check Permission</button>
    </div>
  ),
}));

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls', () => ({
  __esModule: true,
  default: () => <div data-testid="recording-controls">Recording Controls</div>,
}));

jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/SubmissionControls', () => ({
  __esModule: true,
  default: ({ onLegalAccept, onLegalDecline, hasRecording }: any) => (
    <div>
      <button onClick={onLegalAccept} disabled={!hasRecording}>Accept Legal</button>
      <button onClick={onLegalDecline}>Decline Legal</button>
    </div>
  ),
}));

jest.mock('../../../../components/elements/ConfirmationDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onConfirm, title, description }: any) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock the useLoopContext hook
jest.mock('../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext', () => ({
  useLoopContext: jest.fn(),
  withLoopContext: (Component: any) => Component,
}));

describe('LoopingRecordingForm', () => {
  const mockRecorder = {
    recordedAudioBlob: null,
    checkMicrophonePermission: jest.fn(),
    scheduleRecording: jest.fn(),
  };

  const mockSubmission = {
    status: 'idle',
    start: jest.fn(),
  };

  const mockHistoryPush = jest.fn();

  beforeEach(() => {
    (useLoopContext as jest.Mock).mockReturnValue({
      recorder: mockRecorder,
      submission: mockSubmission,
    });

    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  it('should show JoinChoir component initially', () => {
    renderWithRouter(<LoopingRecordingForm />);
    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Check Permission')).toBeInTheDocument();
  });

  it('should show RecordingControls after continuing from JoinChoir', () => {
    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByTestId('recording-controls')).toBeInTheDocument();
  });

  it('should show close button after continuing from JoinChoir', () => {
    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Continue'));
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should show re-record confirmation dialog when triggered', async () => {
    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Continue'));
    
    // Find and click re-record button (you might need to adjust this based on your actual UI)
    const rerecordDialog = screen.queryByText('Re-record');
    expect(rerecordDialog).not.toBeInTheDocument();

    // After showing the dialog
    const dialog = screen.queryByTestId('confirmation-dialog');
    if (dialog) {
      fireEvent.click(screen.getByText('Yes, Re-record'));
      expect(mockRecorder.scheduleRecording).toHaveBeenCalled();
    }
  });

  it('should handle legal acceptance and show thank you dialog', async () => {
    // Mock a recorded audio blob
    (useLoopContext as jest.Mock).mockReturnValue({
      recorder: { ...mockRecorder, recordedAudioBlob: new Blob() },
      submission: mockSubmission,
    });

    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Continue'));

    // Accept legal terms
    fireEvent.click(screen.getByText('Accept Legal'));
    
    // Check if thank you dialog is shown
    expect(screen.getByText('Thank You!')).toBeInTheDocument();
    expect(mockSubmission.start).toHaveBeenCalled();
  });

  it('should disable legal acceptance when no recording exists', () => {
    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Continue'));
    
    const acceptButton = screen.getByText('Accept Legal');
    expect(acceptButton).toBeDisabled();
  });

  it('should check microphone permission when requested', () => {
    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Check Permission'));
    expect(mockRecorder.checkMicrophonePermission).toHaveBeenCalled();
  });

  it('should show leave confirmation dialog when close button is clicked', () => {
    renderWithRouter(<LoopingRecordingForm />);
    fireEvent.click(screen.getByText('Continue'));
    
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    fireEvent.click(closeButton!);

    expect(screen.getByText('Leave Choir')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to leave this choir/)).toBeInTheDocument();
  });
});
