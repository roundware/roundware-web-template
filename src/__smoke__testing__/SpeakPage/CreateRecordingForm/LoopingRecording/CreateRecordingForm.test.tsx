import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CreateRecordingForm from '@/components/SpeakPage/CreateRecordingForm/CreateRecordingForm';
import { useUIContext } from '@/context/UIContext';
import { useRoundwareDraft } from '@/hooks';
import config from '@/config';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

// Create a mock theme
const mockTheme = createTheme({
  spacing: (factor: number) => `${0.25 * factor}rem`,
  palette: {
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#000000',
    },
  },
});

// Mock wavesurfer-react
jest.mock('wavesurfer-react', () => ({
  WaveSurfer: () => <div data-testid="wave-surfer" />,
  WaveForm: () => <div data-testid="wave-form" />,
}));

// Mock the hooks and dependencies
jest.mock('@/context/UIContext', () => ({
  useUIContext: jest.fn(),
}));

jest.mock('@/hooks', () => ({
  useRoundwareDraft: jest.fn(),
  useRoundware: () => ({
    roundware: {
      project: {
        legalAgreement: 'Test Agreement',
      },
    },
  }),
}));

jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    speak: {
      allowPhotos: true,
      allowText: true,
      defaultSpeakTags: [1, 2],
    },
    project: {
      id: 123,
    },
    features: {
      autoResetTimeSeconds: 5,
    },
  },
}));

// Create a base mock for useCreateRecording
const baseCreateRecordingMock = {
  draftMediaUrl: '',
  textAsset: null,
  imageAssets: [],
  set_draft_recording_media: jest.fn(),
  set_draft_media_url: jest.fn(),
  draftRecording: {
    location: { latitude: 40.7128, longitude: -74.0060 },
    reset: jest.fn(),
  },
  setSuccess: jest.fn(),
  selectAsset: jest.fn(),
  roundware: {
    makeEnvelope: jest.fn(),
    user: {
      updateUser: jest.fn(),
    },
  },
  draftRecordingMedia: new Blob(['test'], { type: 'audio/mp3' }),
  updateAssets: jest.fn(),
  saving: false,
  resetFilters: jest.fn(),
  history: {
    push: jest.fn(),
    location: { search: '' },
  },
  setTextAsset: jest.fn(),
  setSaving: jest.fn(),
  deleteRecording: jest.fn(),
  legalModalOpen: false,
  setLegalModalOpen: jest.fn(),
  setImageAssets: jest.fn(),
  success: null as { envelope_ids: string[] } | null,
  selected_tags: [],
  error: null as Error | null,
  isRecording: false,
  toggleRecording: jest.fn(),
  isExtraSmallScreen: false,
  setError: jest.fn(),
  maxRecordingLength: 60,
  stopRecording: jest.fn(),
  setDeleteModalOpen: jest.fn(),
  deleteModalOpen: false,
  timer: null,
  setTimer: jest.fn(),
  progress: 0,
  isPermissionDenied: false,
  setIsPermissionDenied: jest.fn(),
};

// Mock the useCreateRecording hook
const useCreateRecordingMock = jest.fn(() => baseCreateRecordingMock);
jest.mock('@/components/SpeakPage/CreateRecordingForm/useCreateRecording', () => ({
  __esModule: true,
  default: () => useCreateRecordingMock(),
}));

