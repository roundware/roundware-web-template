import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhotoPickerMenuItem, PhotoPickerInput } from '@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/PhotoPicker';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ListItemIcon: ({ children }: { children: React.ReactNode }) => <div data-testid="list-item-icon">{children}</div>,
  ListItemText: ({ primary }: { primary: string }) => <div data-testid="list-item-text">{primary}</div>,
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material/Photo', () => () => <span data-testid="photo-icon">📷</span>);

// Mock StyledMenuItem
jest.mock('@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/StyledMenu', () => ({
  StyledMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="styled-menu-item" onClick={onClick}>{children}</div>
  ),
}));

describe('PhotoPicker Components', () => {
  describe('PhotoPickerMenuItem', () => {
    const mockOnSetImage = jest.fn();
    const mockOpenPicker = jest.fn();
    const mockSetAnchorEl = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders with correct structure', () => {
      render(
        <PhotoPickerMenuItem
          onSetImage={mockOnSetImage}
          openPicker={mockOpenPicker}
          setAnchorEl={mockSetAnchorEl}
        />
      );

      expect(screen.getByTestId('styled-menu-item')).toBeInTheDocument();
      expect(screen.getByTestId('list-item-icon')).toBeInTheDocument();
      expect(screen.getByTestId('list-item-text')).toHaveTextContent('Add Photo');
      expect(screen.getByTestId('photo-icon')).toBeInTheDocument();
    });

    it('calls openPicker when clicked', () => {
      render(
        <PhotoPickerMenuItem
          onSetImage={mockOnSetImage}
          openPicker={mockOpenPicker}
          setAnchorEl={mockSetAnchorEl}
        />
      );

      fireEvent.click(screen.getByTestId('styled-menu-item'));
      expect(mockOpenPicker).toHaveBeenCalledTimes(1);
    });
  });

  describe('PhotoPickerInput', () => {
    const mockOnSetImage = jest.fn();
    const mockSetAnchorEl = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders with correct attributes', () => {
      render(
        <PhotoPickerInput
          onSetImage={mockOnSetImage}
          setAnchorEl={mockSetAnchorEl}
        />
      );

      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('accept', 'image/jpeg, image/png, image/gif');
      expect(input).toHaveStyle({ display: 'none' });
    });

    it('handles file selection correctly', () => {
      render(
        <PhotoPickerInput
          onSetImage={mockOnSetImage}
          setAnchorEl={mockSetAnchorEl}
        />
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByDisplayValue('');

      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);

      expect(mockOnSetImage).toHaveBeenCalledWith(file);
      expect(mockSetAnchorEl).toHaveBeenCalledWith(null);
    });

    it('handles empty file selection correctly', () => {
      render(
        <PhotoPickerInput
          onSetImage={mockOnSetImage}
          setAnchorEl={mockSetAnchorEl}
        />
      );

      const input = screen.getByDisplayValue('');
      
      Object.defineProperty(input, 'files', {
        value: [],
      });

      fireEvent.change(input);

      expect(mockOnSetImage).toHaveBeenCalledWith(undefined);
      expect(mockSetAnchorEl).toHaveBeenCalledWith(null);
    });
  });
});
