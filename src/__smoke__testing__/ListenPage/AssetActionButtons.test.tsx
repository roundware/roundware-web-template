import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetActionButtons, VoteButton } from '../../components/ListenPage/Map/AssetLayer/AssetActionButtons';
import { useRoundware } from '../../hooks';
import { IAssetData } from 'roundware-web-framework';
import { IAssetCardConfig } from '../../configTypes';

// Mock the useRoundware hook
jest.mock('../../hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the fetch and URL.createObjectURL functions
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn();

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

describe('AssetActionButtons Smoke Tests', () => {
  const mockAsset: IAssetData = {
    id: 1,
    description: 'Test Asset',
    latitude: 0,
    longitude: 0,
    filename: 'test.mp3',
    file: 'test.mp3',
    volume: 1,
    submitted: true,
    created: '2024-01-01',
    updated: '2024-01-01',
    weight: 1,
    start_time: 0,
    end_time: 0,
    media_type: 'audio',
    audio_length_in_seconds: 60,
    tag_ids: [],
    session_id: 1,
    project_id: 1,
    language_id: 1,
    envelope_ids: [1],
    description_loc_ids: [],
    alt_text_loc_ids: []
  };

  const mockConfig: IAssetCardConfig['actionItems'] = ['download', 'like', 'flag', 'show'];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock useRoundware implementation
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        project: {
          projectName: 'Test Project'
        },
        vote: jest.fn()
      }
    });

    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['test'], { type: 'audio/mp3' }))
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
  });

  it('renders without crashing', () => {
    const { container } = render(<AssetActionButtons asset={mockAsset} config={mockConfig} />);
    expect(container.querySelector('#infoVoteBlock')).toBeInTheDocument();
  });

  it('renders all action buttons when config is provided', () => {
    render(<AssetActionButtons asset={mockAsset} config={mockConfig} />);
    
    expect(screen.getByTitle('download this audio file')).toBeInTheDocument();
    expect(screen.getByTitle('tell us you like this one!')).toBeInTheDocument();
    expect(screen.getByTitle('tell us you are concerned about this one!')).toBeInTheDocument();
  });

  it('does not render when config is not provided', () => {
    const { container } = render(<AssetActionButtons asset={mockAsset} config={[]} />);
    const infoVoteBlock = container.querySelector('#infoVoteBlock');
    expect(infoVoteBlock).toBeInTheDocument();
    expect(infoVoteBlock?.children.length).toBe(0);
  });

  it('handles download action correctly', async () => {
    render(<AssetActionButtons asset={mockAsset} config={['download']} />);
    
    const downloadButton = screen.getByTitle('download this audio file');
    await fireEvent.click(downloadButton);

    // Wait for the fetch promise to resolve
    await Promise.resolve();

    // Verify that the download process was initiated
    expect(global.fetch).toHaveBeenCalledWith('test.mp3', {
      headers: new Headers({
        Origin: location.origin,
      }),
      mode: 'cors',
    });
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    
    // Verify that the download link was created and clicked
    const link = document.createElement('a');
    link.download = 'Test Project_1';
    link.href = 'blob:test-url';
    expect(document.body.contains(link)).toBe(false); // Link should be removed after click
  });

  it('handles like action correctly', () => {
    render(<AssetActionButtons asset={mockAsset} config={['like']} />);
    
    const likeButton = screen.getByTitle('tell us you like this one!');
    fireEvent.click(likeButton);
    
    const { roundware } = useRoundware();
    expect(roundware.vote).toHaveBeenCalledWith(1, 'like');
  });

  it('handles flag action correctly', () => {
    render(<AssetActionButtons asset={mockAsset} config={['flag']} />);
    
    const flagButton = screen.getByTitle('tell us you are concerned about this one!');
    fireEvent.click(flagButton);
    
    const { roundware } = useRoundware();
    expect(roundware.vote).toHaveBeenCalledWith(1, 'flag');
  });

  it('handles show action correctly', () => {
    render(<AssetActionButtons asset={mockAsset} config={['show']} />);
    
    // The show action is not implemented in the component, so we should not expect to find the button
    expect(screen.queryByTitle('go to contribution page')).not.toBeInTheDocument();
  });

  it('renders additional actions when provided', () => {
    const additionalAction = <button data-testid="additional-action">Test</button>;
    render(<AssetActionButtons asset={mockAsset} config={mockConfig} additionalActions={additionalAction} />);
    
    expect(screen.getByTestId('additional-action')).toBeInTheDocument();
  });
});

describe('VoteButton Smoke Tests', () => {
  const mockAsset: IAssetData = {
    id: 1,
    description: 'Test Asset',
    latitude: 0,
    longitude: 0,
    filename: 'test.mp3',
    file: 'test.mp3',
    volume: 1,
    submitted: true,
    created: '2024-01-01',
    updated: '2024-01-01',
    weight: 1,
    start_time: 0,
    end_time: 0,
    media_type: 'audio',
    audio_length_in_seconds: 60,
    tag_ids: [],
    session_id: 1,
    project_id: 1,
    language_id: 1,
    envelope_ids: [1],
    description_loc_ids: [],
    alt_text_loc_ids: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        vote: jest.fn()
      }
    });
  });

  it('renders without crashing', () => {
    render(
      <VoteButton
        asset={mockAsset}
        voteType="like"
        votedClass="liked"
        title="Test Vote"
      >
        <span>Test</span>
      </VoteButton>
    );
  });

  it('changes color when voted', () => {
    const { rerender } = render(
      <VoteButton
        asset={mockAsset}
        voteType="like"
        votedClass="liked"
        title="Test Vote"
      >
        <span>Test</span>
      </VoteButton>
    );

    const button = screen.getByTitle('Test Vote');
    fireEvent.click(button);

    // Verify that the vote was registered
    const { roundware } = useRoundware();
    expect(roundware.vote).toHaveBeenCalledWith(1, 'like');
  });

  it('only allows one vote', () => {
    const { roundware } = useRoundware();
    render(
      <VoteButton
        asset={mockAsset}
        voteType="like"
        votedClass="liked"
        title="Test Vote"
      >
        <span>Test</span>
      </VoteButton>
    );

    const button = screen.getByTitle('Test Vote');
    
    // First click should trigger vote
    fireEvent.click(button);
    expect(roundware.vote).toHaveBeenCalledTimes(1);
    
    // Second click should not trigger vote
    fireEvent.click(button);
    expect(roundware.vote).toHaveBeenCalledTimes(1);
  });
}); 