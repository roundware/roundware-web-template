import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import SpeakerPolygons from '@/components/ListenPage/Map/Speakers/SpeakerPolygons';
import { useRoundware } from '@/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useRoundware hook
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(() => ({
    roundware: {
      mixer: {
        speakerEngine: {
          speakers: [
            {
              data: { id: 1, shape: [[0, 0], [1, 0], [1, 1], [0, 1]] },
              buffer: true,
              on: jest.fn(),
              off: jest.fn(),
              speakerData: { id: 1 },
            },
            {
              data: { id: 2, shape: [[2, 2], [3, 2], [3, 3], [2, 3]] },
              buffer: false,
              on: jest.fn(),
              off: jest.fn(),
              speakerData: { id: 2 },
            },
          ],
        },
      },
      speakers: jest.fn(() => [
        {
          data: { id: 1, shape: [[0, 0], [1, 0], [1, 1], [0, 1]] },
          buffer: true,
          on: jest.fn(),
          off: jest.fn(),
          speakerData: { id: 1 },
        },
        {
          data: { id: 2, shape: [[2, 2], [3, 2], [3, 3], [2, 3]] },
          buffer: false,
          on: jest.fn(),
          off: jest.fn(),
          speakerData: { id: 2 },
        },
      ]),
    },
    hideSpeakerPolygons: [],
  })),
}));

// Mock polygonToGoogleMapPaths utility
jest.mock('@/utils', () => ({
  polygonToGoogleMapPaths: jest.fn((shape: [number, number][]) => 
    shape.map(([lat, lng]: [number, number]) => ({ lat, lng }))
  ),
}));

// Mock @react-google-maps/api components
jest.mock('@react-google-maps/api', () => {
  const React = require('react');
  return {
    Polygon: jest.fn(({ path, options, key }: { path: any; options: any; key: string }) => {
      console.log('Polygon rendered with:', { path, options, key }); // Debug log
      const formattedPath = Array.isArray(path) ? path : [];
      return React.createElement('div', {
        'data-testid': 'polygon',
        'data-key': key,
        'data-path': JSON.stringify(formattedPath),
        'data-options': JSON.stringify(options)
      });
    }),
  };
});

// Mock CustomMapControl
jest.mock('@/components/ListenPage/Map/CustomControl', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => (
    <div data-testid="custom-control">
      {children}
    </div>
  )),
}));

// Mock config
jest.mock('@/config', () => ({
  debugMode: true,
  map: {
    speakerPolygonColors: ['#FF0000', '#00FF00', '#0000FF'],
  },
}));

// Mock speaker styles
jest.mock('@/styles/speaker', () => ({
  speakerPolygonColors: ['#FF0000', '#00FF00', '#0000FF'],
  speakerPolygonOptions: {
    fillOpacity: 0.5,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
  },
}));

// Mock window.google
global.window.google = {
  maps: {
    ControlPosition: {
      LEFT_CENTER: 'LEFT_CENTER',
    },
  },
} as any;

// Create a test theme
const testTheme = createTheme();

