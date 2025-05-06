import { render, screen } from '@testing-library/react';
import OutOfRangeMessage, { normalizeCoords, coordsToPoints } from '@/components/ListenPage/Map/OutOfRangeMessage';
import { useRoundware } from '@/hooks';
import { Feature, Point } from '@turf/helpers';
import pointToLine from '@turf/point-to-line-distance';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import polygonToLineString from '@turf/polygon-to-line';

// Mock the turf functions
jest.mock('@turf/point-to-line-distance', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@turf/boolean-point-in-polygon', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@turf/polygon-to-line', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

describe('OutOfRangeMessage', () => {
  // Test coordinate normalization
  describe('normalizeCoords', () => {
    it('should normalize coordinates within range', () => {
      expect(normalizeCoords([-90, 45])).toEqual([-90, 45]);
    });

    it('should normalize coordinates above 180', () => {
      expect(normalizeCoords([200, 45])).toEqual([-160, 45]);
    });

    it('should normalize coordinates below -180', () => {
      expect(normalizeCoords([-200, 45])).toEqual([160, 45]);
    });
  });

  // Test coordinate to point conversion
  describe('coordsToPoints', () => {
    it('should convert coordinates to a Point feature', () => {
      const result = coordsToPoints({ latitude: 45, longitude: -90 });
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Point');
      expect(result.geometry.coordinates).toEqual([-90, 45]);
    });

    it('should normalize coordinates when converting to point', () => {
      const result = coordsToPoints({ latitude: 45, longitude: 200 });
      expect(result.geometry.coordinates).toEqual([-160, 45]);
    });
  });

  // Test component rendering
  describe('OutOfRangeMessage component', () => {
    const mockRoundware = {
      project: {
        data: {
          out_of_range_message: 'You are out of range',
        },
        outOfRangeDistance: 100,
      },
      mixer: {
        mixParams: {
          listenerPoint: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
        },
      },
      speakers: jest.fn(),
    };

    beforeEach(() => {
      (useRoundware as jest.Mock).mockReturnValue({ roundware: mockRoundware });
      // Reset all mocks before each test
      jest.clearAllMocks();
      // Default mock implementations
      (booleanPointInPolygon as jest.Mock).mockReturnValue(false);
      (pointToLine as jest.Mock).mockReturnValue(150);
      (polygonToLineString as jest.Mock).mockReturnValue({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]
          }
        }]
      });
    });

    it('should not show message when out_of_range_message is not set', () => {
      const roundwareWithoutMessage = {
        ...mockRoundware,
        project: {
          ...mockRoundware.project,
          data: { out_of_range_message: null },
        },
      };
      (useRoundware as jest.Mock).mockReturnValue({ roundware: roundwareWithoutMessage });

      render(<OutOfRangeMessage />);
      expect(screen.queryByText('You are out of range')).not.toBeInTheDocument();
    });

    it('should not show message when outOfRangeDistance is not set', () => {
      const roundwareWithoutDistance = {
        ...mockRoundware,
        project: {
          ...mockRoundware.project,
          outOfRangeDistance: null,
        },
      };
      (useRoundware as jest.Mock).mockReturnValue({ roundware: roundwareWithoutDistance });

      render(<OutOfRangeMessage />);
      expect(screen.queryByText('You are out of range')).not.toBeInTheDocument();
    });

    it('should not show message when listener location is not set', () => {
      const roundwareWithoutListener = {
        ...mockRoundware,
        mixer: {
          mixParams: {
            listenerPoint: null,
          },
        },
      };
      (useRoundware as jest.Mock).mockReturnValue({ roundware: roundwareWithoutListener });

      render(<OutOfRangeMessage />);
      expect(screen.queryByText('You are out of range')).not.toBeInTheDocument();
    });

    it('should not show message when outOfRangeDistance is 0 or negative', () => {
      const roundwareWithZeroDistance = {
        ...mockRoundware,
        project: {
          ...mockRoundware.project,
          outOfRangeDistance: 0,
        },
      };
      (useRoundware as jest.Mock).mockReturnValue({ roundware: roundwareWithZeroDistance });

      render(<OutOfRangeMessage />);
      expect(screen.queryByText('You are out of range')).not.toBeInTheDocument();
    });

    it('should show message when listener is out of range', () => {
      // Mock speakers that are far from the listener
      mockRoundware.speakers.mockReturnValue([
        {
          shape: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]],
            },
          },
        },
      ]);

      // Mock the pointToLine function to return a distance greater than outOfRangeDistance
      (pointToLine as jest.Mock).mockReturnValue(150);
      // Mock booleanPointInPolygon to return false (point is not in polygon)
      (booleanPointInPolygon as jest.Mock).mockReturnValue(false);
      // Mock polygonToLineString to return a line string
      (polygonToLineString as jest.Mock).mockReturnValue({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]
          }
        }]
      });

      render(<OutOfRangeMessage />);
      expect(screen.getByText('You are out of range')).toBeInTheDocument();
    });

    it('should not show message when listener is in range of a speaker', () => {
      // Mock speakers that include the listener's location
      mockRoundware.speakers.mockReturnValue([
        {
          shape: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-1, -1], [-1, 1], [1, 1], [1, -1], [-1, -1]]],
            },
          },
        },
      ]);

      // Mock booleanPointInPolygon to return true (point is in polygon)
      (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

      render(<OutOfRangeMessage />);
      expect(screen.queryByText('You are out of range')).not.toBeInTheDocument();
    });
  });
});
