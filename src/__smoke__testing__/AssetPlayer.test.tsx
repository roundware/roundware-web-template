import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetPlayer from '../components/AssetPlayer';
import { useRoundware } from '../hooks';
import { IAssetData } from 'roundware-web-framework';

// Mock the useRoundware hook
jest.mock('../hooks', () => ({
  useRoundware: jest.fn()
}));

describe('AssetPlayer Component', () => {
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

  const mockRoundware = {
    mixer: {
      toggle: jest.fn()
    },
    events: {
      logAssetStart: jest.fn(),
      logAssetEnd: jest.fn()
    },
    listenHistory: {
      addAsset: jest.fn()
    }
  };

  beforeEach(() => {
    // Default mock implementation
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      forceUpdate: jest.fn()
    });
  });

  it('returns null when asset is not provided', () => {
    const { container } = render(<AssetPlayer asset={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders audio element with correct attributes', () => {
    const { container } = render(<AssetPlayer asset={mockAsset} />);
    const audioElement = container.querySelector('audio');
    expect(audioElement).not.toBeNull();
    expect(audioElement).toHaveAttribute('controls');
    expect(audioElement).toHaveAttribute('preload', 'none');
    expect(audioElement).toHaveAttribute('controlsList', 'nodownload');
  });

  it('handles MP3 files correctly', () => {
    const { container } = render(<AssetPlayer asset={mockAsset} />);
    const audioElement = container.querySelector('audio');
    const sourceElement = audioElement?.querySelector('source');
    expect(sourceElement).toHaveAttribute('src', 'test.mp3');
  });

  it('converts unsupported file extensions to MP3', () => {
    const assetWithUnsupportedExt = {
      ...mockAsset,
      file: 'test.ogg'
    };
    const { container } = render(<AssetPlayer asset={assetWithUnsupportedExt} />);
    const audioElement = container.querySelector('audio');
    const sourceElement = audioElement?.querySelector('source');
    expect(sourceElement).toHaveAttribute('src', 'test.mp3');
  });

  it('handles play event correctly', () => {
    const { container } = render(<AssetPlayer asset={mockAsset} />);
    const audioElement = container.querySelector('audio');
    expect(audioElement).not.toBeNull();
    
    fireEvent.play(audioElement!);
    
    expect(mockRoundware.mixer.toggle).toHaveBeenCalledWith(false);
    expect(mockRoundware.events.logAssetStart).toHaveBeenCalledWith(mockAsset.id);
    expect(mockRoundware.listenHistory.addAsset).toHaveBeenCalledWith(mockAsset);
  });

  it('handles pause event correctly', () => {
    const { container } = render(<AssetPlayer asset={mockAsset} />);
    const audioElement = container.querySelector('audio');
    expect(audioElement).not.toBeNull();
    
    fireEvent.pause(audioElement!);
    
    expect(mockRoundware.events.logAssetEnd).toHaveBeenCalledWith(mockAsset.id);
  });

  it('handles ended event correctly', () => {
    const { container } = render(<AssetPlayer asset={mockAsset} />);
    const audioElement = container.querySelector('audio');
    expect(audioElement).not.toBeNull();
    
    fireEvent.ended(audioElement!);
    
    expect(mockRoundware.events.logAssetEnd).toHaveBeenCalledWith(mockAsset.id);
  });

  it('applies custom style and className', () => {
    const customStyle = { width: '100%' };
    const customClassName = 'custom-player';
    
    const { container } = render(
      <AssetPlayer 
        asset={mockAsset} 
        style={customStyle} 
        className={customClassName} 
      />
    );
    
    const audioElement = container.querySelector('audio');
    expect(audioElement).not.toBeNull();
    expect(audioElement).toHaveStyle(customStyle);
    expect(audioElement).toHaveClass(customClassName);
  });

  it('handles file without extension', () => {
    const assetWithoutExt = {
      ...mockAsset,
      file: 'test'
    };
    const { container } = render(<AssetPlayer asset={assetWithoutExt} />);
    const audioElement = container.querySelector('audio');
    const sourceElement = audioElement?.querySelector('source');
    expect(sourceElement).toHaveAttribute('src', 'test.mp3');
  });

  it('handles file with multiple dots', () => {
    const assetWithMultipleDots = {
      ...mockAsset,
      file: 'test.something.else'
    };
    const { container } = render(<AssetPlayer asset={assetWithMultipleDots} />);
    const audioElement = container.querySelector('audio');
    const sourceElement = audioElement?.querySelector('source');
    expect(sourceElement).toHaveAttribute('src', 'test.something.mp3');
  });
});
