import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TagDisplay, TagsDisplay } from '../components/AssetTags';
import { useRoundware } from '../hooks';

// Mock the useRoundware hook
jest.mock('../hooks', () => ({
  useRoundware: jest.fn()
}));

describe('TagDisplay Component', () => {
  const mockRoundware = {
    roundware: {
      findTagDescription: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue(mockRoundware);
  });

  it('renders tag description when found', () => {
    mockRoundware.roundware.findTagDescription.mockReturnValue('Test Tag');
    render(<TagDisplay tagId={1} />);
    expect(screen.getByText('Test Tag')).toBeInTheDocument();
    expect(mockRoundware.roundware.findTagDescription).toHaveBeenCalledWith(1, 'speak');
  });

  it('does not render when tag description is not found', () => {
    mockRoundware.roundware.findTagDescription.mockReturnValue(null);
    const { container } = render(<TagDisplay tagId={1} />);
    expect(container.innerHTML).toBe('');
    expect(mockRoundware.roundware.findTagDescription).toHaveBeenCalledWith(1, 'speak');
  });
});

describe('TagsDisplay Component', () => {
  const mockRoundware = {
    roundware: {
      findTagDescription: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue(mockRoundware);
  });

  it('renders multiple tags', () => {
    mockRoundware.roundware.findTagDescription
      .mockReturnValueOnce('Tag 1')
      .mockReturnValueOnce('Tag 2');

    render(<TagsDisplay tagIds={[1, 2]} />);
    
    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
    expect(mockRoundware.roundware.findTagDescription).toHaveBeenCalledTimes(2);
    expect(mockRoundware.roundware.findTagDescription).toHaveBeenNthCalledWith(1, 1, 'speak');
    expect(mockRoundware.roundware.findTagDescription).toHaveBeenNthCalledWith(2, 2, 'speak');
  });

  it('renders empty div when no tags are provided', () => {
    const { container } = render(<TagsDisplay tagIds={[]} />);
    const tagsDiv = container.querySelector('.rw-tags');
    expect(tagsDiv).toBeInTheDocument();
    expect(tagsDiv?.innerHTML).toBe('');
    expect(mockRoundware.roundware.findTagDescription).not.toHaveBeenCalled();
  });

  it('skips rendering tags with no description', () => {
    mockRoundware.roundware.findTagDescription
      .mockReturnValueOnce('Tag 1')
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('Tag 3');

    render(<TagsDisplay tagIds={[1, 2, 3]} />);
    
    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.queryByText('Tag 2')).not.toBeInTheDocument();
    expect(screen.getByText('Tag 3')).toBeInTheDocument();
    expect(mockRoundware.roundware.findTagDescription).toHaveBeenCalledTimes(3);
  });
});
