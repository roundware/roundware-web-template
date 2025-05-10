import React from 'react';
import { render, act } from '@testing-library/react';
import { Marker, useGoogleMap } from '@react-google-maps/api';
import LocationSelectMarker from '../../../components/SpeakPage/LocationSelectForm/LocationSelectMarker';
import { useRoundwareDraft } from '../../../hooks';

// Mock the hooks and components
jest.mock('@react-google-maps/api', () => ({
  Marker: jest.fn(() => null),
  useGoogleMap: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  useRoundwareDraft: jest.fn(),
}));

describe('LocationSelectMarker', () => {
  const mockSetLocation = jest.fn();
  const mockMap = {
    panTo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useGoogleMap hook
    (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    
    // Mock useRoundwareDraft hook
    (useRoundwareDraft as jest.Mock).mockReturnValue({
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
      setLocation: mockSetLocation,
    });
  });

  it('renders Marker component with correct props', () => {
    render(<LocationSelectMarker />);
    
    expect(Marker).toHaveBeenCalledWith(
      expect.objectContaining({
        draggable: true,
        position: {
          lat: 40.7128,
          lng: -74.0060,
        },
      }),
      expect.any(Object)
    );
  });

  it('handles marker drag end correctly', () => {
    render(<LocationSelectMarker />);
    
    const markerProps = ((Marker as unknown) as jest.Mock).mock.calls[0][0];
    const mockEvent = {
      latLng: {
        lat: () => 41.7128,
        lng: () => -75.0060,
      },
    };

    act(() => {
      markerProps.onDragEnd(mockEvent);
    });

    expect(mockSetLocation).toHaveBeenCalledWith({
      latitude: 41.7128,
      longitude: -75.0060,
    });
  });

  it('does not update location when latLng is undefined', () => {
    render(<LocationSelectMarker />);
    
    const markerProps = ((Marker as unknown) as jest.Mock).mock.calls[0][0];
    const mockEvent = {
      latLng: undefined,
    };

    act(() => {
      markerProps.onDragEnd(mockEvent);
    });

    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('pans map when location changes', () => {
    render(<LocationSelectMarker />);
    
    expect(mockMap.panTo).toHaveBeenCalledWith({
      lat: 40.7128,
      lng: -74.0060,
    });
  });

  it('handles zero coordinates correctly', () => {
    (useRoundwareDraft as jest.Mock).mockReturnValue({
      location: {
        latitude: 0,
        longitude: 0,
      },
      setLocation: mockSetLocation,
    });

    render(<LocationSelectMarker />);
    
    expect(Marker).toHaveBeenCalledWith(
      expect.objectContaining({
        position: {
          lat: 0,
          lng: 0,
        },
      }),
      expect.any(Object)
    );
  });

  it('does not pan map when map is null', () => {
    (useGoogleMap as jest.Mock).mockReturnValue(null);
    
    render(<LocationSelectMarker />);
    
    expect(mockMap.panTo).not.toHaveBeenCalled();
  });
});
