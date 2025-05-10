import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorDialog from '../components/ErrorDialog';

describe('ErrorDialog Component', () => {
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when error is present', () => {
    const error = new Error('Test error message');
    render(<ErrorDialog error={error} set_error={mockSetError} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('does not render dialog when error is null', () => {
    render(<ErrorDialog error={null} set_error={mockSetError} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls set_error with null when OK button is clicked', () => {
    const error = new Error('Test error message');
    render(<ErrorDialog error={error} set_error={mockSetError} />);
    
    const okButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(okButton);
    
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('renders dialog with correct styling', () => {
    const error = new Error('Test error message');
    render(<ErrorDialog error={error} set_error={mockSetError} />);
    
    const dialog = screen.getByRole('dialog');
    const okButton = screen.getByRole('button', { name: 'OK' });
    
    expect(dialog).toBeInTheDocument();
    expect(okButton).toHaveClass('MuiButton-contained');
  });
});
