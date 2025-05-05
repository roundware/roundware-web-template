import { render, screen, fireEvent } from '@testing-library/react';
import SpeakerToggle from '@/components/ListenPage/SpeakerToggle';
import { useRoundware } from '@/hooks';
import finalConfig from '@/config';

// Mock the hooks and dependencies
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the config
jest.mock('@/config', () => ({
  features: {
    speakerToggleIds: ['1', '2'],
  },
}));

// Mock CustomMapControl
jest.mock('@/components/ListenPage/Map/CustomControl', () => {
  return function MockCustomMapControl({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-map-control">{children}</div>;
  };
});

// Mock google maps
global.google = {
  maps: {
    ControlPosition: {
      RIGHT_CENTER: 3,
    },
  },
} as any;

describe('SpeakerToggle', () => {
  const mockSetHideSpeakerPolygons = jest.fn();
  const mockSpeaker1 = {
    data: { id: '1' },
    calculatedVolume: 1,
    fadeOutAndStopBufferSource: jest.fn(),
  };
  const mockSpeaker2 = {
    data: { id: '2' },
    calculatedVolume: 0,
    fadeOutAndStopBufferSource: jest.fn(),
  };

  const mockRoundware = {
    mixer: {
      speakerEngine: {
        speakers: [mockSpeaker1, mockSpeaker2],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default useRoundware mock
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      setHideSpeakerPolygons: mockSetHideSpeakerPolygons,
    });
  });

  it('should render with initial state', () => {
    render(<SpeakerToggle />);
    
    // Check if the title is rendered
    expect(screen.getByText('Speakers')).toBeInTheDocument();
    
    // Check if the switch is rendered with correct initial state
    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchElement.checked).toBe(true); // Initial state should be true for second speaker
  });

  it('should toggle speakers when switch is clicked', () => {
    render(<SpeakerToggle />);
    
    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    
    // Toggle switch off
    fireEvent.click(switchElement);
    
    // Check if the correct speaker was faded out
    expect(mockSpeaker2.fadeOutAndStopBufferSource).toHaveBeenCalled();
    
    // Check if polygon visibility was updated
    expect(mockSetHideSpeakerPolygons).toHaveBeenCalledWith([2]);
    
    // Toggle switch on
    fireEvent.click(switchElement);
    
    // Check if polygon visibility was updated again
    expect(mockSetHideSpeakerPolygons).toHaveBeenCalledWith([1]);
  });

  it('should handle speaker volume changes', () => {
    render(<SpeakerToggle />);
    
    // Simulate volume change for speaker 1
    mockSpeaker1.calculatedVolume = 0.5;
    
    // Re-render to trigger effect
    render(<SpeakerToggle />);
    
    // Check if polygon visibility was updated
    expect(mockSetHideSpeakerPolygons).toHaveBeenCalled();
  });

  it('should handle missing speaker engine gracefully', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: null,
        },
      },
      setHideSpeakerPolygons: mockSetHideSpeakerPolygons,
    });

    render(<SpeakerToggle />);
    
    // Component should render without errors
    expect(screen.getByText('Speakers')).toBeInTheDocument();
  });

  it('should handle missing speakers array gracefully', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: null,
          },
        },
      },
      setHideSpeakerPolygons: mockSetHideSpeakerPolygons,
    });

    render(<SpeakerToggle />);
    
    // Component should render without errors
    expect(screen.getByText('Speakers')).toBeInTheDocument();
  });

  it('should update speaker states when config changes', () => {
    // Mock different config
    (finalConfig.features.speakerToggleIds as any) = ['3', '4'];
    
    const mockSpeaker3 = {
      data: { id: '3' },
      calculatedVolume: 1,
      fadeOutAndStopBufferSource: jest.fn(),
    };
    const mockSpeaker4 = {
      data: { id: '4' },
      calculatedVolume: 0,
      fadeOutAndStopBufferSource: jest.fn(),
    };

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: [mockSpeaker3, mockSpeaker4],
          },
        },
      },
      setHideSpeakerPolygons: mockSetHideSpeakerPolygons,
    });

    render(<SpeakerToggle />);
    
    // Check if the switch is rendered with correct initial state
    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchElement.checked).toBe(true); // Initial state should be true for second speaker (id: 4)
  });

  it('should handle empty speaker toggle IDs', () => {
    // Mock empty config
    (finalConfig.features.speakerToggleIds as any) = [];
    
    render(<SpeakerToggle />);
    
    // Component should render without errors
    expect(screen.getByText('Speakers')).toBeInTheDocument();
  });
});
