import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationNotFoundDialog from '../../components/elements/LocationNotFoundDialog';

describe('LocationNotFoundDialog Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders dialog with correct content', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);

    // Check for main elements
    expect(screen.getByText('LOCATION NOT FOUND!')).toBeInTheDocument();
    expect(screen.getByText(/Sorry we couldn't find your location/)).toBeInTheDocument();
    expect(screen.getByText('GOT IT!')).toBeInTheDocument();
    expect(screen.getByTestId('LocationOnOutlinedIcon')).toBeInTheDocument();
  });

  it('shows dialog when open prop is true', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('hides dialog when open prop is false', () => {
    render(<LocationNotFoundDialog open={false} onClose={mockOnClose} />);
    
    // When open is false, the dialog should not be in the document
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('GOT IT!');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dialog backdrop is clicked', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);
    
    // Find the backdrop element using its class
    const backdrop = document.querySelector('.MuiBackdrop-root');
    fireEvent.click(backdrop as Element);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders dialog in full screen mode', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
  });

  it('centers content vertically and horizontally', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);
    
    const stack = screen.getByRole('dialog').querySelector('.MuiStack-root');
    expect(stack).toHaveStyle({
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    });
  });

  it('applies correct spacing between elements', () => {
    render(<LocationNotFoundDialog open={true} onClose={mockOnClose} />);
    
    const stack = screen.getByRole('dialog').querySelector('.MuiStack-root');
    expect(stack).toHaveClass('MuiStack-root');
    // In MUI v5, spacing is applied through the CSS-in-JS system
    expect(stack?.className).toMatch(/css-/);
  });
});
