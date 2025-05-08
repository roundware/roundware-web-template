import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../../components/elements/Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders with title', () => {
    render(
      <Modal open={true} onClose={mockOnClose} title="Test Title">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    const testContent = <div data-testid="test-content">Test Content</div>;
    render(
      <Modal open={true} onClose={mockOnClose}>
        {testContent}
      </Modal>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('shows modal when open prop is true', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('hides modal when open prop is false', () => {
    render(
      <Modal open={false} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByTestId('CloseIcon').parentElement;
    fireEvent.click(closeButton as Element);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledWith(expect.any(Object), 'backdropClick');
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <Modal open={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = document.querySelector('.MuiBackdrop-root');
    fireEvent.click(backdrop as Element);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct spacing in stack layout', () => {
    render(
      <Modal open={true} onClose={mockOnClose} title="Test Title">
        <div>Content</div>
      </Modal>
    );

    const outerStack = screen.getByRole('dialog').querySelector('.MuiStack-root');
    expect(outerStack).toHaveClass('MuiStack-root');
    expect(outerStack?.className).toMatch(/css-/);

    const headerStack = outerStack?.querySelector('.MuiStack-root');
    expect(headerStack).toHaveClass('MuiStack-root');
    expect(headerStack?.className).toMatch(/css-/);
  });

  it('aligns header content correctly', () => {
    render(
      <Modal open={true} onClose={mockOnClose} title="Test Title">
        <div>Content</div>
      </Modal>
    );

    const headerStack = screen.getByRole('dialog').querySelector('.MuiStack-root .MuiStack-root');
    expect(headerStack).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'space-between'
    });
  });

  it('passes through additional Dialog props', () => {
    render(
      <Modal 
        open={true} 
        onClose={mockOnClose}
        maxWidth="sm"
        fullWidth
      >
        <div>Content</div>
      </Modal>
    );

    const dialogPaper = screen.getByRole('dialog');
    expect(dialogPaper).toHaveClass('MuiDialog-paperWidthSm');
    expect(dialogPaper).toHaveClass('MuiDialog-paperFullWidth');
  });
});
