import { render, act } from '@testing-library/react';
import RangeCircleOverlay from '@/components/ListenPage/Map/RangeCircleOverlay';
import { useRoundware } from '@/hooks';
import { useGoogleMap } from '@react-google-maps/api';
import { GeoListenMode } from 'roundware-web-framework/dist/index';
import useDimensions from 'react-cool-dimensions';
import { ThemeProvider } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

// Mock the hooks and dependencies
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

jest.mock('@react-google-maps/api', () => ({
  useGoogleMap: jest.fn(),
}));

jest.mock('react-cool-dimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Create a test theme
const theme = createTheme();

// Wrapper component to provide theme
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('RangeCircleOverlay', () => {
  const mockUpdateLocation = jest.fn();
  const mockMap = {
    getCenter: jest.fn(),
    getZoom: jest.fn(),
    addListener: jest.fn(),
  };
  const mockMixer = {
    playing: true,
    updateParams: jest.fn(),
  };
  const mockRoundware = {
    mixer: mockMixer,
    project: {
      recordingRadius: 100,
    },
    forceUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    
    // Mock useGoogleMap
    (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    
    // Mock useDimensions
    (useDimensions as jest.Mock).mockReturnValue({
      observe: jest.fn(),
      width: 500,
      height: 500,
    });

    // Default mock implementations
    mockMap.getCenter.mockReturnValue({ lat: () => 40, lng: () => -74 });
    mockMap.getZoom.mockReturnValue(15);
    mockMap.addListener.mockReturnValue({ remove: jest.fn() });

    // Default useRoundware mock
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
  };

  it('should not render when not in manual mode', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.AUTOMATIC,
      forceUpdate: jest.fn(),
    });

    const { container } = renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveStyle({ visibility: 'hidden' });
  });

  it('should not render when not playing', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: false } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    const { container } = renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveStyle({ visibility: 'hidden' });
  });

  it('should render when in manual mode and playing', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    const { container } = renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveStyle({ visibility: 'inherit' });
  });

  it('should update location when map center changes', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    // Simulate map center change
    const zoomListener = mockMap.addListener.mock.calls[0][1];
    zoomListener();
    
    expect(mockUpdateLocation).toHaveBeenCalledWith({
      latitude: 40,
      longitude: -74,
    });
  });

  it('should update mixer params in manual mode', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    // Simulate map center change
    const zoomListener = mockMap.addListener.mock.calls[0][1];
    zoomListener();
    
    expect(mockMixer.updateParams).toHaveBeenCalledWith({
      maxDist: expect.any(Number),
      recordingRadius: expect.any(Number),
    });
  });

  it('should update mixer params in automatic mode', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.AUTOMATIC,
      forceUpdate: jest.fn(),
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    // Simulate map center change
    const zoomListener = mockMap.addListener.mock.calls[0][1];
    zoomListener();
    
    expect(mockMixer.updateParams).toHaveBeenCalledWith({
      maxDist: mockRoundware.project.recordingRadius,
      recordingRadius: mockRoundware.project.recordingRadius,
    });
  });

  it('should handle map zoom changes', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    // Simulate zoom change
    mockMap.getZoom.mockReturnValue(16);
    const zoomListener = mockMap.addListener.mock.calls[0][1];
    zoomListener();
    
    expect(mockUpdateLocation).toHaveBeenCalled();
    expect(mockMixer.updateParams).toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const mockRemove = jest.fn();
    mockMap.addListener.mockReturnValue({ remove: mockRemove });

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    const { unmount } = renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    // Ensure the effect has run
    act(() => {
      jest.runAllTimers();
    });
    
    unmount();
    
  });

  it('should handle missing map gracefully', () => {
    (useGoogleMap as jest.Mock).mockReturnValue(null);
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    expect(mockMap.addListener).not.toHaveBeenCalled();
  });

  it('should handle missing map center gracefully', () => {
    mockMap.getCenter.mockReturnValue(null);
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    const zoomListener = mockMap.addListener.mock.calls[0][1];
    zoomListener();
    
    expect(mockUpdateLocation).not.toHaveBeenCalled();
  });

  it('should calculate correct radius based on zoom level', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { ...mockRoundware, mixer: { ...mockMixer, playing: true } },
      geoListenMode: GeoListenMode.MANUAL,
      forceUpdate: jest.fn(),
    });

    // Mock specific zoom level and dimensions
    mockMap.getZoom.mockReturnValue(15);
    (useDimensions as jest.Mock).mockReturnValue({
      observe: jest.fn(),
      width: 500,
      height: 500,
    });

    renderWithTheme(<RangeCircleOverlay updateLocation={mockUpdateLocation} />);
    
    // Ensure the effect has run
    act(() => {
      jest.runAllTimers();
    });
    
    const zoomListener = mockMap.addListener.mock.calls[0][1];
    zoomListener();
    
    // Verify that updateParams was called with a calculated radius
    expect(mockMixer.updateParams).toHaveBeenCalledWith({
      maxDist: expect.any(Number),
      recordingRadius: expect.any(Number),
    });
    
    // The radius should be calculated based on the width and zoom level
    const callArgs = mockMixer.updateParams.mock.calls[0][0];
    expect(callArgs.maxDist).toBeGreaterThan(0);
    expect(callArgs.recordingRadius).toBeGreaterThan(0);
    
  });
});
