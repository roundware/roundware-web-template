import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, useHistory } from 'react-router-dom';
import SpeakPage from '../../components/SpeakPage/SpeakPage';
import { useRoundware } from '../../hooks';
import { DraftRecordingProvider } from '../../providers/DraftRecordingProvider';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock the hooks and components
jest.mock('../../hooks', () => ({
  useRoundware: jest.fn(),
}));

// Mock the child components
jest.mock('../../components/SpeakPage/TagSelectForm', () => {
  return jest.fn(() => <div data-testid="tag-select-form">Tag Select Form</div>);
});

jest.mock('../../components/SpeakPage/LocationSelectForm', () => {
  return jest.fn(() => <div data-testid="location-select-form">Location Select Form</div>);
});

jest.mock('../../components/SpeakPage/CreateRecordingForm/CreateRecordingForm', () => {
  return jest.fn(() => <div data-testid="create-recording-form">Create Recording Form</div>);
});

jest.mock('../../components/SpeakPage/CreateRecordingForm/LoopingRecording/LoopingRecordingForm', () => {
  return jest.fn(() => <div data-testid="looping-recording-form">Looping Recording Form</div>);
});

// Mock the config
jest.mock('@/config', () => ({
  speak: {
    recordingMethod: 'standard',
  },
}));

// Create a theme instance
const theme = createTheme();

// Mock history replace
const mockHistoryReplace = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockHistoryReplace,
    location: { search: '' }
  })
}));

// Wrapper component with ThemeProvider and MemoryRouter
const TestWrapper = ({ children, initialEntries = ['/speak'] }: { children: React.ReactNode; initialEntries?: string[] }) => (
  <ThemeProvider theme={theme}>
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  </ThemeProvider>
);

describe('SpeakPage', () => {
  const mockRoundware = {
    uiConfig: {
      // Add any required uiConfig properties here
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundware as jest.Mock).mockReturnValue({ roundware: mockRoundware });
  });

  it('renders nothing when roundware is null', () => {
    (useRoundware as jest.Mock).mockReturnValue({ roundware: null });
    
    const { container } = render(
      <TestWrapper>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when roundware.uiConfig is undefined', () => {
    (useRoundware as jest.Mock).mockReturnValue({ roundware: { uiConfig: undefined } });
    
    const { container } = render(
      <TestWrapper>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('redirects to tag selection when accessing root speak path', () => {
    render(
      <TestWrapper>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(mockHistoryReplace).toHaveBeenCalledWith({
      pathname: '/speak/tags/0',
      search: ''
    });
  });

  it('renders TagSelectForm when on tag selection path', () => {
    render(
      <TestWrapper initialEntries={['/speak/tags/0']}>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('tag-select-form')).toBeInTheDocument();
  });

  it('renders LocationSelectForm when on location path', () => {
    render(
      <TestWrapper initialEntries={['/speak/location']}>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('location-select-form')).toBeInTheDocument();
  });

  it('renders CreateRecordingForm when on recording path with standard recording method', () => {
    render(
      <TestWrapper initialEntries={['/speak/recording']}>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('create-recording-form')).toBeInTheDocument();
  });

  it('renders LoopingRecordingForm when on recording path with looping recording method', () => {
    // Update the config mock for this test
    jest.requireMock('@/config').speak.recordingMethod = 'looping';

    render(
      <TestWrapper initialEntries={['/speak/recording']}>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('looping-recording-form')).toBeInTheDocument();
  });

  it('wraps content in DraftRecordingProvider', () => {
    render(
      <TestWrapper initialEntries={['/speak/tags/0']}>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    // Since DraftRecordingProvider is a context provider, we can verify it's working
    // by checking if its child component (TagSelectForm) is rendered
    expect(screen.getByTestId('tag-select-form')).toBeInTheDocument();
  });

  it('applies correct styles to container elements', () => {
    render(
      <TestWrapper initialEntries={['/speak/tags/0']}>
        <Route path="/speak" component={SpeakPage} />
      </TestWrapper>
    );
    
    // Check for Grid container with correct classes
    const gridContainer = document.querySelector('.MuiGrid-container');
    expect(gridContainer).toHaveClass('MuiGrid-root MuiGrid-container');
    
    // Check for Grid item with correct classes
    const gridItem = document.querySelector('.MuiGrid-item');
    expect(gridItem).toHaveClass('MuiGrid-root MuiGrid-item');
  });
});