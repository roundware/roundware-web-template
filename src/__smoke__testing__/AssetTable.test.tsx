import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AssetTable from '../components/AssetTable';
import { useRoundware } from '../hooks';
import { IAssetData } from 'roundware-web-framework';

// Mock the useRoundware hook
jest.mock('../hooks', () => ({
  useRoundware: jest.fn()
}));

// Mock moment for consistent date formatting
jest.mock('moment', () => {
  return (date: string) => ({
    format: () => 'Mocked Date'
  });
});

describe('AssetTable Component', () => {
  const mockAssets: IAssetData[] = [
    {
      id: 1,
      description: 'Asset 1',
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
      alt_text_loc_ids: [],
      user: {
        username: 'testuser1',
        email: 'testuser1@example.com'
      }
    },
    {
      id: 2,
      description: 'Asset 2',
      latitude: 0,
      longitude: 0,
      filename: 'test2.mp3',
      file: 'test2.mp3',
      volume: 1,
      submitted: true,
      created: '2023-01-02T00:00:00Z',
      updated: '2023-01-02T00:00:00Z',
      weight: 1,
      start_time: 0,
      end_time: 100,
      media_type: 'audio',
      audio_length_in_seconds: 100,
      tag_ids: [2, 3],
      session_id: 1,
      project_id: 1,
      language_id: 1,
      envelope_ids: [],
      description_loc_ids: [],
      alt_text_loc_ids: [],
      user: null
    }
  ];

  const mockRoundware = {
    selectAsset: jest.fn(),
    selectedAsset: null,
    assetPage: mockAssets,
    assetsPerPage: 10,
    assetPageIndex: 0,
    setAssetsPerPage: jest.fn(),
    setAssetPageIndex: jest.fn(),
    setUserFilter: jest.fn(),
    sortField: { name: 'created', asc: true },
    setSortField: jest.fn(),
    roundware: {
      uiConfig: {
        listen: [
          {
            group_short_name: 'test_group',
            name: 'Test Group',
            header_display_text: 'Test Group',
            display_items: [
              {
                tag_id: 1,
                tag_display_text: 'Tag 1'
              },
              {
                tag_id: 2,
                tag_display_text: 'Tag 2'
              }
            ]
          }
        ]
      },
      findTagDescription: jest.fn().mockReturnValue('Mock Tag Description')
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue(mockRoundware);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with correct headers', () => {
    render(<AssetTable />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('renders asset rows correctly', () => {
    render(<AssetTable />);
    const dateElements = screen.getAllByText('Mocked Date');
    expect(dateElements).toHaveLength(mockAssets.length);
  });

  it('handles row selection', () => {
    render(<AssetTable />);
    const mapPinButtons = screen.getAllByTitle('show recording on map');
    fireEvent.click(mapPinButtons[0]);
    expect(mockRoundware.selectAsset).toHaveBeenCalledWith(mockAssets[0]);
  });

  it('shows user filter button only for assets with users', () => {
    render(<AssetTable />);
    const userButtons = screen.getAllByTitle(/see all of .* submissions/);
    expect(userButtons).toHaveLength(1); // Only one asset has a user

    fireEvent.click(userButtons[0]);
    expect(mockRoundware.setUserFilter).toHaveBeenCalledWith('testuser1');
  });

  it('handles sort field changes', () => {
    render(<AssetTable />);
    const sortButton = screen.getByText('Created');
    fireEvent.click(sortButton);
    expect(mockRoundware.setSortField).toHaveBeenCalledWith({
      name: 'created',
      asc: false
    });
  });

  it('handles rows per page changes', () => {
    render(<AssetTable />);
    const rowsPerPageSelect = screen.getByRole('combobox', { name: 'Rows per page:' });
    expect(rowsPerPageSelect).toBeInTheDocument();
    expect(rowsPerPageSelect).toHaveAttribute('aria-expanded', 'false');
  });

  it('highlights selected asset row', () => {
    const selectedAsset = mockAssets[0];
    (useRoundware as jest.Mock).mockReturnValue({
      ...mockRoundware,
      selectedAsset
    });

    const { container } = render(<AssetTable />);
    const selectedRow = container.querySelector('.Mui-selected');
    expect(selectedRow).toBeInTheDocument();
  });

  it('renders filter panel', () => {
    render(<AssetTable />);
    expect(screen.getByText('filter by user')).toBeInTheDocument();
    expect(screen.getByText('Test Group')).toBeInTheDocument();
  });
});
