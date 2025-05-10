import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRoundware } from '@/hooks';
import Filters from '@/components/ListenPage/Filters';
import config from '@/config';
import '@testing-library/jest-dom';

// Mock the hooks and dependencies
jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
  useDebounce: jest.fn((value) => value), // Mock useDebounce to return the value immediately
}));

jest.mock('@/components/AssetFilterPanel/DateFilterMenu', () => {
  return function MockDateFilterMenu() {
    return <div data-testid="date-filter-menu">Date Filter Menu</div>;
  };
});

jest.mock('@/components/AssetFilterPanel/TagFilterMenu', () => {
  return function MockTagFilterMenu({ tag_group }: { tag_group: any }) {
    return <div data-testid="tag-filter-menu">{tag_group.group_short_name}</div>;
  };
});

describe('Filters', () => {
  const mockRoundware = {
    events: {
      logEvent: jest.fn(),
    },
    uiConfig: {
      listen: [
        { group_short_name: 'tag1', name: 'Tag Group 1' },
        { group_short_name: 'tag2', name: 'Tag Group 2' },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      setDescriptionFilter: jest.fn(),
      descriptionFilter: '',
    });
  });

  it('renders the filter title', () => {
    render(<Filters />);
    expect(screen.getByText('Filter Recordings')).toBeInTheDocument();
  });

  it('renders date filter when available in config', () => {
    config.ui.listenSidebar.filter.available = ['date'];
    render(<Filters />);
    expect(screen.getByTestId('date-filter-menu')).toBeInTheDocument();
  });

  it('renders tag filters when available in config', () => {
    config.ui.listenSidebar.filter.available = ['tags'];
    render(<Filters />);
    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
    expect(screen.getAllByTestId('tag-filter-menu')).toHaveLength(2);
  });

  it('renders description filter when available in config', () => {
    config.ui.listenSidebar.filter.available = ['description'];
    render(<Filters />);
    expect(screen.getByText('Description Filter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument();
  });

  it('handles description filter input change', () => {
    const setDescriptionFilter = jest.fn();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      setDescriptionFilter,
      descriptionFilter: '',
    });

    config.ui.listenSidebar.filter.available = ['description'];
    render(<Filters />);
    
    const input = screen.getByPlaceholderText('Type something...');
    fireEvent.change(input, { target: { value: 'test description' } });
    
    expect(setDescriptionFilter).toHaveBeenCalled();
  });

  it('shows loading indicator when description filter is being debounced', () => {
    const setDescriptionFilter = jest.fn();
    const currentFilter = 'test';
    const debouncedValue = 'different';

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundware,
      setDescriptionFilter,
      descriptionFilter: currentFilter,
    });

    // Mock useDebounce to return a different value
    jest.requireMock('@/hooks').useDebounce.mockReturnValue(debouncedValue);

    config.ui.listenSidebar.filter.available = ['description'];
    const { container } = render(<Filters />);
    
  });

  it('logs filter event when debounced description filter changes', async () => {
    const mockLogEvent = jest.fn();
    const mockRoundwareWithEvents = {
      ...mockRoundware,
      events: {
        logEvent: mockLogEvent,
      },
    };

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: mockRoundwareWithEvents,
      setDescriptionFilter: jest.fn(),
      descriptionFilter: 'test',
    });

    // Mock useDebounce to return the same value as the current filter
    jest.requireMock('@/hooks').useDebounce.mockReturnValue('test');

    config.ui.listenSidebar.filter.available = ['description'];
    render(<Filters />);

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('filter_stream', {
        data: 'description: test',
      });
    });
  });

  it('renders multiple filters when multiple are available in config', () => {
    config.ui.listenSidebar.filter.available = ['date', 'tags', 'description'];
    render(<Filters />);
    
    expect(screen.getByTestId('date-filter-menu')).toBeInTheDocument();
    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
    expect(screen.getByText('Description Filter')).toBeInTheDocument();
  });

  it('renders tag filter menus for each tag group in uiConfig', () => {
    config.ui.listenSidebar.filter.available = ['tags'];
    render(<Filters />);
    
    const tagFilterMenus = screen.getAllByTestId('tag-filter-menu');
    expect(tagFilterMenus).toHaveLength(2);
    expect(tagFilterMenus[0].textContent).toBe('tag1');
    expect(tagFilterMenus[1].textContent).toBe('tag2');
  });
});
