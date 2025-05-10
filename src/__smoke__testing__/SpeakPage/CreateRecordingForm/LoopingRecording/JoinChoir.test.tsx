import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JoinChoir from '../../../../components/SpeakPage/CreateRecordingForm/LoopingRecording/components/JoinChoir';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeChecked(): R;
      toHaveClass(className: string): R;
    }
  }
}

describe('JoinChoir Component', () => {
  const mockOnContinue = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnCheckPermission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all elements correctly', () => {
    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    // Check for main elements
    expect(screen.getByText('JOIN CHOIR')).toBeInTheDocument();
    expect(screen.getByText(/Rehearse your/)).toBeInTheDocument();
    expect(screen.getByText(/singing to the loop/)).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Check for consent checkbox
    const consentText = screen.getByText(/I consent to my recording being used solely for the artistic purposes of Invisible Choir/);
    expect(consentText).toBeInTheDocument();
  });

  it('renders with Fade transition and proper styling', () => {
    const { container } = render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    // Check Fade component props are applied
    const fadeElement = container.firstChild;
    expect(fadeElement).toHaveStyle({ opacity: 1 });

    // Check for Skeleton component
    const skeleton = container.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('MuiSkeleton-circular');
    expect(skeleton).toHaveClass('MuiSkeleton-pulse');
  });

  it('handles checkbox state changes correctly', () => {
    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    // Check the checkbox
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Uncheck the checkbox
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('Continue button is disabled when consent is not checked', () => {
    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('Continue button is enabled when consent is checked', () => {
    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const continueButton = screen.getByText('Continue');
    expect(continueButton).not.toBeDisabled();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onContinue and onCheckPermission when Continue is clicked with permission', async () => {
    mockOnCheckPermission.mockResolvedValue(true);

    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    // Check consent
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnCheckPermission).toHaveBeenCalledTimes(1);
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onContinue when permission check fails', async () => {
    mockOnCheckPermission.mockResolvedValue(false);

    render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    // Check consent
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnCheckPermission).toHaveBeenCalledTimes(1);
      expect(mockOnContinue).not.toHaveBeenCalled();
    });
  });

  it('renders visual indicators correctly', () => {
    const { container } = render(
      <JoinChoir
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
        onCheckPermission={mockOnCheckPermission}
      />
    );

    // Check for the three indicator boxes using a more specific selector
    const indicators = container.querySelectorAll('.MuiStack-root .MuiBox-root');
    expect(indicators).toHaveLength(3);

    // First indicator should have primary color
    expect(indicators[0]).toHaveStyle({ backgroundColor: 'primary.main' });
    // Other indicators should have grey color
    expect(indicators[1]).toHaveStyle({ backgroundColor: 'grey.500' });
    expect(indicators[2]).toHaveStyle({ backgroundColor: 'grey.500' });
  });
});
