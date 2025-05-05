import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetLoadingOverlay from '@/components/ListenPage/Map/AssetLoadingOverlay';
import { useRoundware } from '@/hooks/index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useRoundware hook
jest.mock('@/hooks/index', () => ({
    useRoundware: jest.fn()
}));

// Create a test theme
const testTheme = createTheme();

describe('AssetLoadingOverlay Smoke Tests', () => {
    const mockRoundware = {
        assetData: null as any
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRoundware as jest.Mock).mockReturnValue({
            roundware: mockRoundware
        });
    });

    const renderWithTheme = (component: React.ReactElement) => {
        return render(
            <ThemeProvider theme={testTheme}>
                {component}
            </ThemeProvider>
        );
    };

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            renderWithTheme(<AssetLoadingOverlay />);
            expect(screen.getByText('Loading audio...')).toBeInTheDocument();
        });

        it('shows loading state when assetData is not an array', () => {
            mockRoundware.assetData = null;
            renderWithTheme(<AssetLoadingOverlay />);
            
            const backdrop = document.querySelector('.MuiBackdrop-root');
            const spinner = screen.getByRole('progressbar', { hidden: true });
            
            expect(backdrop).toBeInTheDocument();
            expect(backdrop).toHaveStyle({ opacity: '1' });
            expect(spinner).toBeInTheDocument();
            expect(screen.getByText('Loading audio...')).toBeInTheDocument();
        });

        it('hides loading state when assetData is an array', () => {
            mockRoundware.assetData = [];
            renderWithTheme(<AssetLoadingOverlay />);
            
            const backdrop = document.querySelector('.MuiBackdrop-root');
            expect(backdrop).toBeInTheDocument();
            expect(backdrop).toHaveStyle({ opacity: '0' });
        });
    });

    describe('UI Elements', () => {
        it('renders with correct styling classes', () => {
            renderWithTheme(<AssetLoadingOverlay />);
            
            const backdrop = document.querySelector('.MuiBackdrop-root');
            const card = document.querySelector('.MuiCard-root');
            const spinner = screen.getByRole('progressbar', { hidden: true });
            
            expect(backdrop?.className).toContain('MuiBackdrop-root');
            expect(card?.className).toContain('MuiCard-root');
            expect(spinner.className).toContain('MuiCircularProgress-root');
        });

        it('renders loading message with correct text', () => {
            renderWithTheme(<AssetLoadingOverlay />);
            expect(screen.getByText('Loading audio...')).toBeInTheDocument();
        });
    });
}); 