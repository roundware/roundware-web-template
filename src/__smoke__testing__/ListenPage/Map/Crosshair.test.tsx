import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Crosshair from '@/components/ListenPage/Map/Crosshair';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { defaultTheme } from '@/styles';

// Create a test theme
const testTheme = createTheme();

describe('Crosshair Smoke Tests', () => {
    const renderWithTheme = (component: React.ReactElement) => {
        return render(
            <ThemeProvider theme={testTheme}>
                {component}
            </ThemeProvider>
        );
    };

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            renderWithTheme(<Crosshair />);
            const boxes = document.querySelectorAll('.MuiBox-root');
            expect(boxes).toHaveLength(2);
        });

        it('renders both horizontal and vertical lines', () => {
            renderWithTheme(<Crosshair />);
            const boxes = document.querySelectorAll('.MuiBox-root');
            
            // Check vertical line (first box)
            expect(boxes[0]).toHaveStyle({
                height: '30px',
                width: '1px',
                background: defaultTheme.palette.primary.dark,
                transform: 'translate(-50%, -50%)',
                position: 'absolute',
                top: '50%',
                left: '50%'
            });

            // Check horizontal line (second box)
            expect(boxes[1]).toHaveStyle({
                height: '1px',
                width: '30px',
                background: defaultTheme.palette.primary.dark,
                transform: 'translate(-50%, -50%)',
                position: 'absolute',
                top: '50%',
                left: '50%'
            });
        });
    });

    describe('Styling', () => {
        it('applies correct common styles to both lines', () => {
            renderWithTheme(<Crosshair />);
            const boxes = document.querySelectorAll('.MuiBox-root');
            
            boxes.forEach(box => {
                expect(box).toHaveStyle({
                    background: defaultTheme.palette.primary.dark,
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%'
                });
            });
        });

        it('maintains correct dimensions for each line', () => {
            renderWithTheme(<Crosshair />);
            const boxes = document.querySelectorAll('.MuiBox-root');
            
            // Vertical line
            expect(boxes[0]).toHaveStyle({
                height: '30px',
                width: '1px'
            });

            // Horizontal line
            expect(boxes[1]).toHaveStyle({
                height: '1px',
                width: '30px'
            });
        });
    });
}); 