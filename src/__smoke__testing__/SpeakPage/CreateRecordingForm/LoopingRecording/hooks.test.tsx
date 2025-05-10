import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDimensions } from '@/components/SpeakPage/CreateRecordingForm/LoopingRecording/components/RecordingControls/hooks';

// Test component that uses the hook
const TestComponent = ({ onDimensions }: { onDimensions: (dimensions: ReturnType<typeof useDimensions>) => void }) => {
  const dimensions = useDimensions();
  React.useEffect(() => {
    onDimensions(dimensions);
  }, [dimensions, onDimensions]);
  return null;
};

describe('useDimensions', () => {
  it('returns correct dimensions', () => {
    let capturedDimensions: ReturnType<typeof useDimensions> | null = null;
    render(
      <TestComponent
        onDimensions={(dims) => {
          capturedDimensions = dims;
        }}
      />
    );

    expect(capturedDimensions).toEqual({
      size: 306,
      strokeWidth: 2,
      thumbSize: 11,
      padding: 8,
      svgSize: 322,
      radius: 145,
      circumference: 2 * Math.PI * 145,
      thumbRadius: 146
    });
  });

  it('calculates circumference correctly', () => {
    let dimensions: ReturnType<typeof useDimensions> | null = null;
    render(
      <TestComponent
        onDimensions={(dims) => {
          dimensions = dims;
        }}
      />
    );

    const expectedCircumference = 2 * Math.PI * dimensions!.radius;
    expect(dimensions!.circumference).toBe(expectedCircumference);
  });

  it('ensures padding is sufficient for both thumb and stroke width', () => {
    let dimensions: ReturnType<typeof useDimensions> | null = null;
    render(
      <TestComponent
        onDimensions={(dims) => {
          dimensions = dims;
        }}
      />
    );

    const maxStrokeWidth = 16; // maximum stroke width during recording
    expect(dimensions!.padding).toBeGreaterThanOrEqual(maxStrokeWidth / 2);
    expect(dimensions!.padding).toBeGreaterThanOrEqual(dimensions!.thumbSize / 2);
  });

  it('calculates svg size correctly based on base size and padding', () => {
    let dimensions: ReturnType<typeof useDimensions> | null = null;
    render(
      <TestComponent
        onDimensions={(dims) => {
          dimensions = dims;
        }}
      />
    );

    const expectedSvgSize = dimensions!.size + (dimensions!.padding * 2);
    expect(dimensions!.svgSize).toBe(expectedSvgSize);
  });

  it('calculates thumb radius correctly', () => {
    let dimensions: ReturnType<typeof useDimensions> | null = null;
    render(
      <TestComponent
        onDimensions={(dims) => {
          dimensions = dims;
        }}
      />
    );

    const expectedThumbRadius = dimensions!.radius + dimensions!.strokeWidth / 2;
    expect(dimensions!.thumbRadius).toBe(expectedThumbRadius);
  });
});
