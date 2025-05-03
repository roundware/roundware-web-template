import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import DrawerSensitiveWrapper from '@/components/App/DrawerSensitiveWrapper';
import { Box, Theme } from '@mui/material';

// Mock the UIContext
jest.mock('@/context/UIContext', () => ({
  useUIContext: () => ({
    drawerOpen: false
  })
}));

// Mock the useMediaQuery hook
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false
}));

describe('DrawerSensitiveWrapper Component Smoke Tests', () => {
  const TestContent = () => <div data-testid="test-content">Test Content</div>;

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );
  });

  it('renders children correctly', () => {
    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );
    
    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
  });

  it('renders differently on mobile', () => {
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(() => true);

    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const content = screen.getByTestId('test-content');
    expect(content.parentElement?.className).not.toContain('MuiBox-root');
  });

  it('renders with Box wrapper on desktop', () => {
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(() => false);

    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const content = screen.getByTestId('test-content');
    expect(content.parentElement?.className).toContain('MuiBox-root');
  });

  it('applies correct styles on desktop when drawer is closed', () => {
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(() => false);
    
    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const wrapper = screen.getByTestId('test-content').parentElement;
    expect(wrapper?.className).toContain('MuiBox-root');
  });

  it('applies correct styles on desktop when drawer is open', () => {
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(() => false);
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      drawerOpen: true
    }));

    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const wrapper = screen.getByTestId('test-content').parentElement;
    expect(wrapper?.className).toContain('MuiBox-root');
  });

  it('maintains flex layout structure', () => {
    render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const wrapper = screen.getByTestId('test-content').parentElement;
    expect(wrapper?.className).toContain('MuiBox-root');
  });

  it('handles multiple children correctly', () => {
    const MultipleChildren = () => (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(
      <DrawerSensitiveWrapper>
        <MultipleChildren />
      </DrawerSensitiveWrapper>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    render(
      <DrawerSensitiveWrapper>
        {null}
      </DrawerSensitiveWrapper>
    );
  });

  it('handles undefined children gracefully', () => {
    render(
      <DrawerSensitiveWrapper>
        {undefined}
      </DrawerSensitiveWrapper>
    );
  });

  it('handles theme breakpoint changes correctly', () => {
    const breakpoints = ['sm', 'md', 'lg', 'xl'];
    
    breakpoints.forEach(breakpoint => {
      cleanup();
      jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(
        () => false
      );

      render(
        <DrawerSensitiveWrapper>
          <TestContent />
        </DrawerSensitiveWrapper>
      );

      const content = screen.getByTestId('test-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('handles drawer state changes correctly', () => {
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(() => false);
    
    // Test closed state
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      drawerOpen: false
    }));

    const { rerender } = render(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const wrapperClosed = screen.getByTestId('test-content').parentElement;
    expect(wrapperClosed?.className).toContain('MuiBox-root');

    // Test open state
    jest.spyOn(require('@/context/UIContext'), 'useUIContext').mockImplementation(() => ({
      drawerOpen: true
    }));

    rerender(
      <DrawerSensitiveWrapper>
        <TestContent />
      </DrawerSensitiveWrapper>
    );

    const wrapperOpen = screen.getByTestId('test-content').parentElement;
    expect(wrapperOpen?.className).toContain('MuiBox-root');
  });
}); 