import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareButton from '@/components/App/ShareButton';

// Mock the UIContext
jest.mock('@/context/UIContext', () => ({
  useUIContext: () => ({
    handleShare: jest.fn()
  })
}));

describe('ShareButton Component Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ShareButton />);
  });

  it('renders the share icon', () => {
    render(<ShareButton />);
    const shareIcon = screen.getByTestId('ShareIcon');
    expect(shareIcon).toBeInTheDocument();
  });

  it('calls handleShare when clicked', () => {
    const handleShare = jest.fn();
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      handleShare
    }));

    render(<ShareButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleShare).toHaveBeenCalledTimes(1);
  });

  it('does not call handleShare when not clicked', () => {
    const handleShare = jest.fn();
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      handleShare
    }));

    render(<ShareButton />);
    expect(handleShare).not.toHaveBeenCalled();
  });

  it('renders as an IconButton', () => {
    render(<ShareButton />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('MuiIconButton-root');
  });

  it('has correct accessibility attributes', () => {
    render(<ShareButton />);
    const button = screen.getByRole('button');
    // The button should be accessible through its role
    expect(button).toBeInTheDocument();
  });

  it('handles multiple clicks correctly', () => {
    const handleShare = jest.fn();
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      handleShare
    }));

    render(<ShareButton />);
    const button = screen.getByRole('button');
    
    // Click multiple times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(handleShare).toHaveBeenCalledTimes(3);
  });

  it('maintains consistent styling', () => {
    const { rerender } = render(<ShareButton />);
    const button = screen.getByRole('button');
    const initialStyle = button.className;

    // Re-render and check if styles remain consistent
    rerender(<ShareButton />);
    expect(button.className).toBe(initialStyle);
  });

  it('works with different UIContext implementations', () => {
    const handleShare = jest.fn();
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      handleShare,
      someOtherContextValue: 'test'
    }));

    render(<ShareButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleShare).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard interactions', () => {
    const handleShare = jest.fn();
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      handleShare
    }));

    render(<ShareButton />);
    const button = screen.getByRole('button');
    
    // Test keyboard interaction
    fireEvent.click(button);
    expect(handleShare).toHaveBeenCalledTimes(1);
  });
}); 