// Helper function to render component with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={mockTheme}>
        {component}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('CreateRecordingForm', () => {
  const mockHandleShare = jest.fn();
  const mockUser = { id: 1, name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
    useCreateRecordingMock.mockReturnValue(baseCreateRecordingMock);
    (useUIContext as jest.Mock).mockReturnValue({ handleShare: mockHandleShare });
    (useRoundwareDraft as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('renders initial state correctly', () => {
    renderWithTheme(<CreateRecordingForm />);
    
    expect(screen.getByText('No selected tags')).toBeInTheDocument();
    expect(screen.getByText('Tap to Record')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('handles recording toggle', async () => {
    const { rerender } = renderWithTheme(<CreateRecordingForm />);
    
    // Update the mock with isRecording true
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      isRecording: true,
    });

    rerender(
      <MemoryRouter>
        <ThemeProvider theme={mockTheme}>
          <CreateRecordingForm />
        </ThemeProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Tap to Stop')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    renderWithTheme(<CreateRecordingForm />);
    
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    const input = screen.getByTestId('FileUploadIcon').closest('label')?.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.change(input!, { target: { files: [file] } });
    });
  });

  it('handles delete recording', async () => {
    const mockDeleteRecording = jest.fn();
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      draftMediaUrl: 'test-url',
      deleteRecording: mockDeleteRecording,
      deleteModalOpen: true,
    });

    renderWithTheme(<CreateRecordingForm />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      const confirmButton = screen.getByText('Yes, delete it!');
      fireEvent.click(confirmButton);
      expect(mockDeleteRecording).toHaveBeenCalled();
    });
  });

  it('handles successful submission', () => {
    const mockSuccess = { envelope_ids: ['test-envelope-id'] };
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      success: mockSuccess,
    });

    renderWithTheme(<CreateRecordingForm />);
    
    expect(screen.getByText('Upload Complete! Thank you for participating!')).toBeInTheDocument();
    
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);
    expect(mockHandleShare).toHaveBeenCalledWith(`${window.location.origin}/listen?eid=test-envelope-id`);
  });

  it('handles permission denied state', () => {
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      isPermissionDenied: true,
    });

    renderWithTheme(<CreateRecordingForm />);
    
    expect(screen.getByTestId('MicIcon')).toBeInTheDocument();
    expect(screen.getByText('Tap to Record')).toBeInTheDocument();
  });

  it('handles saving state', () => {
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      saving: true,
    });

    renderWithTheme(<CreateRecordingForm />);
    
    expect(screen.getByText('Uploading your contribution now! Please keep this page open until we finish uploading.')).toBeInTheDocument();
  });

  it('handles error state', () => {
    const mockError = new Error('Test error');
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      error: mockError,
    });

    renderWithTheme(<CreateRecordingForm />);
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('handles additional media menu', () => {
    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      draftMediaUrl: 'test-url',
    });

    renderWithTheme(<CreateRecordingForm />);
    
    const additionalMediaButton = screen.getByText('Add Media');
    fireEvent.click(additionalMediaButton);
    
    expect(screen.getByText('Add Text')).toBeInTheDocument();
    expect(screen.getByText('Add Photo')).toBeInTheDocument();
  });

  it('handles legal agreement form', async () => {
    const mockSetLegalModalOpen = jest.fn();
    const mockSetSaving = jest.fn();
    const mockSetError = jest.fn();
    const mockSetSuccess = jest.fn();
    const mockUpdateAssets = jest.fn();
    const mockSelectAsset = jest.fn();

    useCreateRecordingMock.mockReturnValue({
      ...baseCreateRecordingMock,
      legalModalOpen: true,
      draftMediaUrl: 'test-url',
      setLegalModalOpen: mockSetLegalModalOpen,
      setSaving: mockSetSaving,
      setError: mockSetError,
      setSuccess: mockSetSuccess,
      updateAssets: mockUpdateAssets,
      selectAsset: mockSelectAsset,
      draftRecording: {
        ...baseCreateRecordingMock.draftRecording,
        location: { latitude: 40.7128, longitude: -74.0060 },
      },
      roundware: {
        ...baseCreateRecordingMock.roundware,
        makeEnvelope: jest.fn().mockResolvedValue({
          upload: jest.fn().mockResolvedValue({ id: 'test-asset-id' }),
        }),
      },
    });

    renderWithTheme(<CreateRecordingForm />);
    
    // Wait for the dialog to be present
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find and click the checkbox
    const checkbox = screen.getByRole('checkbox', { name: /i agree/i });
    fireEvent.click(checkbox);

    // Find and click the submit button
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Verify the expected sequence of actions
    await waitFor(() => {
      expect(mockSetLegalModalOpen).toHaveBeenCalledWith(false);
      expect(mockSetSaving).toHaveBeenCalledWith(true);
    });
  });
});
