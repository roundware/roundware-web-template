import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PermissionDeniedDialog from '../../components/elements/PermissionDeniedDialog';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

describe('PermissionDeniedDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockFunctionality = 'location' as const;

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOpen.mockClear();
  });

  it('renders with correct content', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );

    // Check for main elements
    expect(screen.getByText('SORRY!')).toBeInTheDocument();
    expect(screen.getByText(/To participate fully in the artwork experience/)).toBeInTheDocument();
    expect(screen.getByText('WATCH VIDEOS')).toBeInTheDocument();
    expect(screen.getByTestId('LanguageIcon')).toBeInTheDocument();
  });

  it('shows dialog when open prop is true', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('hides dialog when open prop is false', () => {
    render(
      <PermissionDeniedDialog 
        open={false} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    const backdrop = document.querySelector('.MuiBackdrop-root');
    fireEvent.click(backdrop as Element);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('opens Roundware website when Watch Videos button is clicked', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    const watchButton = screen.getByText('WATCH VIDEOS');
    fireEvent.click(watchButton);
    
    expect(mockOpen).toHaveBeenCalledWith('https://roundware.org/', '_blank');
  });

  it('applies correct layout styles', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    // Check dialog content layout
    const dialogContent = screen.getByRole('dialog').querySelector('.MuiDialogContent-root');
    expect(dialogContent).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    });

    // Check stack layout
    const stack = screen.getByRole('dialog').querySelector('.MuiStack-root');
    expect(stack).toHaveClass('MuiStack-root');
    expect(stack?.className).toMatch(/css-/);
  });

  it('renders in full screen mode', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
  });

  it('renders icon with correct size', () => {
    render(
      <PermissionDeniedDialog 
        open={true} 
        onClose={mockOnClose}
        functionality={mockFunctionality}
      />
    );
    
    const icon = screen.getByTestId('LanguageIcon');
    expect(icon).toHaveStyle({ fontSize: '40px' });
  });
});
