import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetFilterPanel from '../../components/AssetFilterPanel';
import { useRoundware } from '../../hooks';

// Mock the useRoundware hook
jest.mock('../../hooks', () => ({
  useRoundware: jest.fn()
}));

// Mock the TagFilterMenu component
jest.mock('../../components/AssetFilterPanel/TagFilterMenu', () => ({
  __esModule: true,
  default: ({ tag_group }: { tag_group: any }) => (
    <div data-testid={`tag-filter-menu-${tag_group.group_short_name}`}>
      {tag_group.group_short_name}
    </div>
  )
}));

describe('AssetFilterPanel Component', () => {
  const mockSetUserFilter = jest.fn();
  const mockRoundware = {
    uiConfig: {
      listen: [
        { group_short_name: 'group1', name: 'Group 1' },
        { group_short_name: 'group2', name: 'Group 2' }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      userFilter: '',
      setUserFilter: mockSetUserFilter
    });
  });

  it('renders nothing when roundware.uiConfig.listen is not available', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: { uiConfig: null },
      userFilter: '',
      setUserFilter: mockSetUserFilter
    });

    const { container } = render(<AssetFilterPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the filter panel with user filter input', () => {
    render(<AssetFilterPanel />);
    
    expect(screen.getByText('filter by user')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders tag filter menus for each tag group', () => {
    render(<AssetFilterPanel />);
    
    expect(screen.getByTestId('tag-filter-menu-group1')).toBeInTheDocument();
    expect(screen.getByTestId('tag-filter-menu-group2')).toBeInTheDocument();
  });

  it('updates user filter when input changes', () => {
    render(<AssetFilterPanel />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test user' } });
    
    // Wait for debounce
    setTimeout(() => {
      expect(mockSetUserFilter).toHaveBeenCalledWith('test user');
    }, 200);
  });

  it('applies hidden class when hidden prop is true', () => {
    const { container } = render(<AssetFilterPanel hidden={true} />);
    
    const filterContainer = container.querySelector('.asset-list--filters');
    expect(filterContainer).toHaveClass('hidden');
  });

  it('does not apply hidden class when hidden prop is false', () => {
    const { container } = render(<AssetFilterPanel hidden={false} />);
    
    const filterContainer = container.querySelector('.asset-list--filters');
    expect(filterContainer).not.toHaveClass('hidden');
  });
});
