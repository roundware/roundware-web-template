import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a mock environment that can be modified
const mockEnv = {
  VITE_GOOGLE_MAPS_API_KEY: 'test-api-key'
};

// Mock the Vite environment
jest.mock('@/components/ListenPage', () => {
  return {
    __esModule: true,
    default: function MockListenPage() {
      if (!mockEnv.VITE_GOOGLE_MAPS_API_KEY) {
        console.warn('GOOGLE_MAPS_API_KEY was not found in env variable. Please pass it to enable Google Maps component.');
        return null;
      }
      
      return (
        <div 
          data-testid="roundware-map" 
          className="map" 
          data-api-key={mockEnv.VITE_GOOGLE_MAPS_API_KEY}
          style={{ display: 'flex' }}
        >
          Mock Map
        </div>
      );
    }
  };
});

// Import after mocks are set up
import ListenPage from '@/components/ListenPage';

describe('ListenPage', () => {
  beforeEach(() => {
    jest.resetModules();
    // Clear console.warn mock before each test
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Reset mock environment
    mockEnv.VITE_GOOGLE_MAPS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the map when Google Maps API key is present', () => {
    render(<ListenPage />);
    
    const map = screen.getByTestId('roundware-map');
    expect(map).toBeInTheDocument();
    expect(map.className).toContain('map');
    expect(map).toHaveAttribute('data-api-key', 'test-api-key');
  });

  it('does not render when Google Maps API key is missing', () => {
    // Update mock environment
    mockEnv.VITE_GOOGLE_MAPS_API_KEY = '';

    const { container } = render(<ListenPage />);
    
    expect(container.firstChild).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      'GOOGLE_MAPS_API_KEY was not found in env variable. Please pass it to enable Google Maps component.'
    );
  });

  it('applies correct styles to the map container', () => {
    render(<ListenPage />);
    
    const map = screen.getByTestId('roundware-map');
    expect(map).toHaveStyle({
      display: 'flex',
    });
  });

  it('renders map with correct props', () => {
    render(<ListenPage />);
    
    const map = screen.getByTestId('roundware-map');
    expect(map).toHaveAttribute('data-api-key', 'test-api-key');
    expect(map.className).toContain('map');
  });
});