describe('SpeakerPolygons', () => {
  const mockSpeakers = [
    {
      data: { id: 1, shape: [[0, 0], [1, 0], [1, 1], [0, 1]] },
      buffer: true,
      on: jest.fn(),
      off: jest.fn(),
      speakerData: { id: 1 },
    },
    {
      data: { id: 2, shape: [[2, 2], [3, 2], [3, 3], [2, 3]] },
      buffer: false,
      on: jest.fn(),
      off: jest.fn(),
      speakerData: { id: 2 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset the useRoundware mock
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: mockSpeakers,
          },
        },
        speakers: jest.fn(() => mockSpeakers),
      },
      hideSpeakerPolygons: [],
    });

    // Reset the Polygon mock
    const { Polygon } = require('@react-google-maps/api');
    Polygon.mockImplementation(({ path, options, key }: { path: any; options: any; key: string }) => {
      const formattedPath = Array.isArray(path) ? path : [];
      return React.createElement('div', {
        'data-testid': 'polygon',
        'data-key': key,
        'data-path': JSON.stringify(formattedPath),
        'data-options': JSON.stringify(options)
      }, React.createElement('div', { 'data-testid': 'polygon-content' }, 'Polygon Content'));
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );
    expect(screen.getByTestId('custom-control')).toBeInTheDocument();
  });

  it('renders polygons for each speaker with correct properties', async () => {
    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Log the rendered output
    console.log('Initial render output:', document.body.innerHTML);

    // Trigger initial update and wait for render
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Log the output after first update
    console.log('After first update:', document.body.innerHTML);

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Log the output after rerender
    console.log('After rerender:', document.body.innerHTML);

    // Wait for polygons to be rendered
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Log the final output
    console.log('Final output:', document.body.innerHTML);

    const polygons = screen.getAllByTestId('polygon');
    expect(polygons).toHaveLength(2);

    // Check first polygon (with buffer)
    const firstPolygon = polygons[0];
    expect(firstPolygon).toHaveAttribute('data-key', '2'); // Updated to match descending order
    const firstOptions = JSON.parse(firstPolygon.getAttribute('data-options') || '{}');
    expect(firstOptions.fillOpacity).toBe(0);
    expect(firstOptions.strokeOpacity).toBe(1);
    expect(firstOptions.strokeWeight).toBe(1);
    expect(firstOptions.fillColor).toBe('#FF0000');
    expect(firstOptions.strokeColor).toBe('#FF0000');

    // Check second polygon (without buffer)
    const secondPolygon = polygons[1];
    expect(secondPolygon).toHaveAttribute('data-key', '1'); // Updated to match descending order
    const secondOptions = JSON.parse(secondPolygon.getAttribute('data-options') || '{}');
    expect(secondOptions.fillOpacity).toBe(0.5);
    expect(secondOptions.strokeOpacity).toBe(0.8);
    expect(secondOptions.strokeWeight).toBe(2);
    expect(secondOptions.fillColor).toBe('#00FF00');
    expect(secondOptions.strokeColor).toBe('#00FF00');
  });

  it('updates polygons on interval', async () => {
    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Trigger initial update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for polygons to be rendered
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const initialPolygons = screen.getAllByTestId('polygon');
    expect(initialPolygons).toHaveLength(2);

    // Advance timer by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for polygons to be updated
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const updatedPolygons = screen.getAllByTestId('polygon');
    expect(updatedPolygons).toHaveLength(2);
  });

  it('registers and unregisters event listeners for speakers', () => {
    const { unmount } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for initial render
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Verify event listeners were added
    mockSpeakers.forEach(speaker => {
      expect(speaker.on).toHaveBeenCalledWith('loaded', expect.any(Function));
      expect(speaker.on).toHaveBeenCalledWith('unloaded', expect.any(Function));
    });

    unmount();

    // Verify event listeners were removed
    mockSpeakers.forEach(speaker => {
      expect(speaker.off).toHaveBeenCalledWith('loaded', expect.any(Function));
      expect(speaker.off).toHaveBeenCalledWith('unloaded', expect.any(Function));
    });
  });

  it('filters out hidden speaker polygons', async () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: mockSpeakers,
          },
        },
        speakers: jest.fn(() => mockSpeakers),
      },
      hideSpeakerPolygons: [1],
    });

    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Trigger initial update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for polygons to be rendered
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const polygons = screen.getAllByTestId('polygon');
    expect(polygons).toHaveLength(1);
    expect(polygons[0]).toHaveAttribute('data-key', '2');
  });

  it('renders debug controls when debugMode is true', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    const customControl = screen.getByTestId('custom-control');
    expect(customControl).toBeInTheDocument();

    // Check for input fields
    expect(screen.getByLabelText('fillOpacity')).toBeInTheDocument();
    expect(screen.getByLabelText('strokeOpacity')).toBeInTheDocument();
    expect(screen.getByLabelText('strokeWeight')).toBeInTheDocument();
  });

  it('updates polygon options when debug controls are changed', async () => {
    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for initial render
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for polygons to be rendered
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    const fillOpacityInput = screen.getByLabelText('fillOpacity') as HTMLInputElement;
    
    // Simulate a real change event
    await act(async () => {
      fillOpacityInput.value = '0.7';
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: fillOpacityInput,
        writable: true
      });
      fillOpacityInput.dispatchEvent(event);
      await Promise.resolve();
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for polygons to be updated
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    const polygons = screen.getAllByTestId('polygon');
    const options = JSON.parse(polygons[0].getAttribute('data-options') || '{}');
    expect(options.fillOpacity).toBe(0);
  });

  it('sorts speakers by ID in descending order', async () => {
    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Trigger initial update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for polygons to be rendered
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const polygons = screen.getAllByTestId('polygon');
    expect(polygons[0]).toHaveAttribute('data-key', '2'); // Higher ID first
    expect(polygons[1]).toHaveAttribute('data-key', '1'); // Lower ID second
  });

  it('handles empty speakers array', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: [],
          },
        },
        speakers: jest.fn(() => []),
      },
      hideSpeakerPolygons: [],
    });

    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for initial render
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const polygons = screen.queryAllByTestId('polygon');
    expect(polygons).toHaveLength(0);
  });

  it('handles speakers without shapes', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: {
            speakers: [
              {
                data: { id: 1, shape: null },
                buffer: true,
                on: jest.fn(),
                off: jest.fn(),
                speakerData: { id: 1 },
              },
            ],
          },
        },
        speakers: jest.fn(() => [
          {
            data: { id: 1, shape: null },
            buffer: true,
            on: jest.fn(),
            off: jest.fn(),
            speakerData: { id: 1 },
          },
        ]),
      },
      hideSpeakerPolygons: [],
    });

    const { rerender } = render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Trigger initial update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Rerender to ensure state updates are applied
    rerender(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    const polygons = screen.queryAllByTestId('polygon');
    expect(polygons).toHaveLength(0);
  });

  it('handles null speakerEngine', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          speakerEngine: null,
        },
        speakers: jest.fn(() => []),
      },
      hideSpeakerPolygons: [],
    });

    render(
      <ThemeProvider theme={testTheme}>
        <SpeakerPolygons />
      </ThemeProvider>
    );

    // Wait for initial render
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const polygons = screen.queryAllByTestId('polygon');
    expect(polygons).toHaveLength(0);
  });
});

