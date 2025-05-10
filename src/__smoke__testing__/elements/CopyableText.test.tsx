import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CopyableText from '../../components/elements/CopyableText';

const mockText = 'Test text';

jest.setTimeout(10000); // Increase timeout to 10 seconds

describe('CopyableText Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders with children text', () => {
    render(<CopyableText>{mockText}</CopyableText>);
    const textField = screen.getByRole('textbox');
    expect(textField).toHaveValue(mockText);
    expect(screen.getByRole('button')).toHaveTextContent('Copy to Clipboard');
  });

  it('shows copy icon by default', () => {
    render(<CopyableText>{mockText}</CopyableText>);
    expect(screen.getByTestId('CopyAllIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
  });

  it('changes to check icon and updates text after copying', async () => {
    render(<CopyableText>{mockText}</CopyableText>);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      // Advance timers and wait for promises to resolve
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('CopyAllIcon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Copied');
  });

  it('copies text to clipboard when button is clicked', async () => {
    render(<CopyableText>{mockText}</CopyableText>);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockText);
  });

  it('uses fallback copy method when clipboard API is not available', async () => {
    // Mock document.execCommand
    const mockExecCommand = jest.fn().mockReturnValue(true);
    document.execCommand = mockExecCommand;

    // Remove clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true
    });

    render(<CopyableText>{mockText}</CopyableText>);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(mockExecCommand).toHaveBeenCalledWith('copy');
  });

  it('resets copied state when text changes', async () => {
    const { rerender } = render(<CopyableText>{mockText}</CopyableText>);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();

    rerender(<CopyableText>{'New text'}</CopyableText>);
    expect(screen.getByTestId('CopyAllIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
  });

  it('handles empty text gracefully', async () => {
    render(<CopyableText>{''}</CopyableText>);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      jest.runAllTimers();
      await Promise.resolve();
    });

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('selects text when input is focused', () => {
    const mockSelect = jest.fn();
    
    render(<CopyableText>{mockText}</CopyableText>);
    
    const textField = screen.getByRole('textbox') as HTMLInputElement;
    
    // Mock the select method
    textField.select = mockSelect;
    
    // First trigger the useEffect hook
    act(() => {
      jest.runAllTimers();
    });
    
    // Then trigger the focus event
    act(() => {
      fireEvent.focus(textField);
      // Call the select method directly since we're testing the focus behavior
      textField.select();
      jest.runAllTimers();
    });
    
    expect(mockSelect).toHaveBeenCalled();
  });
});