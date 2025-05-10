import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetListItem from '../components/AssetListItem';
import { useRoundware } from '../hooks';
import { IAssetData } from 'roundware-web-framework';
import moment from 'moment';

// Mock the useRoundware hook
jest.mock('../hooks', () => ({
  useRoundware: jest.fn()
}));

// Mock the AssetPlayer component
jest.mock('../components/AssetPlayer', () => {
  return function MockAssetPlayer({ asset }: { asset: IAssetData }) {
    return <div data-testid="asset-player">Player for asset {asset.id}</div>;
  };
});

// Mock the TagsDisplay component
jest.mock('../components/AssetTags', () => ({
  TagsDisplay: ({ tagIds }: { tagIds: number[] }) => (
    <div data-testid="tags-display">Tags: {tagIds.join(', ')}</div>
  )
}));

describe('AssetListItem Component', () => {
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

  beforeEach(() => {
    // Default mock implementation
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { someProperty: 'value' },
      selectAsset: jest.fn(),
      selectedAsset: null
    });
  });

  it('renders with player by default', () => {
    render(<AssetListItem asset={mockAsset} />);
    
    // Check if the asset player is rendered
    expect(screen.getByTestId('asset-player')).toBeInTheDocument();
    
    // Check if the creation date is formatted correctly
    expect(screen.getByText(moment(mockAsset.created).format('LLL'))).toBeInTheDocument();
    
    // Check if tags are displayed
    expect(screen.getByTestId('tags-display')).toBeInTheDocument();
    expect(screen.getByText('Tags: 1, 2')).toBeInTheDocument();
  });

  it('renders without player when player prop is false', () => {
    render(<AssetListItem asset={mockAsset} player={false} />);
    expect(screen.queryByTestId('asset-player')).not.toBeInTheDocument();
  });

  it('applies selected class when asset is selected', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { someProperty: 'value' },
      selectAsset: jest.fn(),
      selectedAsset: mockAsset
    });

    const { container } = render(<AssetListItem asset={mockAsset} />);
    const item = container.querySelector('.asset-list--item');
    expect(item).toHaveClass('asset-list--item--selected');
  });

  it('calls selectAsset when map pin button is clicked', () => {
    const mockSelectAsset = jest.fn();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { someProperty: 'value' },
      selectAsset: mockSelectAsset,
      selectedAsset: null
    });

    render(<AssetListItem asset={mockAsset} />);
    const mapPinButton = screen.getByTitle('show recording on map');
    fireEvent.click(mapPinButton);
    expect(mockSelectAsset).toHaveBeenCalledWith(mockAsset);
  });

  it('shows user link when asset has a username', () => {
    const assetWithUser = {
      ...mockAsset,
      user: { username: 'testuser', email: 'test@example.com' }
    };

    render(<AssetListItem asset={assetWithUser} />);
    const userLink = screen.getByRole('link');
    expect(userLink).not.toHaveClass('hidden');
  });

  it('hides user link when asset has no username', () => {
    const assetWithoutUser = {
      ...mockAsset,
      user: { username: '', email: '' }
    };

    render(<AssetListItem asset={assetWithoutUser} />);
    const userLink = screen.getByRole('link');
    expect(userLink).toHaveClass('hidden');
  });

  it('returns null when roundware context is not available', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: null,
      selectAsset: jest.fn(),
      selectedAsset: null
    });

    const { container } = render(<AssetListItem asset={mockAsset} />);
    expect(container.firstChild).toBeNull();
  });
});
