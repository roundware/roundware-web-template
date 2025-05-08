import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetList from '../components/AssetList';
import { useRoundware } from '../hooks';
import { IAssetData } from 'roundware-web-framework';

// Mock the useRoundware hook
jest.mock('../hooks', () => ({
  useRoundware: jest.fn()
}));

// Mock the AssetFilterPanel component
jest.mock('../components/AssetFilterPanel', () => {
  return function MockAssetFilterPanel({ hidden }: { hidden: boolean }) {
    return <div data-testid="filter-panel" style={{ display: hidden ? 'none' : 'block' }}>Filter Panel</div>;
  };
});

// Mock the AssetListItem component
jest.mock('../components/AssetListItem', () => {
  return function MockAssetListItem({ asset }: { asset: IAssetData }) {
    return <div data-testid="asset-item">{asset.id}</div>;
  };
});

describe('AssetList Component', () => {
  const mockAssets: IAssetData[] = [
    {
      id: 1,
      description: 'Test Description 1',
      latitude: 0,
      longitude: 0,
      filename: 'test1.mp3',
      file: 'test1.mp3',
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
    },
    {
      id: 2,
      description: 'Test Description 2',
      latitude: 0,
      longitude: 0,
      filename: 'test2.mp3',
      file: 'test2.mp3',
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
    }
  ];

  beforeEach(() => {
    // Default mock implementation
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: null,
      selectAsset: jest.fn(),
      selectedAsset: null
    });
  });

  it('renders without assets', () => {
    render(<AssetList assets={[]} />);
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('asset-item')).not.toBeInTheDocument();
  });

  it('renders with assets', () => {
    render(<AssetList assets={mockAssets} />);
    const assetItems = screen.getAllByTestId('asset-item');
    expect(assetItems).toHaveLength(2);
  });

  it('toggles minimize state when minimize button is clicked', () => {
    const { container } = render(<AssetList assets={mockAssets} />);
    const minimizeButton = container.querySelector('.minimizeButton');
    expect(minimizeButton).toBeInTheDocument();
    
    // Initial state - assets visible
    const assetsContainer = container.querySelector('.asset-list--assets');
    expect(assetsContainer).not.toHaveClass('hidden');
    
    // Click minimize
    fireEvent.click(minimizeButton!);
    expect(assetsContainer).toHaveClass('hidden');
    
    // Click maximize
    fireEvent.click(minimizeButton!);
    expect(assetsContainer).not.toHaveClass('hidden');
  });

  it('toggles filter panel when filter button is clicked', () => {
    const { container } = render(<AssetList assets={mockAssets} />);
    const filterButton = container.querySelector('.showFiltersButton');
    expect(filterButton).toBeInTheDocument();
    const filterPanel = screen.getByTestId('filter-panel');
    
    // Initial state - filter panel hidden
    expect(filterPanel).toHaveStyle({ display: 'none' });
    
    // Click filter button
    fireEvent.click(filterButton!);
    expect(filterPanel).toHaveStyle({ display: 'block' });
    
    // Click filter button again
    fireEvent.click(filterButton!);
    expect(filterPanel).toHaveStyle({ display: 'none' });
  });

  it('uses roundware context when available', () => {
    const mockRoundware = {
      roundware: { someProperty: 'value' },
      selectAsset: jest.fn(),
      selectedAsset: null
    };
    
    (useRoundware as jest.Mock).mockReturnValue(mockRoundware);
    
    render(<AssetList assets={mockAssets} />);
    const assetItems = screen.getAllByTestId('asset-item');
    expect(assetItems).toHaveLength(2);
  });
});
