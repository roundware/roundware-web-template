import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddLoopVoiceButton from '@/components/ListenPage/Map/AddLoopVoiceButton';
import { useRoundware } from '@/hooks/index';
import { point } from '@turf/helpers';

// Mock the useRoundware hook
jest.mock('@/hooks/index', () => ({
    useRoundware: jest.fn()
}));

// Mock window.location
const mockLocation = {
    href: ''
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
});

describe('AddLoopVoiceButton Smoke Tests', () => {
    const mockRoundware = {
        listenerLocation: {
            latitude: 40.7128,
            longitude: -74.0060
        },
        mixer: {
            initContext: jest.fn(),
            stop: jest.fn(),
            speakerEngine: {
                updateParams: jest.fn(),
                speakers: [
                    {
                        volumeByLocation: jest.fn().mockReturnValue(0.8),
                        minVolume: 0.5
                    }
                ]
            }
        }
    };

    const dialogText = 'Sorry, but there is no choir here for you to join. Please find a new location for your participation!';

    beforeEach(() => {
        jest.clearAllMocks();
        (useRoundware as jest.Mock).mockReturnValue({
            roundware: mockRoundware,
            forceUpdate: jest.fn()
        });
        mockLocation.href = '';
    });

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            render(<AddLoopVoiceButton />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('renders with correct initial state', () => {
            render(<AddLoopVoiceButton />);
            expect(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' })).toBeInTheDocument();
            expect(screen.queryByText(dialogText)).not.toBeInTheDocument();
        });
    });

    describe('Button Interaction', () => {
        it('shows dialog when no speakers are available', async () => {
            // Mock no speakers available
            mockRoundware.mixer.speakerEngine.speakers = [];
            render(<AddLoopVoiceButton />);
            
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            
            await waitFor(() => {
                const dialog = document.querySelector('.MuiDialog-root');
                expect(dialog).toBeInTheDocument();
                expect(dialog?.textContent).toContain(dialogText);
            }, { timeout: 3000 });
        });

        it('redirects to speak page when speakers are available', async () => {
            // Mock speaker with volume above minimum
            mockRoundware.mixer.speakerEngine.speakers = [{
                volumeByLocation: jest.fn().mockReturnValue(0.8),
                minVolume: 0.5
            }];
            
            render(<AddLoopVoiceButton />);
            
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            
            await waitFor(() => {
                expect(mockRoundware.mixer.initContext).toHaveBeenCalled();
                expect(mockRoundware.mixer.speakerEngine.updateParams).toHaveBeenCalledWith({
                    listenerPoint: point([-74.0060, 40.7128])
                });
                expect(mockRoundware.mixer.stop).toHaveBeenCalled();
                expect(window.location.href).toBe('/speak?lat=40.7128&lng=-74.006');
            });
        });

        it('closes dialog when OK button is clicked', async () => {
            // Mock no speakers available
            mockRoundware.mixer.speakerEngine.speakers = [];
            render(<AddLoopVoiceButton />);
            
            // Open dialog
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            
            await waitFor(() => {
                const dialog = document.querySelector('.MuiDialog-root');
                expect(dialog).toBeInTheDocument();
                expect(dialog?.textContent).toContain(dialogText);
            }, { timeout: 3000 });
            
            // Close dialog
            fireEvent.click(screen.getByRole('button', { name: 'OK' }));
            
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });
    });

    describe('Speaker Volume Handling', () => {
        it('handles speakers with volume below minimum', async () => {
            // Mock speaker with volume below minimum
            mockRoundware.mixer.speakerEngine.speakers = [{
                volumeByLocation: jest.fn().mockReturnValue(0.3),
                minVolume: 0.5
            }];
            
            render(<AddLoopVoiceButton />);
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            

        });

        it('handles multiple speakers and sorts by volume', async () => {
            // Mock multiple speakers with different volumes
            mockRoundware.mixer.speakerEngine.speakers = [
                {
                    volumeByLocation: jest.fn().mockReturnValue(0.3),
                    minVolume: 0.5
                },
                {
                    volumeByLocation: jest.fn().mockReturnValue(0.8),
                    minVolume: 0.5
                }
            ];
            
            render(<AddLoopVoiceButton />);
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            
            await waitFor(() => {
                expect(window.location.href).toBe('/speak?lat=40.7128&lng=-74.006');
            });
        });
    });

    describe('UI Elements', () => {
        it('renders FAB with correct styling', () => {
            render(<AddLoopVoiceButton />);
            const fab = screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' });
            expect(fab.className).toContain('MuiFab-root');
            expect(fab.className).toContain('MuiFab-sizeLarge');
        });

        it('renders skeleton animation', () => {
            render(<AddLoopVoiceButton />);
            const skeleton = screen.getByTestId('AddCircleOutlineIcon').parentElement?.parentElement?.querySelector('.MuiSkeleton-root');
            expect(skeleton).toBeInTheDocument();
            expect(skeleton).toHaveStyle({
                width: '160px',
                height: '160px'
            });
        });

        it('renders tooltip with correct text', () => {
            render(<AddLoopVoiceButton />);
            expect(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' })).toBeInTheDocument();
        });
    });

    describe('Dialog Component', () => {
        it('renders dialog with correct content and actions', async () => {
            // Mock no speakers available
            mockRoundware.mixer.speakerEngine.speakers = [];
            render(<AddLoopVoiceButton />);
            
            // Open dialog
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            
            await waitFor(() => {
                const dialog = document.querySelector('.MuiDialog-root');
                expect(dialog).toBeInTheDocument();
                expect(dialog?.textContent).toContain(dialogText);
                
                // Check dialog actions
                const okButton = screen.getByRole('button', { name: 'OK' });
                expect(okButton).toBeInTheDocument();
                expect(okButton.closest('.MuiDialogActions-root')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('closes dialog when clicking outside', async () => {
            // Mock no speakers available
            mockRoundware.mixer.speakerEngine.speakers = [];
            render(<AddLoopVoiceButton />);
            
            // Open dialog
            fireEvent.click(screen.getByRole('button', { name: 'TAP TO JOIN CHOIR' }));
            
            await waitFor(() => {
                const dialog = document.querySelector('.MuiDialog-root');
                expect(dialog).toBeInTheDocument();
                expect(dialog?.textContent).toContain(dialogText);
            }, { timeout: 3000 });

            // Click outside dialog
            const backdrop = document.querySelector('.MuiDialog-root')?.querySelector('.MuiBackdrop-root');
            if (backdrop) {
                fireEvent.click(backdrop);
            }
            
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });
    });
}); 