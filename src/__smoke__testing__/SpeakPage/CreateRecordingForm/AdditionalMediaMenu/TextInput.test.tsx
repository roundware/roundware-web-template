import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextInputDialog, TextInputMenuItem } from '@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/TextInput';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <div data-testid="dialog-content" style={style}>{children}</div>
  ),
  DialogActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-actions">{children}</div>
  ),
  TextField: ({ onBlur, defaultValue }: { onBlur?: (e: any) => void; defaultValue?: string }) => (
    <input
      data-testid="text-field"
      defaultValue={defaultValue}
      onBlur={onBlur}
    />
  ),
  Button: ({ children, onClick, color }: { children: React.ReactNode; onClick?: () => void; color?: string }) => (
    <button data-testid={`button-${color}`} onClick={onClick}>{children}</button>
  ),
  ListItemIcon: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="list-item-icon">{children}</div>
  ),
  ListItemText: ({ primary }: { primary: string }) => (
    <div data-testid="list-item-text">{primary}</div>
  ),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material/TextFields', () => () => <span data-testid="text-icon">T</span>);

// Mock StyledMenuItem
jest.mock('@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/StyledMenu', () => ({
  StyledMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="styled-menu-item" onClick={onClick}>{children}</div>
  ),
}));

// Create a theme for testing
const theme = createTheme();

describe('TextInput Components', () => {
  const defaultProps = {
    textAsset: '',
    addTextModalOpen: false,
    isExtraSmallScreen: false,
    setAnchorEl: jest.fn(),
    onSetText: jest.fn(),
    setAddTextModalOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TextInputDialog', () => {
    it('renders when open is true', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputDialog {...defaultProps} addTextModalOpen={true} />
        </ThemeProvider>
      );

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-actions')).toBeInTheDocument();
      expect(screen.getByTestId('text-field')).toBeInTheDocument();
      expect(screen.getByTestId('button-primary')).toBeInTheDocument();
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputDialog {...defaultProps} addTextModalOpen={false} />
        </ThemeProvider>
      );

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('handles text input blur', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputDialog {...defaultProps} addTextModalOpen={true} />
        </ThemeProvider>
      );

      const textField = screen.getByTestId('text-field');
      fireEvent.blur(textField, { target: { value: 'Test text' } });

      expect(defaultProps.onSetText).toHaveBeenCalledWith('Test text');
    });

    it('handles button clicks', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputDialog {...defaultProps} addTextModalOpen={true} />
        </ThemeProvider>
      );

      const submitButton = screen.getByTestId('button-primary');
      const cancelButton = screen.getByTestId('button-secondary');

      fireEvent.click(submitButton);
      expect(defaultProps.setAddTextModalOpen).toHaveBeenCalledWith(false);
      expect(defaultProps.setAnchorEl).toHaveBeenCalledWith(null);

      fireEvent.click(cancelButton);
      expect(defaultProps.setAddTextModalOpen).toHaveBeenCalledWith(false);
      expect(defaultProps.setAnchorEl).toHaveBeenCalledWith(null);
    });

    it('applies correct width based on screen size', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputDialog {...defaultProps} addTextModalOpen={true} isExtraSmallScreen={true} />
        </ThemeProvider>
      );

      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toHaveStyle({ width: '254px' });
    });
  });

  describe('TextInputMenuItem', () => {
    it('renders menu item with correct structure', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputMenuItem {...defaultProps} />
        </ThemeProvider>
      );

      expect(screen.getByTestId('styled-menu-item')).toBeInTheDocument();
      expect(screen.getByTestId('list-item-icon')).toBeInTheDocument();
      expect(screen.getByTestId('list-item-text')).toHaveTextContent('Add Text');
      expect(screen.getByTestId('text-icon')).toBeInTheDocument();
    });

    it('opens dialog when clicked', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputMenuItem {...defaultProps} />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('styled-menu-item'));
      expect(defaultProps.setAddTextModalOpen).toHaveBeenCalledWith(true);
    });

    it('renders dialog with correct props', () => {
      render(
        <ThemeProvider theme={theme}>
          <TextInputMenuItem {...defaultProps} addTextModalOpen={true} />
        </ThemeProvider>
      );

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('text-field')).toBeInTheDocument();
    });
  });
});
