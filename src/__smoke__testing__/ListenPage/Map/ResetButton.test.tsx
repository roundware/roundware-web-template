import { render, screen, fireEvent } from '@testing-library/react';
import { useGoogleMap } from '@react-google-maps/api';
import { useRoundware } from '@/hooks';
import { GeoListenMode } from 'roundware-web-framework/dist/index';
import ResetButton from '@/components/ListenPage/Map/ResetButton';
import config from '@/config';
import '@testing-library/jest-dom';

// Mock the hooks and dependencies
jest.mock('@react-google-maps/api', () => ({
  useGoogleMap: jest.fn(),
}));

jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

describe('ResetButton', () => {
  const mockUpdateLocation = jest.fn();
  const mockMap = {
    setZoom: jest.fn(),
  };
  const mockProjectLocation = { lat: 40.7128, lng: -74.0060 };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        project: {
          location: mockProjectLocation,
        },
      },
      geoListenMode: GeoListenMode.MANUAL,
    });
  });

  it('should not render when geoListenMode is not MANUAL', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        project: {
          location: mockProjectLocation,
        },
      },
      geoListenMode: GeoListenMode.AUTOMATIC,
    });

    const { container } = render(<ResetButton updateLocation={mockUpdateLocation} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when geoListenMode is MANUAL', () => {
    render(<ResetButton updateLocation={mockUpdateLocation} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have correct styling', () => {
    render(<ResetButton updateLocation={mockUpdateLocation} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveStyle({
      position: 'fixed',
      zIndex: 100,
      right: '20px',
      bottom: '68px',
      backgroundColor: '#cccccc',
    });
  });

  it('should call setZoom and updateLocation when clicked', () => {
    render(<ResetButton updateLocation={mockUpdateLocation} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    expect(mockMap.setZoom).toHaveBeenCalledWith(config.map.zoom.low);
    expect(mockUpdateLocation).toHaveBeenCalledWith(mockProjectLocation);
  });

  it('should not call setZoom or updateLocation when map is not available', () => {
    (useGoogleMap as jest.Mock).mockReturnValue(null);
    
    render(<ResetButton updateLocation={mockUpdateLocation} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    expect(mockMap.setZoom).not.toHaveBeenCalled();
    expect(mockUpdateLocation).not.toHaveBeenCalled();
  });

  it('should render ZoomOutMapIcon', () => {
    render(<ResetButton updateLocation={mockUpdateLocation} />);
    const icon = screen.getByTestId('ZoomOutMapIcon');
    expect(icon).toBeInTheDocument();
  });
});
