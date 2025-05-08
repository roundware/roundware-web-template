import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationDialog from '../../components/elements/ConfirmationDialog';
import ReplayIcon from '@mui/icons-material/Replay';
import LogoutIcon from '@mui/icons-material/Logout';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Dialog: ({ children, open, onClose }: any) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  Stack: ({ children, spacing }: { children: React.ReactNode; spacing?: number }) => (
    <div data-testid="stack">{children}</div>
  ),
  Typography: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid={`typography-${variant}`}>{children}</div>
  ),
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button data-testid={`button-${variant}`} onClick={onClick}>{children}</button>
  ),
  IconButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="icon-button" onClick={onClick}>{children}</button>
  ),
  Box: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="box">{children}</div>
  ),
  Container: ({ children, maxWidth }: { children: React.ReactNode; maxWidth?: string }) => (
    <div data-testid="container">{children}</div>
  )
}));

describe('ConfirmationDialog Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    description: 'Test Description',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(<ConfirmationDialog {...defaultProps} open={false} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders title and description correctly', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByTestId('typography-h4')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('typography-subtitle1')).toHaveTextContent('Test Description');
  });

  it('renders confirm and cancel buttons with correct text', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByTestId('button-contained')).toHaveTextContent('Confirm');
    expect(screen.getByTestId('button-text')).toHaveTextContent('Cancel');
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-contained'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-text'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close icon is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('icon-button'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom icon when provided', () => {
    render(<ConfirmationDialog {...defaultProps} icon={<ReplayIcon data-testid="custom-icon" />} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders without cancel text when not provided', () => {
    const { cancelText, ...propsWithoutCancel } = defaultProps;
    render(<ConfirmationDialog {...propsWithoutCancel} />);
    
    const cancelButton = screen.getByTestId('button-text');
    expect(cancelButton).toHaveTextContent('');
  });

  it('renders with different icon', () => {
    render(<ConfirmationDialog {...defaultProps} icon={<LogoutIcon data-testid="logout-icon" />} />);
    
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  it('renders with multiline description', () => {
    const multilineDescription = 'Line 1\nLine 2\nLine 3';
    render(<ConfirmationDialog {...defaultProps} description={multilineDescription} />);
    
    const description = screen.getByTestId('typography-subtitle1');
    expect(description.textContent).toBe(multilineDescription);
  });
});
