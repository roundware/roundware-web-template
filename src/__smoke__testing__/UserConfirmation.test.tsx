import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserConfirmation from '../components/UserConfirmation';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('UserConfirmation Component', () => {
  const mockMessage = {
    message: 'Are you sure you want to leave this page?',
    stay: 'Stay',
    leave: 'Leave'
  };
  const mockCallback = jest.fn();

  beforeEach(() => {
    mockCallback.mockClear();
    // Clean up any existing dialogs
    const existingDialogs = document.querySelectorAll('[custom-confirmation-navigation]');
    existingDialogs.forEach(dialog => dialog.remove());
  });

  afterEach(() => {
    cleanup();
  });

  it('renders dialog with correct title', () => {
    UserConfirmation(JSON.stringify(mockMessage), mockCallback);
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Warning');
  });

  it('renders message content correctly', () => {
    UserConfirmation(JSON.stringify(mockMessage), mockCallback);
    const contentElements = screen.getAllByTestId('dialog-content');
    expect(contentElements[0]).toHaveTextContent(mockMessage.message);
  });

  it('renders stay and leave buttons with correct text', () => {
    UserConfirmation(JSON.stringify(mockMessage), mockCallback);
    const stayButtons = screen.getAllByText(mockMessage.stay);
    const leaveButtons = screen.getAllByText(mockMessage.leave);
    expect(stayButtons[0]).toBeInTheDocument();
    expect(leaveButtons[0]).toBeInTheDocument();
  });

  it('calls callback with false when stay button is clicked', () => {
    UserConfirmation(JSON.stringify(mockMessage), mockCallback);
    const stayButtons = screen.getAllByText(mockMessage.stay);
    fireEvent.click(stayButtons[0]);
    expect(mockCallback).toHaveBeenCalledWith(false);
  });

  it('calls callback with true when leave button is clicked', () => {
    UserConfirmation(JSON.stringify(mockMessage), mockCallback);
    const leaveButtons = screen.getAllByText(mockMessage.leave);
    fireEvent.click(leaveButtons[0]);
    expect(mockCallback).toHaveBeenCalledWith(true);
  });
});
