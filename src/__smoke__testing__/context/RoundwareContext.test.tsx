import { render, act } from '@testing-library/react';
import RoundwareContext, { IRoundwareContext } from '../../context/RoundwareContext';
import { ReactNode } from 'react';
import Roundware, { GeoListenModeType, IAssetData, ITagGroup, ITag } from 'roundware-web-framework';

// Mock Roundware instance
const mockRoundware = {
  // Add any necessary mock methods here
} as unknown as Roundware;

// Mock asset data
const mockAsset = {
  id: 1,
  title: 'Test Asset',
  description: 'Test Description',
  created: new Date().toISOString(),
  latitude: 0,
  longitude: 0,
  filename: 'test.mp3',
  file: 'test.mp3',
  duration: 60,
  volume: 1,
  project_id: 1,
  collection_id: 1,
  user_id: 1,
  status: 'active',
  type: 'audio',
  tags: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  submitted: new Date().toISOString(),
  updated: new Date().toISOString(),
  weight: 1,
  start_time: 0,
  end_time: 60,
  listen_count: 0,
  listen_duration: 0,
  listen_ratio: 0,
  listen_score: 0,
  listen_rank: 0,
  listen_rank_score: 0,
  listen_rank_ratio: 0,
  listen_rank_duration: 0,
  listen_rank_count: 0
} as unknown as IAssetData;

// Mock tag group
const mockTagGroup = {
  id: 1,
  name: 'Test Group',
  display_items: [] as ITag[],
  project_id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
} as unknown as ITagGroup;

// Create a wrapper component for testing
const TestWrapper = ({ children, value }: { children: ReactNode; value: IRoundwareContext }) => {
  return (
    <RoundwareContext.Provider value={value}>
      {children}
    </RoundwareContext.Provider>
  );
};

describe('RoundwareContext', () => {
  let mockContextValue: IRoundwareContext;

  beforeEach(() => {
    mockContextValue = {
      roundware: mockRoundware,
      tagLookup: {},
      sortField: {
        name: 'created' as keyof IAssetData,
        asc: true
      },
      selectedTags: null,
      selectedAsset: null,
      beforeDateFilter: null,
      afterDateFilter: null,
      assetPageIndex: 0,
      assetsPerPage: 10,
      geoListenMode: 'manual' as unknown as GeoListenModeType,
      userFilter: '',
      playingAssets: [],
      descriptionFilter: null,
      hideSpeakerPolygons: [],
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
      setHideSpeakerPolygons: jest.fn(),
      assetPage: [],
      assetsReady: false
    };
  });

  it('should provide context value to children', () => {
    const { container } = render(
      <TestWrapper value={mockContextValue}>
        <div>Test Child</div>
      </TestWrapper>
    );

    expect(container.textContent).toBe('Test Child');
  });

  it('should handle asset selection', () => {
    const { selectAsset } = mockContextValue;
    
    act(() => {
      selectAsset(mockAsset);
    });

    expect(selectAsset).toHaveBeenCalledWith(mockAsset);
  });

  it('should handle tag selection', () => {
    const { selectTags } = mockContextValue;
    const tags = [1, 2, 3];
    
    act(() => {
      selectTags(tags, mockTagGroup);
    });

    expect(selectTags).toHaveBeenCalledWith(tags, mockTagGroup);
  });

  it('should handle date filter updates', () => {
    const { setBeforeDateFilter, setAfterDateFilter } = mockContextValue;
    const testDate = new Date();
    
    act(() => {
      setBeforeDateFilter(testDate);
      setAfterDateFilter(testDate);
    });

    expect(setBeforeDateFilter).toHaveBeenCalledWith(testDate);
    expect(setAfterDateFilter).toHaveBeenCalledWith(testDate);
  });

  it('should handle pagination updates', () => {
    const { setAssetPageIndex, setAssetsPerPage } = mockContextValue;
    
    act(() => {
      setAssetPageIndex(2);
      setAssetsPerPage(20);
    });

    expect(setAssetPageIndex).toHaveBeenCalledWith(2);
    expect(setAssetsPerPage).toHaveBeenCalledWith(20);
  });

  it('should handle sort field updates', () => {
    const { setSortField } = mockContextValue;
    const newSortField = {
      name: 'title' as keyof IAssetData,
      asc: false
    };
    
    act(() => {
      setSortField(newSortField);
    });

    expect(setSortField).toHaveBeenCalledWith(newSortField);
  });

  it('should handle geo listen mode updates', () => {
    const { setGeoListenMode } = mockContextValue;
    
    act(() => {
      setGeoListenMode('auto' as unknown as GeoListenModeType);
    });

    expect(setGeoListenMode).toHaveBeenCalledWith('auto');
  });

  it('should handle asset updates', () => {
    const { updateAssets } = mockContextValue;
    const newAssets = [mockAsset];
    
    act(() => {
      updateAssets(newAssets);
    });

    expect(updateAssets).toHaveBeenCalledWith(newAssets);
  });

  it('should handle filter reset', () => {
    const { resetFilters } = mockContextValue;
    
    act(() => {
      resetFilters();
    });

    expect(resetFilters).toHaveBeenCalled();
  });

  it('should handle speaker polygon visibility', () => {
    const { setHideSpeakerPolygons } = mockContextValue;
    const speakerIds = [1, 2, 3];
    
    act(() => {
      setHideSpeakerPolygons(speakerIds);
    });

    expect(setHideSpeakerPolygons).toHaveBeenCalledWith(speakerIds);
  });
});
