import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StyledMenu, StyledMenuItem } from '@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/StyledMenu';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Menu: ({ children, open, anchorEl, anchorOrigin, transformOrigin, elevation, ...props }: any) => (
    open ? (
      <div 
        data-testid="menu" 
        data-anchor-origin={JSON.stringify(anchorOrigin)}
        data-transform-origin={JSON.stringify(transformOrigin)}
        data-elevation={elevation}
        {...props}
      >
        {children}
      </div>
    ) : null
  ),
  MenuItem: ({ children, onClick, className, ...props }: any) => (
    <div 
      data-testid="menu-item" 
      data-onclick={onClick ? 'true' : 'false'}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Create a theme for testing
const theme = createTheme();

describe('StyledMenu Components', () => {
  describe('StyledMenu', () => {
    it('renders when open is true', () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledMenu open={true} anchorEl={null}>
            <div>Menu Content</div>
          </StyledMenu>
        </ThemeProvider>
      );

      const menu = screen.getByTestId('menu');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveTextContent('Menu Content');
    });

    it('does not render when open is false', () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledMenu open={false} anchorEl={null}>
            <div>Menu Content</div>
          </StyledMenu>
        </ThemeProvider>
      );

      expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    });

    it('applies correct anchor and transform origins', () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledMenu open={true} anchorEl={null}>
            <div>Menu Content</div>
          </StyledMenu>
        </ThemeProvider>
      );

      const menu = screen.getByTestId('menu');
      expect(menu).toHaveAttribute('data-anchor-origin', JSON.stringify({
        vertical: 'bottom',
        horizontal: 'center',
      }));
      expect(menu).toHaveAttribute('data-transform-origin', JSON.stringify({
        vertical: 'top',
        horizontal: 'center',
      }));
    });

    it('has elevation set to 0', () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledMenu open={true} anchorEl={null}>
            <div>Menu Content</div>
          </StyledMenu>
        </ThemeProvider>
      );

      const menu = screen.getByTestId('menu');
      expect(menu).toHaveAttribute('data-elevation', '0');
    });
  });

  describe('StyledMenuItem', () => {
    it('renders children correctly', () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledMenuItem>
            <div>MenuItem Content</div>
          </StyledMenuItem>
        </ThemeProvider>
      );

      const menuItem = screen.getByTestId('menu-item');
      expect(menuItem).toBeInTheDocument();
      expect(menuItem).toHaveTextContent('MenuItem Content');
    });

    it('passes props to underlying MenuItem component', () => {
      const onClick = jest.fn();
      const className = 'custom-class';

      render(
        <ThemeProvider theme={theme}>
          <StyledMenuItem onClick={onClick} className={className}>
            MenuItem Content
          </StyledMenuItem>
        </ThemeProvider>
      );

      const menuItem = screen.getByTestId('menu-item');
      expect(menuItem).toHaveAttribute('data-onclick', 'true');
      expect(menuItem).toHaveAttribute('class', className);
    });
  });
});
