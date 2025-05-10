import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CountdownTimer from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/CountdownTimer';

// Mock the LoopContext
jest.mock('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext', () => ({
  useLoopContext: () => ({
    recorder: {
      startingRecordingInSeconds: 3
    }
  })
}));

describe('CountdownTimer', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    const theme = createTheme();
    return render(
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    );
  };

  it('renders the countdown number', () => {
    renderWithTheme(<CountdownTimer />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies animation styles', () => {
    renderWithTheme(<CountdownTimer />);
    const timerElement = screen.getByText('3');
    
    // Check essential styles
    const styles = window.getComputedStyle(timerElement);
    expect(styles.color).toBe('white');
    expect(styles.display).toBe('inline-block');
    expect(styles.animation).toMatch(/1s ease-in-out infinite/);
  });

  it('displays different countdown numbers', () => {
    // Mock different countdown values
    jest.spyOn(require('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext'), 'useLoopContext')
      .mockReturnValueOnce({
        recorder: {
          startingRecordingInSeconds: 5
        }
      });

    renderWithTheme(<CountdownTimer />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('rounds decimal numbers correctly', () => {
    // Mock a decimal value
    jest.spyOn(require('@/components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopContext'), 'useLoopContext')
      .mockReturnValueOnce({
        recorder: {
          startingRecordingInSeconds: 2.7
        }
      });

    renderWithTheme(<CountdownTimer />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
