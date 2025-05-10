import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubmissionControls from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/SubmissionControls';

// Mock the MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, sx }: any) => <div data-testid="box" style={sx}>{children}</div>,
  Button: ({ children, onClick, variant, color, size, sx }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick}
      data-variant={variant}
      data-color={color}
      data-size={size}
      style={sx}
    >
      {children}
    </button>
  ),
  CircularProgress: () => <div data-testid="circular-progress" />,
  Dialog: ({ children, open }: any) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogContentText: ({ children }: any) => (
    <div data-testid="dialog-content-text">{children}</div>
  ),
  Stack: ({ children, spacing, alignItems, sx }: any) => (
    <div data-testid="stack" style={{ gap: spacing, alignItems, ...sx }}>
      {children}
    </div>
  ),
}));

// Mock the LegalAgreementForm component
jest.mock('@/components/LegalAgreementForm', () => ({
  __esModule: true,
  default: ({ onAccept, onDecline }: any) => (
    <div data-testid="legal-agreement-form">
      <button data-testid="legal-accept" onClick={onAccept}>Accept</button>
      <button data-testid="legal-decline" onClick={onDecline}>Decline</button>
    </div>
  ),
}));

describe('SubmissionControls Component', () => {
  const defaultProps = {
    hasRecording: true,
    submissionStatus: 'idle' as const,
    onLegalAccept: jest.fn(),
    onLegalDecline: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when there is no recording', () => {
    render(<SubmissionControls {...defaultProps} hasRecording={false} />);
    expect(screen.queryByText('Submit Recording')).not.toBeInTheDocument();
  });

  it('renders submit button when there is a recording', () => {
    render(<SubmissionControls {...defaultProps} />);
    const submitButton = screen.getByText('Submit Recording');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('data-variant', 'contained');
    expect(submitButton).toHaveAttribute('data-color', 'primary');
    expect(submitButton).toHaveAttribute('data-size', 'large');
  });

  it('opens legal modal when submit button is clicked', () => {
    render(<SubmissionControls {...defaultProps} />);
    const submitButton = screen.getByText('Submit Recording');
    fireEvent.click(submitButton);
    expect(screen.getByTestId('legal-agreement-form')).toBeInTheDocument();
  });

  it('handles legal agreement acceptance', async () => {
    render(<SubmissionControls {...defaultProps} />);
    
    // Open modal
    const submitButton = screen.getByText('Submit Recording');
    fireEvent.click(submitButton);
    
    // Accept legal agreement
    const acceptButton = screen.getByTestId('legal-accept');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(defaultProps.onLegalAccept).toHaveBeenCalled();
    });
  });

  it('handles legal agreement decline', () => {
    render(<SubmissionControls {...defaultProps} />);
    
    // Open modal
    const submitButton = screen.getByText('Submit Recording');
    fireEvent.click(submitButton);
    
    // Decline legal agreement
    const declineButton = screen.getByTestId('legal-decline');
    fireEvent.click(declineButton);
    
    expect(defaultProps.onLegalDecline).toHaveBeenCalled();
  });

  it('shows submitting dialog when status is submitting', () => {
    render(<SubmissionControls {...defaultProps} submissionStatus="submitting" />);
    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    expect(screen.getByText('Uploading your contribution now! Please keep this page open until we finish uploading.')).toBeInTheDocument();
  });

  it('shows error dialog when status is error', () => {
    render(<SubmissionControls {...defaultProps} submissionStatus="error" />);
    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('We encountered an error while trying to upload your contribution. Please try again later.')).toBeInTheDocument();
  });

  it('does not show any dialog when status is idle', () => {
    render(<SubmissionControls {...defaultProps} submissionStatus="idle" />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
