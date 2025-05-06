import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingOverlay from '@/components/ListenPage/Map/WalkingModeButton/LoadingOverlay';
import { useLoadingStyles } from '@/components/ListenPage/Map/AssetLoadingOverlay';
import React from 'react';

// Mock the styles hook
jest.mock('@/components/ListenPage/Map/AssetLoadingOverlay', () => ({
    useLoadingStyles: jest.fn(() => ({
        backdrop: 'mock-backdrop-class',
        loadingCard: 'mock-loading-card-class',
        loadingSpinner: 'mock-loading-spinner-class',
        loadingMessage: 'mock-loading-message-class'
    }))
}));

describe('LoadingOverlay Smoke Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            render(<LoadingOverlay open={false} />);
            const spinner = document.querySelector('.MuiCircularProgress-root');
            expect(spinner).toBeInTheDocument();
        });

        it('renders with correct initial state', () => {
            render(<LoadingOverlay open={false} />);
            const backdrop = document.querySelector('.MuiBackdrop-root');
            expect(backdrop?.className).toContain('mock-backdrop-class');
            expect(backdrop).toHaveStyle({ opacity: '0', visibility: 'hidden' });
        });

        it('calls useLoadingStyles hook', () => {
            render(<LoadingOverlay open={false} />);
            expect(useLoadingStyles).toHaveBeenCalled();
        });

        it('is wrapped in React.memo', () => {
            expect(LoadingOverlay.$$typeof).toBe(Symbol.for('react.memo'));
        });
    });

    describe('Props Handling', () => {
        it('shows overlay when open is true', () => {
            render(<LoadingOverlay open={true} />);
            const backdrop = document.querySelector('.MuiBackdrop-root');
            expect(backdrop).toHaveStyle({ opacity: '1' });
        });

        it('hides overlay when open is false', () => {
            render(<LoadingOverlay open={false} />);
            const backdrop = document.querySelector('.MuiBackdrop-root');
            expect(backdrop).toHaveStyle({ opacity: '0', visibility: 'hidden' });
        });

        it('displays custom message when provided', () => {
            const message = 'Loading...';
            render(<LoadingOverlay open={true} message={message} />);
            const messageElement = document.querySelector('.mock-loading-message-class');
            expect(messageElement?.textContent).toBe(message);
            expect(messageElement?.className).toContain('mock-loading-message-class');
        });

        it('handles undefined message gracefully', () => {
            render(<LoadingOverlay open={true} />);
            const messageElement = document.querySelector('.mock-loading-message-class');
            expect(messageElement).toBeInTheDocument();
            expect(messageElement?.className).toContain('mock-loading-message-class');
            expect(messageElement?.textContent).toBe('');
        });
    });

    describe('Styling', () => {
        it('applies correct classes to all elements', () => {
            render(<LoadingOverlay open={true} message="Test" />);
            
            const backdrop = document.querySelector('.MuiBackdrop-root');
            const card = backdrop?.querySelector('.MuiCard-root');
            const spinner = document.querySelector('.MuiCircularProgress-root');
            const message = document.querySelector('.mock-loading-message-class');

            expect(backdrop?.className).toContain('mock-backdrop-class');
            expect(card?.className).toContain('mock-loading-card-class');
            expect(spinner?.className).toContain('mock-loading-spinner-class');
            expect(message?.className).toContain('mock-loading-message-class');
        });
    });

    describe('Accessibility', () => {
        it('has correct ARIA attributes', () => {
            render(<LoadingOverlay open={true} />);
            const backdrop = document.querySelector('.MuiBackdrop-root');
            const spinner = document.querySelector('.MuiCircularProgress-root');
            
            expect(backdrop).toHaveAttribute('aria-hidden', 'true');
            expect(spinner).toHaveAttribute('role', 'progressbar');
        });
    });
}); 