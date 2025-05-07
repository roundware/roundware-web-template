import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, useHistory } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TagSelectForm from '../../components/SpeakPage/TagSelectForm';
import { useRoundware, useRoundwareDraft } from '../../hooks';
import config from '@/config';

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock the hooks
jest.mock('../../hooks', () => ({
  useRoundware: jest.fn(),
  useRoundwareDraft: jest.fn(),
}));

// Mock the config
jest.mock('@/config', () => ({
  speak: {
    allowSpeakTags: true,
  },
}));

// Mock react-router-dom
const mockHistory = {
  push: jest.fn(),
  replace: jest.fn(),
  location: { search: '' },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => mockHistory,
}));

describe('TagSelectForm', () => {
  const mockMatch = {
    params: { tagGroupIndex: '0' },
    path: '/speak/tags/:tagGroupIndex',
  };

  const mockTagGroups = [
    {
      header_display_text: 'Test Tag Group 1',
      display_items: [
        { id: 1, tag_display_text: 'Tag 1', parent_id: null },
        { id: 2, tag_display_text: 'Tag 2', parent_id: null },
      ],
    },
    {
      header_display_text: 'Test Tag Group 2',
      display_items: [
        { id: 3, tag_display_text: 'Tag 3', parent_id: 1 },
        { id: 4, tag_display_text: 'Tag 4', parent_id: 1 },
      ],
    },
  ];

  const mockSetTags = jest.fn();
  const mockSelectTag = jest.fn();

  // Create a theme instance
  const theme = createTheme();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useRoundware hook
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        uiConfig: {
          speak: mockTagGroups,
        },
      },
    });

    // Mock useRoundwareDraft hook
    (useRoundwareDraft as jest.Mock).mockReturnValue({
      tags: [],
      setTags: mockSetTags,
      selectTag: mockSelectTag,
    });
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/speak/tags/0']}>
          <Route path="/speak/tags/:tagGroupIndex">
            <TagSelectForm match={mockMatch} />
          </Route>
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  it('renders the first tag group correctly', () => {
    renderComponent();
    
    expect(screen.getByText('1. Test Tag Group 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
  });

  it('handles tag selection correctly', async () => {
    renderComponent();
    
    const tag1 = screen.getByText('Tag 1');
    fireEvent.click(tag1);

    await waitFor(() => {
      expect(mockSetTags).toHaveBeenCalledWith([1]);
    });
  });

  it('shows error when trying to proceed without selection', () => {
    renderComponent();
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Please select an option!')).toBeInTheDocument();
  });

  it('navigates to next tag group when selection is made', async () => {
    renderComponent();
    
    const tag1 = screen.getByText('Tag 1');
    fireEvent.click(tag1);

    await waitFor(() => {
      expect(mockHistory.push).toHaveBeenCalled();
    });
  });

  it('handles back navigation correctly', () => {
    renderComponent();
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockHistory.replace).toHaveBeenCalledWith('/');
  });

  it('handles single choice scenario correctly', () => {
    // Mock a tag group with single choice
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        uiConfig: {
          speak: [{
            header_display_text: 'Single Choice',
            display_items: [
              { id: 1, tag_display_text: 'Single Tag', parent_id: null },
            ],
          }],
        },
      },
    });

    renderComponent();
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockSelectTag).toHaveBeenCalledWith(1);
  });

  it('handles random tag selection when uiitem_filter is set', () => {
    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        uiConfig: {
          speak: [{
            header_display_text: 'Random Tags',
            display_items: [
              { id: 1, tag_display_text: 'Tag 1', parent_id: null },
              { id: 2, tag_display_text: 'Tag 2', parent_id: null },
              { id: 3, tag_display_text: 'Tag 3', parent_id: null },
            ],
            uiitem_filter: 'random-2',
          }],
        },
      },
    });

    renderComponent();
    
    // Should only show 2 random tags
    const tagElements = screen.getAllByText(/Tag \d/);
    expect(tagElements.length).toBe(2);
  });

  it('redirects to location page when allowSpeakTags is false', () => {
    (config.speak.allowSpeakTags as boolean) = false;
    
    renderComponent();
    
    expect(mockHistory.replace).toHaveBeenCalledWith({
      pathname: '/speak/location',
      search: '',
    });
  });
});