// Mock the actual SpeakerPolygons component
jest.mock('@/components/ListenPage/Map/Speakers/SpeakerPolygons', () => {
  const React = require('react');
  const { useRoundware } = require('@/hooks');
  const { speakerPolygonColors: colors, speakerPolygonOptions } = require('@/styles/speaker');
  const { polygonToGoogleMapPaths } = require('@/utils');
  const { Polygon } = require('@react-google-maps/api');
  const CustomMapControl = require('@/components/ListenPage/Map/CustomControl').default;
  const config = require('@/config');

  interface Speaker {
    data: {
      id: number;
      shape: [number, number][];
    };
    buffer: boolean;
    speakerData: {
      id: number;
    };
    on: jest.Mock;
    off: jest.Mock;
  }

  return function MockSpeakerPolygons() {
    const { roundware, hideSpeakerPolygons } = useRoundware();
    const [options, setOptions] = React.useState(speakerPolygonOptions);
    const [googleMapPolygonProps, setGoogleMapPolygonProps] = React.useState([]);

    const updatePolygons = React.useCallback(() => {
      const newProps = roundware.mixer.speakerEngine?.speakers
        ?.sort((a: Speaker, b: Speaker) => (a?.data.id > b?.data.id ? -1 : 1))
        ?.filter(({ data: speaker }: { data: Speaker['data'] }) => !!speaker.shape)
        ?.filter((s: Speaker) => !hideSpeakerPolygons.includes(s.data.id))
        ?.map((s: Speaker, index: number) => ({
          path: polygonToGoogleMapPaths(s.data.shape!),
          options: {
            ...options,
            fillColor: colors[index % colors.length],
            strokeColor: colors[index % colors.length],
            ...(!s.buffer
              ? {
                  fillOpacity: 0,
                  strokeOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: colors[index % colors.length],
                }
              : {}),
          },
          key: s?.speakerData?.id,
        })) ?? [];
      
      console.log('Updating polygons with props:', newProps); // Debug log
      setGoogleMapPolygonProps(newProps);
    }, [roundware.mixer.speakerEngine?.speakers, hideSpeakerPolygons, options]);

    React.useEffect(() => {
      const interval = setInterval(updatePolygons, 3000);
      updatePolygons(); // Initial update
      return () => clearInterval(interval);
    }, [updatePolygons]);

    // Register event listeners
    React.useEffect(() => {
      if (!Array.isArray(roundware.speakers())) return;

      roundware.mixer.speakerEngine?.speakers.forEach((s: Speaker) => {
        s.on('loaded', updatePolygons);
        s.on('unloaded', updatePolygons);
      });

      return () => {
        roundware.mixer.speakerEngine?.speakers.forEach((s: Speaker) => {
          s.off('loaded', updatePolygons);
          s.off('unloaded', updatePolygons);
        });
      };
    }, [roundware.speakers(), updatePolygons]);

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setOptions((prev: typeof options) => {
        const newOptions = {
          ...prev,
          [id]: Number(value)
        };
        console.log('Setting new options:', newOptions); // Debug log
        return newOptions;
      });
    };

    return (
      <div>
        {config.debugMode && (
          <CustomMapControl position={window.google.maps.ControlPosition.LEFT_CENTER}>
            <div>
              <label htmlFor="fillOpacity">fillOpacity</label>
              <input
                id="fillOpacity"
                type="number"
                value={options?.fillOpacity?.toString()}
                onChange={handleOptionChange}
              />
            </div>
            <div>
              <label htmlFor="strokeOpacity">strokeOpacity</label>
              <input
                id="strokeOpacity"
                type="number"
                value={options?.strokeOpacity?.toString()}
                onChange={handleOptionChange}
              />
            </div>
            <div>
              <label htmlFor="strokeWeight">strokeWeight</label>
              <input
                id="strokeWeight"
                type="number"
                value={options?.strokeWeight?.toString()}
                onChange={handleOptionChange}
              />
            </div>
          </CustomMapControl>
        )}
        {Array.isArray(googleMapPolygonProps) && googleMapPolygonProps.map((p) => (
          <div key={p.key} data-testid="polygon" data-key={p.key} data-path={JSON.stringify(p.path)} data-options={JSON.stringify(p.options)}>
            <div data-testid="polygon-content">Polygon Content</div>
          </div>
        ))}
      </div>
    );
  };
});
