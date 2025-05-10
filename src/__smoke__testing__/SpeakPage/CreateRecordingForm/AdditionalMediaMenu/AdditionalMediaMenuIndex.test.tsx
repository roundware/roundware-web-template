import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdditionalMediaMenu from '@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu';
import { useMediaQuery, useTheme } from '@mui/material';
import config from '@/config';

// Mock Material-UI hooks
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
  useTheme: jest.fn(() => ({
    breakpoints: {
      down: jest.fn(),
    },
  })),
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  IconButton: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Badge: ({ children, badgeContent }: { children: React.ReactNode; badgeContent: number }) => (
    <div data-badge={badgeContent}>{children}</div>
  ),
  Menu: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="menu">{children}</div> : null
  ),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material/Photo', () => () => <span data-testid="photo-icon">📷</span>);
jest.mock('@mui/icons-material/TextFields', () => () => <span data-testid="text-icon">T</span>);

// Mock config
jest.mock('@/config', () => ({
  speak: {
    allowPhotos: true,
    allowText: true,
  },
}));

// Mock child components
jest.mock('@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/PhotoPicker', () => ({
  PhotoPickerMenuItem: ({ openPicker }: { openPicker: () => void }) => (
    <button onClick={openPicker} data-testid="photo-picker-menu-item">Add Photo</button>
  ),
  PhotoPickerInput: ({ onSetImage }: { onSetImage: (file: File) => void }) => (
    <input type="file" data-testid="photo-picker-input" onChange={(e) => e.target.files?.[0] && onSetImage(e.target.files[0])} />
  ),
}));

jest.mock('@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/TextInput', () => ({
  TextInputMenuItem: () => <button data-testid="text-input-menu-item">Add Text</button>,
  TextInputDialog: () => <div data-testid="text-input-dialog">Text Input Dialog</div>,
}));

jest.mock('@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/ContactInfo', () => () => (
  <button data-testid="contact-info">Contact Info</button>
));

describe('AdditionalMediaMenu', () => {
  const mockOnSetText = jest.fn();
  const mockOnSetImage = jest.fn();
  const defaultProps = {
    onSetText: mockOnSetText,
    onSetImage: mockOnSetImage,
    imageAssets: [],
    textAsset: '',
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Default to desktop view
  });

  describe('when both photos and text are allowed', () => {
    beforeEach(() => {
      config.speak.allowPhotos = true;
      config.speak.allowText = true;
    });

    it('should render Add Media button with both icons', () => {
      render(<AdditionalMediaMenu {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /Add Media/i });
      expect(button).toBeInTheDocument();
      
      const photoIcon = screen.getByTestId('photo-icon');
      const textIcon = screen.getByTestId('text-icon');
      expect(photoIcon).toBeInTheDocument();
      expect(textIcon).toBeInTheDocument();
    });

    it('should show badge count for images', () => {
      render(<AdditionalMediaMenu {...defaultProps} imageAssets={[new File([], 'test.jpg')]} />);
      
      const button = screen.getByRole('button', { name: /Add Media/i });
      expect(button).toHaveTextContent('1');
    });

    it('should show menu when button is clicked', () => {
      render(<AdditionalMediaMenu {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /Add Media/i });
      fireEvent.click(button);
      
      expect(screen.getByTestId('photo-picker-menu-item')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-menu-item')).toBeInTheDocument();
      expect(screen.getByTestId('contact-info')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<AdditionalMediaMenu {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button', { name: /Add Media/i });
      expect(button).toBeDisabled();
    });

    it('should show "Add" text on small screens', () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true); // Small screen
      
      render(<AdditionalMediaMenu {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /Add/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveTextContent('Media');
    });
  });

  describe('when only photos are allowed', () => {
    beforeEach(() => {
      config.speak.allowPhotos = true;
      config.speak.allowText = false;
    });

    it('should render Add Photo button only', () => {
      render(<AdditionalMediaMenu {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /Add Photo/i });
      expect(button).toBeInTheDocument();
      
      const photoIcon = screen.getByTestId('photo-icon');
      expect(photoIcon).toBeInTheDocument();
      expect(screen.queryByTestId('text-icon')).not.toBeInTheDocument();
    });

    it('should show badge count for images', () => {
      render(<AdditionalMediaMenu {...defaultProps} imageAssets={[new File([], 'test.jpg')]} />);
      
      const button = screen.getByRole('button', { name: /Add Photo/i });
      expect(button).toHaveTextContent('1');
    });
  });

  describe('when only text is allowed', () => {
    beforeEach(() => {
      config.speak.allowPhotos = false;
      config.speak.allowText = true;
    });

    it('should render Add Text button only', () => {
      render(<AdditionalMediaMenu {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /Add Text/i });
      expect(button).toBeInTheDocument();
      
      const textIcon = screen.getByTestId('text-icon');
      expect(textIcon).toBeInTheDocument();
      expect(screen.queryByTestId('photo-icon')).not.toBeInTheDocument();
    });

    it('should open text input dialog when clicked', () => {
      render(<AdditionalMediaMenu {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /Add Text/i });
      fireEvent.click(button);
      
      expect(screen.getByTestId('text-input-dialog')).toBeInTheDocument();
    });
  });
});
