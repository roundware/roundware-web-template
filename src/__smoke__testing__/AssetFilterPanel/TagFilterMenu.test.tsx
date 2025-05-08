import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagFilterMenu from '../../components/AssetFilterPanel/TagFilterMenu';
import { useRoundware } from '../../hooks';

// Mock the useRoundware hook
jest.mock('../../hooks', () => ({
  useRoundware: jest.fn()
}));

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TextField: ({ label, placeholder, ...props }: any) => (
    <input
      data-testid="tag-filter-input"
      aria-label={label}
      placeholder={placeholder}
      {...props}
    />
  ),
  Snackbar: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="snackbar">{children}</div> : null
  ),
  Alert: ({ children, severity }: { children: React.ReactNode; severity: string }) => (
    <div data-testid={`alert-${severity}`}>{children}</div>
  )
}));

// Mock Autocomplete component
jest.mock('@mui/material/Autocomplete', () => ({
  __esModule: true,
  default: ({ options, onChange, value, renderInput }: any) => (
    <div data-testid="autocomplete">
      {renderInput({
        inputProps: {
          'data-testid': 'tag-filter-input'
        }
      })}
      <div data-testid="options">
        {options.map((option: any) => (
          <div
            key={option.value}
            data-testid={`option-${option.value}`}
            onClick={() => onChange(null, [option])}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}));

describe('TagFilterMenu Component', () => {
  const mockTagGroup = {
    group_short_name: 'test-group',
    header_display_text: 'Test Group',
    display_items: [
      { 
        tag_id: 1, 
        tag_display_text: 'Tag 1',
        default_state: false,
        id: 1,
        parent_id: null
      },
      { 
        tag_id: 2, 
        tag_display_text: 'Tag 2',
        default_state: false,
        id: 2,
        parent_id: null
      }
    ]
  };

  const mockSelectTags = jest.fn();
  const mockSkipTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playlist: {
            trackIdMap: { '1': true, '2': true }
          },
          skipTrack: mockSkipTrack
        }
      },
      selectTags: mockSelectTags,
      selectedTags: {}
    });
  });

  it('renders the tag filter menu with correct label', () => {
    render(<TagFilterMenu tag_group={mockTagGroup} />);
    
    expect(screen.getByLabelText('Test Group')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select one or more...')).toBeInTheDocument();
  });

  it('renders all tag options', () => {
    render(<TagFilterMenu tag_group={mockTagGroup} />);
    
    expect(screen.getByTestId('option-1')).toHaveTextContent('Tag 1');
    expect(screen.getByTestId('option-2')).toHaveTextContent('Tag 2');
  });

  it('calls selectTags when an option is selected', () => {
    render(<TagFilterMenu tag_group={mockTagGroup} />);
    
    fireEvent.click(screen.getByTestId('option-1'));
    
    expect(mockSelectTags).toHaveBeenCalledWith([1], mockTagGroup);
  });

  it('shows success snackbar when tags are selected', async () => {
    render(<TagFilterMenu tag_group={mockTagGroup} />);
    
    fireEvent.click(screen.getByTestId('option-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('snackbar')).toBeInTheDocument();
      expect(screen.getByTestId('alert-success')).toHaveTextContent('Success! Filters updated.');
    });
  });

  it('skips tracks when mixer is available', () => {
    render(<TagFilterMenu tag_group={mockTagGroup} />);
    
    fireEvent.click(screen.getByTestId('option-1'));
    
    expect(mockSkipTrack).toHaveBeenCalledWith(1);
    expect(mockSkipTrack).toHaveBeenCalledWith(2);
  });

  it('handles selected tags correctly', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        mixer: {
          playlist: {
            trackIdMap: { '1': true, '2': true }
          },
          skipTrack: mockSkipTrack
        }
      },
      selectTags: mockSelectTags,
      selectedTags: {
        'test-group': [1]
      }
    });

    render(<TagFilterMenu tag_group={mockTagGroup} />);
    
    const input = screen.getByTestId('tag-filter-input');
    expect(input).toBeInTheDocument();
  });
});
