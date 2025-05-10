import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomMapControl from '@/components/ListenPage/Map/CustomControl';
import { useGoogleMap } from '@react-google-maps/api';
import { createPortal } from 'react-dom';

// Mock the Google Maps API
jest.mock('@react-google-maps/api', () => ({
    useGoogleMap: jest.fn()
}));

// Mock React Portal
jest.mock('react-dom', () => ({
    createPortal: jest.fn((children) => children)
}));

// Mock Google Maps
const TOP_CENTER = 1;
const BOTTOM_RIGHT = 2;

describe('CustomMapControl Smoke Tests', () => {
    const mockMap = {
        controls: {
            [TOP_CENTER]: {
                push: jest.fn()
            },
            [BOTTOM_RIGHT]: {
                push: jest.fn()
            }
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useGoogleMap as jest.Mock).mockReturnValue(mockMap);
    });

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            render(
                <CustomMapControl position={TOP_CENTER}>
                    <div>Test Control</div>
                </CustomMapControl>
            );
            expect(document.body.textContent).toContain('Test Control');
        });

        it('creates a container div', () => {
            render(
                <CustomMapControl position={TOP_CENTER}>
                    <div>Test Control</div>
                </CustomMapControl>
            );
            expect(createPortal).toHaveBeenCalled();
        });
    });

    describe('Map Integration', () => {
        it('adds control to map when map is available', () => {
            render(
                <CustomMapControl position={TOP_CENTER}>
                    <div>Test Control</div>
                </CustomMapControl>
            );
            
            expect(mockMap.controls[TOP_CENTER].push).toHaveBeenCalled();
        });

        it('handles different control positions', () => {
            render(
                <CustomMapControl position={BOTTOM_RIGHT}>
                    <div>Test Control</div>
                </CustomMapControl>
            );
            
            expect(mockMap.controls[BOTTOM_RIGHT].push).toHaveBeenCalled();
        });
    });

    describe('Children Rendering', () => {
        it('renders children through portal', () => {
            const testContent = 'Test Control Content';
            render(
                <CustomMapControl position={TOP_CENTER}>
                    <div>{testContent}</div>
                </CustomMapControl>
            );
            
            expect(createPortal).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        children: testContent
                    })
                }),
                expect.any(HTMLDivElement)
            );
        });

        it('handles multiple children', () => {
            render(
                <CustomMapControl position={TOP_CENTER}>
                    <div>First Child</div>
                    <div>Second Child</div>
                </CustomMapControl>
            );
            
            const [children, container] = (createPortal as jest.Mock).mock.calls[0];
            expect(children).toEqual([
                <div>First Child</div>,
                <div>Second Child</div>
            ]);
            expect(container).toBeInstanceOf(HTMLDivElement);
        });
    });
}); 