import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ProgressRing from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/ProgressRing';

const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ProgressRing', () => {
  it('renders SVG element with correct dimensions', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="rehearse" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveAttribute('width', '305');
    expect(svg).toHaveAttribute('height', '305');
    expect(svg).toHaveAttribute('viewBox', '-20 -20 345 345');
  });

  it('renders all required circles in rehearse mode', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="rehearse" />);
    const circles = container.querySelectorAll('circle');
    
    // Should have 4 circles in rehearse mode:
    // 1. Outer background circle
    // 2. Outer progress circle
    // 3. Progress indicator dot
    // 4. Inner solid circle
    expect(circles.length).toBe(4);
  });

  it('renders additional circles in recording mode', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="recording" />);
    const circles = container.querySelectorAll('circle');
    
    // Should have 7 circles in recording mode:
    // 4 from rehearse mode plus:
    // 5. Inner background circle
    // 6. Inner progress circle
    // 7. Inner progress indicator dot
    expect(circles.length).toBe(7);
  });

  it('renders additional circles in review mode', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="review" />);
    const circles = container.querySelectorAll('circle');
    
    // Should have 7 circles in review mode (same as recording mode)
    expect(circles.length).toBe(7);
  });

  it('applies correct stroke widths based on mode', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="recording" />);
    const circles = container.querySelectorAll('circle');
    
    // Check outer progress circle stroke width
    const outerProgressCircle = circles[1];
    expect(outerProgressCircle).toHaveAttribute('stroke-width', '14');

    // Check inner progress circle stroke width
    const innerProgressCircle = circles[5];
    expect(innerProgressCircle).toHaveAttribute('stroke-width', '14');
  });

  it('applies correct stroke widths in rehearse mode', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="rehearse" />);
    const circles = container.querySelectorAll('circle');
    
    // Check outer progress circle stroke width
    const outerProgressCircle = circles[1];
    expect(outerProgressCircle).toHaveAttribute('stroke-width', '1');
  });

  it('applies correct colors based on mode', () => {
    const theme = createTheme();
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="recording" />);
    const circles = container.querySelectorAll('circle');
    
    // Check outer background circle color
    const outerBackgroundCircle = circles[0];
    expect(outerBackgroundCircle).toHaveAttribute('stroke', '#fff');

    // Check outer progress circle color
    const outerProgressCircle = circles[1];
    expect(outerProgressCircle).toHaveAttribute('stroke', '#fff');

    // Check inner background circle color
    const innerBackgroundCircle = circles[4];
    expect(innerBackgroundCircle).toHaveAttribute('stroke', '#1976d2');

    // Check inner progress circle color
    const innerProgressCircle = circles[5];
    expect(innerProgressCircle).toHaveAttribute('stroke', '#42a5f5');
  });

  it('applies animation in recording mode', () => {
    const { container } = renderWithTheme(<ProgressRing progress={0.5} mode="recording" />);
    const innerSolidCircle = container.querySelectorAll('circle')[3];
    
    expect(innerSolidCircle).toHaveStyle({
      animation: 'pulse 2s infinite'
    });
  });

  it('calculates correct stroke dash offset based on progress', () => {
    const progress = 0.5;
    const { container } = renderWithTheme(<ProgressRing progress={progress} mode="rehearse" />);
    const circles = container.querySelectorAll('circle');
    
    const circumference = 2 * Math.PI * 152.5; // radius = 152.5
    const expectedOffset = circumference * (1 - progress);
    
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', expectedOffset.toString());
  });

  it('positions thumb correctly based on progress', () => {
    const progress = 0.25; // 90 degrees
    const { container } = renderWithTheme(<ProgressRing progress={progress} mode="rehearse" />);
    const circles = container.querySelectorAll('circle');
    
    // Outer thumb circle (index 2)
    const outerThumb = circles[2];
    const svgSize = 305;
    const radius = 152.5;
    const angle = 2 * Math.PI * progress;
    const expectedX = svgSize / 2 + radius * Math.sin(angle);
    const expectedY = svgSize / 2 - radius * Math.cos(angle);
    
    expect(outerThumb).toHaveAttribute('cx', expectedX.toString());
    expect(outerThumb).toHaveAttribute('cy', expectedY.toString());
  });

  it('positions inner thumb correctly in recording mode', () => {
    const progress = 0.25; // 90 degrees
    const { container } = renderWithTheme(<ProgressRing progress={progress} mode="recording" />);
    const circles = container.querySelectorAll('circle');
    
    // Inner thumb circle (index 6)
    const innerThumb = circles[6];
    const svgSize = 305;
    const innerRadius = 100;
    const angle = 2 * Math.PI * progress;
    const expectedX = svgSize / 2 + innerRadius * Math.sin(angle);
    const expectedY = svgSize / 2 - innerRadius * Math.cos(angle);
    
    expect(innerThumb).toHaveAttribute('cx', expectedX.toString());
    expect(innerThumb).toHaveAttribute('cy', expectedY.toString());
  });

  it('includes pulse animation keyframes', () => {
    render(<ProgressRing progress={0.5} mode="recording" />);
    const styleElement = document.querySelector('style');
    expect(styleElement).toBeInTheDocument();
    const styleContent = styleElement?.textContent || '';
    expect(styleContent).toContain('@keyframes pulse');
    expect(styleContent).toContain('0% {');
    expect(styleContent).toContain('filter: drop-shadow(0 0 8px');
    expect(styleContent).toContain('50% {');
    expect(styleContent).toContain('filter: drop-shadow(0 0 16px');
    expect(styleContent).toContain('100% {');
  });

  it('handles edge case progress values', () => {
    const { container: container0 } = renderWithTheme(<ProgressRing progress={0} mode="rehearse" />);
    const { container: container1 } = renderWithTheme(<ProgressRing progress={1} mode="rehearse" />);
    
    // Test progress = 0
    const circles0 = container0.querySelectorAll('circle');
    const progressCircle0 = circles0[1];
    const circumference0 = 2 * Math.PI * 152.5;
    expect(progressCircle0).toHaveAttribute('stroke-dashoffset', circumference0.toString());
    
    // Test progress = 1
    const circles1 = container1.querySelectorAll('circle');
    const progressCircle1 = circles1[1];
    expect(progressCircle1).toHaveAttribute('stroke-dashoffset', '0');
  });
});
