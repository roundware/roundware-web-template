import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LandingPage } from '../../components/LandingPage';
import { useRoundware } from '../../hooks';
import config from '@/config';
import { GeoListenMode } from 'roundware-web-framework/dist/index';

// Mock the hooks
jest.mock('../../hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock config
jest.mock('@/config', () => ({
  listen: {
    autoplay: true,
  },
  speak: {
    recordingMethod: 'standard',
  },
}));

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock react-router-dom
const mockHistory = {
  push: jest.fn(),
  location: { search: '' },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => mockHistory,
}));

describe('LandingPage', () => {
  const theme = createTheme();

  const mockMixer = {
    playlist: true,
    updateParams: jest.fn(),
    play: jest.fn(),
  };

  const mockProject = {
    projectName: 'Test Project',
    data: {
      listen_enabled: true,
      speak_enabled: true,
    },
  };

  const mockRoundware = {
    project: mockProject,
    mixer: mockMixer,
    listenerLocation: { latitude: 0, longitude: 0 },
    activateMixer: jest.fn().mockImplementation(() => {
      mockRoundware.mixer = { ...mockMixer };
      return Promise.resolve();
    }),
    uiConfig: {
      listen: [{
        display_items: [
          { tag_id: 1 },
          { tag_id: 2 },
        ],
      }],
    },
  };

  const mockForceUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      forceUpdate: mockForceUpdate,
    });
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  it('renders nothing when project is not loaded', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { project: { projectName: '(unknown)' } },
      forceUpdate: mockForceUpdate,
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('renders the banner image', () => {
    renderComponent();
    const banner = screen.getByRole('img');
    expect(banner).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderComponent();
    const tagline = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'h6' && 
             content.includes('Contributory Audio Augmented Reality') &&
             content.includes('for Art, Education and Documentary');
    });
    expect(tagline).toBeInTheDocument();
  });

  it('renders Listen button when listen is enabled', () => {
    renderComponent();
    expect(screen.getByText('Listen')).toBeInTheDocument();
  });

  it('does not render Listen button when listen is disabled', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        ...mockRoundware,
        project: {
          ...mockProject,
          data: { ...mockProject.data, listen_enabled: false },
        },
      },
      forceUpdate: mockForceUpdate,
    });

    renderComponent();
    expect(screen.queryByText('Listen')).not.toBeInTheDocument();
  });

  it('renders Speak button when speak is enabled and method is standard', () => {
    renderComponent();
    expect(screen.getByText('Speak')).toBeInTheDocument();
  });

  it('does not render Speak button when speak is disabled', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        ...mockRoundware,
        project: {
          ...mockProject,
          data: { ...mockProject.data, speak_enabled: false },
        },
      },
      forceUpdate: mockForceUpdate,
    });

    renderComponent();
    expect(screen.queryByText('Speak')).not.toBeInTheDocument();
  });

  it('does not render Speak button when recordingMethod is not standard', () => {
    config.speak.recordingMethod = 'looping';
    renderComponent();
    expect(screen.queryByText('Speak')).not.toBeInTheDocument();
    // Reset the config
    config.speak.recordingMethod = 'standard';
  });

  describe('Listen button functionality', () => {
    it('activates mixer when clicked and mixer is not initialized', async () => {
      const roundwareWithoutMixer = {
        ...mockRoundware,
        mixer: null as any,
      };

      let mixerUpdated = false;
      roundwareWithoutMixer.activateMixer.mockImplementation(() => {
        const newMixer = {
          ...mockMixer,
          updateParams: (...args: any[]) => {
            mixerUpdated = true;
            return mockMixer.updateParams(...args);
          },
        };
        roundwareWithoutMixer.mixer = newMixer;
        return Promise.resolve();
      });

      (useRoundware as jest.Mock).mockReturnValue({
        roundware: roundwareWithoutMixer,
        forceUpdate: mockForceUpdate,
      });

      renderComponent();
      const listenButton = screen.getByText('Listen');
      fireEvent.click(listenButton);

      expect(roundwareWithoutMixer.activateMixer).toHaveBeenCalledWith({
        geoListenMode: GeoListenMode.MANUAL,
      });

      await waitFor(() => {
        expect(mixerUpdated).toBe(true);
      });

      expect(mockMixer.updateParams).toHaveBeenCalledWith({
        listenerLocation: mockRoundware.listenerLocation,
        minDist: 0,
        maxDist: 0,
        recordingRadius: 0,
        listenTagIds: [1, 2],
      });
    });

    it('plays mixer directly when clicked and mixer is already initialized', () => {
      renderComponent();
      const listenButton = screen.getByText('Listen');
      fireEvent.click(listenButton);

      expect(mockMixer.play).toHaveBeenCalled();
      expect(mockForceUpdate).toHaveBeenCalled();
    });

    it('does nothing when autoplay is disabled', () => {
      config.listen.autoplay = false;
      renderComponent();
      const listenButton = screen.getByText('Listen');
      fireEvent.click(listenButton);

      expect(mockMixer.play).not.toHaveBeenCalled();
      expect(mockForceUpdate).not.toHaveBeenCalled();
      // Reset the config
      config.listen.autoplay = true;
    });
  });
});
