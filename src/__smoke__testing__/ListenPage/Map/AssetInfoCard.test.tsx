import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { lightTheme } from '../../../styles';
import AssetInfoCard from '../../../components/ListenPage/Map/AssetLayer/AssetInfoCard';
import Roundware, { IAssetData, GeoListenMode } from 'roundware-web-framework';
import { IAssetCardConfig } from '../../../configTypes';
import RoundwareContext from '../../../context/RoundwareContext';

// Mock global fetch
global.fetch = jest.fn();

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createBuffer: jest.fn(),
  decodeAudioData: jest.fn(),
  suspend: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
  state: 'running',
  sampleRate: 44100,
  currentTime: 0,
  destination: {
    channelCount: 2,
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

// Mock data
const mockAsset: IAssetData = {
  id: 1,
  description: 'Test Description',
  latitude: 0,
  longitude: 0,
  filename: 'test.mp3',
  file: 'test.mp3',
  volume: 1,
  submitted: true,
  created: '2023-01-01T00:00:00Z',
  updated: '2023-01-01T00:00:00Z',
  weight: 1,
  start_time: 0,
  end_time: 100,
  media_type: 'audio',
  audio_length_in_seconds: 100,
  tag_ids: [1, 2],
  session_id: 1,
  project_id: 1,
  language_id: 1,
  envelope_ids: [],
  description_loc_ids: [],
  alt_text_loc_ids: []
};

const mockCardConfig: IAssetCardConfig = {
  available: ['date', 'tags', 'description', 'audio', 'photo', 'text', 'actions'],
  actionItems: ['like', 'flag', 'download', 'show']
};

const mockRoundware = new Roundware({
  deviceId: 'test-device',
  serverUrl: 'https://test.server',
  projectId: 1,
  geoListenMode: GeoListenMode.DISABLED,
  speakerFilters: { activeyn: true },
  assetFilters: { submitted: true },
  listenerLocation: { latitude: 0, longitude: 0 },
  assetUpdateInterval: 30000,
  speakerConfig: {
    mode: 'progressive-sync-basePlusMax5Random',
    loop: true,
    acceptableDelayMs: 50,
    syncCheckInterval: 2500,
    replaceWithNoneProbability: 0.2,
    loopPointUpdateProbability: 0.8,
    slotConsiderationProbability: 0.5,
    prefetchDistanceMeters: 5,
    loopFractions: [1/8, 1/16],
    effects: {
      delayTimeInMs: 50,
      feedback: 0.5,
      pan: [-0.8, -0.4, 0.4, 0.8]
    }
  }
});

// Mock Roundware class
jest.mock('roundware-web-framework', () => {
  const mockRoundware = {
    connect: jest.fn(),
    getAssets: jest.fn().mockResolvedValue([]),
    project: {
      projectName: 'Test Project',
      data: {},
      outOfRangeDistance: 100,
    },
    mixer: {
      speakerEngine: {
        speakers: [],
      },
    },
    listenHistory: {
      assets: [],
    },
    selectAsset: jest.fn(),
    findTagDescription: jest.fn().mockReturnValue('Mock Tag Description'),
  };
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockRoundware),
    GeoListenMode: {
      DISABLED: 'disabled',
    },
  };
});

const mockRoundwareContext = {
  roundware: mockRoundware,
  tagLookup: {
    1: { 
      id: 1,
      tag_id: 1,
      tag_text: 'Tag 1',
      tag_display_text: 'Tag 1',
      description: 'Tag 1 Description',
      parent_id: null,
      loc_id: 1,
      loc_description: null,
      weight: 1,
      select: true,
      group_short_name: 'speak',
      default_state: true
    },
    2: { 
      id: 2,
      tag_id: 2,
      tag_text: 'Tag 2',
      tag_display_text: 'Tag 2',
      description: 'Tag 2 Description',
      parent_id: null,
      loc_id: 2,
      loc_description: null,
      weight: 1,
      select: true,
      group_short_name: 'speak',
      default_state: true
    }
  },
  sortField: { name: 'created' as keyof IAssetData, asc: false },
  selectedTags: null,
  selectedAsset: null,
  beforeDateFilter: null,
  afterDateFilter: null,
  assetPageIndex: 0,
  assetsPerPage: 10,
  geoListenMode: GeoListenMode.DISABLED,
  userFilter: '',
  playingAssets: [],
  descriptionFilter: null,
  selectAsset: jest.fn(),
  selectTags: jest.fn(),
  setUserFilter: jest.fn(),
  setBeforeDateFilter: jest.fn(),
  setAfterDateFilter: jest.fn(),
  setAssetPageIndex: jest.fn(),
  setAssetsPerPage: jest.fn(),
  setSortField: jest.fn(),
  setDescriptionFilter: jest.fn(),
  forceUpdate: jest.fn(),
  setGeoListenMode: jest.fn(),
  updateAssets: jest.fn(),
  resetFilters: jest.fn(),
  assetPage: [],
  assetsReady: true,
  hideSpeakerPolygons: [],
  setHideSpeakerPolygons: jest.fn(),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={lightTheme}>
        <RoundwareContext.Provider value={mockRoundwareContext}>
          {children}
        </RoundwareContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

describe('AssetInfoCard Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
  });

  it('displays date when configured', () => {
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    expect(screen.getByText('January 1, 2023 5:30 AM')).toBeInTheDocument();
  });

  it('displays description when configured', () => {
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays tags when configured', () => {
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    expect(screen.getAllByText('Mock Tag Description')).toHaveLength(2);
  });

  it('handles image display when photo is configured', () => {
    const mockAssetWithImage = {
      ...mockAsset,
      envelope_ids: [1]
    };
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAssetWithImage} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    // Wait for the image to be loaded
    expect(mockRoundware.getAssets).toHaveBeenCalledWith({
      media_type: 'photo',
      envelope_id: [1]
    });
  });

  it('handles text display when text is configured', () => {
    const mockAssetWithText = {
      ...mockAsset,
      envelope_ids: [1]
    };
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAssetWithText} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    // Wait for the text to be loaded
    expect(mockRoundware.getAssets).toHaveBeenCalledWith({
      media_type: 'text',
      envelope_ids: [1]
    });
  });

  it('displays audio player when audio is configured', () => {
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    const audioElement = screen.getByText('Your browser does not support audio!').closest('audio');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('controls');
    expect(audioElement).toHaveAttribute('controlslist', 'nodownload');
  });

  it('displays action buttons when actions are configured', () => {
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
        />
      </TestWrapper>
    );
    expect(screen.getByTitle('download this audio file')).toBeInTheDocument();
    expect(screen.getByTitle('tell us you like this one!')).toBeInTheDocument();
    expect(screen.getByTitle('tell us you are concerned about this one!')).toBeInTheDocument();
  });

  it('renders additional actions when provided', () => {
    const additionalAction = <button data-testid="additional-action">Test</button>;
    
    render(
      <TestWrapper>
        <AssetInfoCard 
          asset={mockAsset} 
          roundware={mockRoundware} 
          cardConfig={mockCardConfig}
          actions={additionalAction}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('additional-action')).toBeInTheDocument();
  });
}); 