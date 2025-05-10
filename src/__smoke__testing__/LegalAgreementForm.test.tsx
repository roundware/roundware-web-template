import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LegalAgreementForm from '../components/LegalAgreementForm';
import { useRoundware } from '../hooks';

// Mock the useRoundware hook
jest.mock('../hooks', () => ({
  useRoundware: jest.fn()
}));

describe('LegalAgreementForm Component', () => {
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();
  const mockProject = {
    legalAgreement: 'Test legal agreement text'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        project: mockProject
      }
    });
  });

  it('renders nothing when project is not available', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        project: null
      }
    });

    const { container } = render(
      <LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders form with correct content when project is available', () => {
    render(<LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />);

    expect(screen.getByText('Content Agreement')).toBeInTheDocument();
    expect(screen.getByText('Test legal agreement text')).toBeInTheDocument();
    expect(screen.getByText('I AGREE')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('disables Submit button when checkbox is unchecked', () => {
    render(<LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('enables Submit button when checkbox is checked', () => {
    render(<LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onAccept when Submit button is clicked', () => {
    render(<LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />);
    
    // Check the checkbox first
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Click submit button
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when Go Back button is clicked', () => {
    render(<LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />);
    
    const goBackButton = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(goBackButton);
    
    expect(mockOnDecline).toHaveBeenCalledTimes(1);
  });

  it('toggles checkbox state correctly', () => {
    render(<LegalAgreementForm onAccept={mockOnAccept} onDecline={mockOnDecline} />);
    
    const checkbox = screen.getByRole('checkbox');
    
    // Initially unchecked
    expect(checkbox).not.toBeChecked();
    
    // Check
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    // Uncheck
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
