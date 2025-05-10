import { render, screen } from '@testing-library/react';
import SpeakerImages from '@/components/ListenPage/Map/Speakers/SpeakerImages';
import { useRoundware } from '@/hooks';

// Mock the image import
jest.mock('@/assets/speaker.png', () => 'mock-speaker-image');

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the Google Maps components
jest.mock('@react-google-maps/api', () => ({
  GroundOverlay: ({ bounds, url, options }: any) => (
    <div data-testid="ground-overlay" data-bounds={JSON.stringify(bounds)} data-url={url} data-opacity={options?.opacity} />
  ),
}));

// Mock the @turf/helpers functions
jest.mock('@turf/helpers', () => ({
  polygon: jest.fn().mockImplementation((coordinates) => ({
    geometry: {
      coordinates: [coordinates]
    }
  })),
  point: jest.fn().mockImplementation((coordinates) => ({
    geometry: {
      coordinates
    }
  }))
}));

// Mock other @turf functions
jest.mock('@turf/center-of-mass', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    geometry: {
      coordinates: [-74.0055, 40.71285]
    }
  }))
}));

jest.mock('@turf/midpoint', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    geometry: {
      coordinates: [-74.0055, 40.71285]
    }
  }))
}));

jest.mock('@turf/distance', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(0.001)
}));

jest.mock('@turf/destination', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    geometry: {
      coordinates: [-74.0055, 40.71285]
    }
  }))
}));

describe('SpeakerImages', () => {
  const mockSpeakers = [
    {
      id: 1,
      shape: {
        coordinates: [
          [
            [-74.006, 40.7128],
            [-74.006, 40.7129],
            [-74.005, 40.7129],
            [-74.005, 40.7128],
            [-74.006, 40.7128]
          ]
        ]
      }
    },
    {
      id: 2,
      shape: {
        coordinates: [
          [
            [-74.004, 40.7128],
            [-74.004, 40.7129],
            [-74.003, 40.7129],
            [-74.003, 40.7128],
            [-74.004, 40.7128]
          ]
        ]
      }
    }
  ];

  beforeEach(() => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        speakers: () => mockSpeakers,
      },
      hideSpeakerPolygons: [],
    });
  });

  it('renders without crashing', () => {
    render(<SpeakerImages />);
    const overlays = screen.getAllByTestId('ground-overlay');
    expect(overlays).toHaveLength(mockSpeakers.length);
  });

  it('handles empty speakers array', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        speakers: () => [],
      },
      hideSpeakerPolygons: [],
    });
    render(<SpeakerImages />);
    const overlays = screen.queryAllByTestId('ground-overlay');
    expect(overlays).toHaveLength(0);
  });

  it('handles speakers without shape property', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        speakers: () => [{ id: 1 }, { id: 2 }],
      },
      hideSpeakerPolygons: [],
    });
    render(<SpeakerImages />);
    const overlays = screen.queryAllByTestId('ground-overlay');
    expect(overlays).toHaveLength(0);
  });

  it('filters out hidden speakers', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        speakers: () => mockSpeakers,
      },
      hideSpeakerPolygons: [1],
    });
    render(<SpeakerImages />);
    const overlays = screen.getAllByTestId('ground-overlay');
    expect(overlays).toHaveLength(1);
  });

  it('applies correct opacity to overlays', () => {
    render(<SpeakerImages />);
    const overlays = screen.getAllByTestId('ground-overlay');
    overlays.forEach(overlay => {
      expect(overlay).toHaveAttribute('data-opacity', '0.2');
    });
  });

  it('uses correct image URL for overlays', () => {
    render(<SpeakerImages />);
    const overlays = screen.getAllByTestId('ground-overlay');
    overlays.forEach(overlay => {
      expect(overlay).toHaveAttribute('data-url', 'mock-speaker-image');
    });
  });

  it('calculates correct bounds for overlays', () => {
    render(<SpeakerImages />);
    const overlays = screen.getAllByTestId('ground-overlay');
    overlays.forEach(overlay => {
      const bounds = JSON.parse(overlay.getAttribute('data-bounds') || '{}');
      expect(bounds).toHaveProperty('north');
      expect(bounds).toHaveProperty('south');
      expect(bounds).toHaveProperty('east');
      expect(bounds).toHaveProperty('west');
    });
  });

  it('sorts speakers by ID in descending order', () => {
    render(<SpeakerImages />);
    const overlays = screen.getAllByTestId('ground-overlay');
    const bounds = JSON.parse(overlays[0].getAttribute('data-bounds') || '{}');
    // The first speaker should be the one with ID 2 since we sort in descending order
    expect(bounds.north).toBeCloseTo(40.71285);
    expect(bounds.south).toBeCloseTo(40.71285);
    expect(bounds.east).toBeCloseTo(-74.0035);
    expect(bounds.west).toBeCloseTo(-74.0035);
  });
}); 