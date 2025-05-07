import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlacesAutocomplete from '../../../components/SpeakPage/LocationSelectForm/PlacesAutocomplete';
import { useRoundwareDraft } from '../../../hooks';
import { Autocomplete } from '@mui/lab';
import { TextField, ThemeProvider, createTheme } from '@mui/material';

// Mock the hooks and components
jest.mock('../../../hooks', () => ({
  useRoundwareDraft: jest.fn(),
}));

// Mock the Autocomplete component
jest.mock('@mui/lab/Autocomplete', () => {
  return jest.fn(({ renderInput, onChange, onInputChange, options, value }) => {
    // Call onInputChange when the component mounts to simulate initial input
    React.useEffect(() => {
      if (onInputChange) {
        onInputChange({ target: { value: '' } }, '', 'input');
      }
    }, []);

    return (
      <div data-testid="autocomplete">
        {renderInput({
          inputProps: {
            'data-testid': 'autocomplete-input',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (onInputChange) {
                // Don't trigger onInputChange in the mock if we're testing throttling
                const isThrottlingTest = window.location.hash === '#throttling';
                if (!isThrottlingTest) {
                  onInputChange(e, e.target.value, 'input');
                }
              }
            },
          },
        })}
        <div data-testid="options">
          {options?.map((option: any, index: number) => (
            <div
              key={index}
              data-testid={`option-${index}`}
              onClick={() => onChange && onChange({}, option)}
            >
              {option.description}
            </div>
          ))}
        </div>
      </div>
    );
  });
});

// Mock Google Maps services
const mockGeocoder = {
  geocode: jest.fn(),
};

const mockAutocompleteService = {
  getPlacePredictions: jest.fn(),
};

global.google = {
  maps: {
    Geocoder: jest.fn(() => mockGeocoder),
    places: {
      AutocompleteService: jest.fn(() => mockAutocompleteService),
      PlacesServiceStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
        ERROR: 'ERROR',
      },
    },
  },
} as any;

// Create a theme instance
const theme = createTheme();

// Wrapper component with ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('PlacesAutocomplete', () => {
  const mockSetLocation = jest.fn();
  const mockPredictions = [
    {
      description: 'New York, NY, USA',
      place_id: 'place1',
      structured_formatting: {
        main_text: 'New York',
        main_text_matched_substrings: [{ offset: 0, length: 8 }],
        secondary_text: 'NY, USA',
      },
    },
    {
      description: 'New York City, NY, USA',
      place_id: 'place2',
      structured_formatting: {
        main_text: 'New York City',
        main_text_matched_substrings: [{ offset: 0, length: 12 }],
        secondary_text: 'NY, USA',
      },
    },
  ];

  const mockGeocodeResult = {
    geometry: {
      location: {
        lat: () => 40.7128,
        lng: () => -74.0060,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useRoundwareDraft hook
    (useRoundwareDraft as jest.Mock).mockReturnValue({
      setLocation: mockSetLocation,
    });

    // Mock AutocompleteService
    mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
      callback(mockPredictions, 'OK');
    });

    // Mock Geocoder
    mockGeocoder.geocode.mockImplementation((request, callback) => {
      callback([mockGeocodeResult], 'OK');
    });
  });

  it('renders the autocomplete component with correct props', () => {
    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    expect(Autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'places-autocomplete',
        autoComplete: true,
        includeInputInList: true,
        filterSelectedOptions: true,
      }),
      expect.any(Object)
    );
  });

  it('renders TextField with correct label', () => {
    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    expect(screen.getByLabelText('Type to select a location')).toBeInTheDocument();
  });

  it('fetches and displays predictions when user types', async () => {
    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    const input = screen.getByTestId('autocomplete-input');
    await userEvent.type(input, 'New York');

    // Wait for the debounced function to be called
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledWith(
      { input: 'New York' },
      expect.any(Function)
    );
  });

  it('updates location when a place is selected', async () => {
    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    const input = screen.getByTestId('autocomplete-input');
    await userEvent.type(input, 'New York');

    // Wait for predictions to be loaded
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Simulate selecting the first option
    const options = screen.getAllByTestId(/option-\d+/);
    await userEvent.click(options[0]);

    expect(mockGeocoder.geocode).toHaveBeenCalledWith(
      { placeId: 'place1' },
      expect.any(Function)
    );

    expect(mockSetLocation).toHaveBeenCalledWith({
      latitude: 40.7128,
      longitude: -74.0060,
    });
  });

  it('handles geocoding errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGeocoder.geocode.mockImplementationOnce((request, callback) => {
      callback([], 'ERROR');
    });

    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    const input = screen.getByTestId('autocomplete-input');
    await userEvent.type(input, 'New York');

    // Wait for predictions to be loaded
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const options = screen.getAllByTestId(/option-\d+/);
    await userEvent.click(options[0]);

    expect(alertSpy).toHaveBeenCalledWith('Geocoder failed due to: ERROR');
    
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('handles zero results from geocoding', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGeocoder.geocode.mockImplementationOnce((request, callback) => {
      callback([], 'ZERO_RESULTS');
    });

    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    const input = screen.getByTestId('autocomplete-input');
    await userEvent.type(input, 'New York');

    // Wait for predictions to be loaded
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const options = screen.getAllByTestId(/option-\d+/);
    await userEvent.click(options[0]);

    expect(alertSpy).toHaveBeenCalledWith('Geocoder failed due to: ZERO_RESULTS');
    
    alertSpy.mockRestore();
  });

  it('throttles autocomplete requests', async () => {
    jest.useFakeTimers();
    
    let onInputChangeHandler: ((event: any, value: string, reason: string) => void) | undefined;
    
    // Modify the Autocomplete mock for this test
    (Autocomplete as jest.Mock).mockImplementationOnce(({ renderInput, onChange, onInputChange, options, value }) => {
      onInputChangeHandler = onInputChange;
      return (
        <div data-testid="autocomplete">
          {renderInput({
            inputProps: {
              'data-testid': 'autocomplete-input',
            },
          })}
          <div data-testid="options">
            {options?.map((option: any, index: number) => (
              <div
                key={index}
                data-testid={`option-${index}`}
                onClick={() => onChange && onChange({}, option)}
              >
                {option.description}
              </div>
            ))}
          </div>
        </div>
      );
    });
    
    render(<PlacesAutocomplete />, { wrapper: TestWrapper });
    
    // Clear any initial calls
    jest.clearAllMocks();
    
    // Simulate typing the entire text with a single act call
    await act(async () => {
      const text = 'New York';
      
      // Type each character with a small delay
      for (let i = 1; i <= text.length; i++) {
        const value = text.slice(0, i);
        onInputChangeHandler?.({ target: { value } }, value, 'input');
        jest.advanceTimersByTime(50);
      }
      
      // Wait for the debounce timeout
      jest.advanceTimersByTime(200);
    });
    
    // Should have been called exactly once with the final value
    expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledTimes(1);
    expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledWith(
      { input: 'New York' },
      expect.any(Function)
    );
    
    jest.useRealTimers();
  });
});
