import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ActionButton from '../../components/LandingPage/ActionButton';

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock react-router-dom
const mockHistory = {
  push: jest.fn(),
  location: { search: '?test=123' },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => mockHistory,
}));

describe('ActionButton', () => {
  const theme = createTheme();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      label: 'Test Button',
      linkTo: '/test-path',
      ...props,
    };

    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <ActionButton {...defaultProps} />
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  it('renders with correct label', () => {
    renderComponent();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders with correct aria-label', () => {
    renderComponent();
    expect(screen.getByLabelText('Test Button')).toBeInTheDocument();
  });

  it('navigates to correct path when clicked', () => {
    renderComponent();
    const button = screen.getByText('Test Button');
    fireEvent.click(button);

    expect(mockHistory.push).toHaveBeenCalledWith({
      pathname: '/test-path',
      search: '?test=123',
    });
  });

  it('applies custom styles when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    renderComponent({ style: customStyle });
    
    const buttonContainer = screen.getByText('Test Button').closest('div[class*="MuiGrid-container"]');
    expect(buttonContainer).toHaveStyle(customStyle);
  });

  it('calls onClick handler when provided', () => {
    let called = false;
    const onClickHandler = () => {
      called = true;
    };
    
    renderComponent({ onClick: onClickHandler });
    
    const buttonElement = screen.getByText('Test Button').closest('button');
    if (!buttonElement) {
      throw new Error('Button element not found');
    }
    fireEvent.click(buttonElement);

    expect(called).toBe(true);
  });

  it('does not throw error when onClick is not provided', () => {
    renderComponent();
    
    const button = screen.getByText('Test Button');
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  it('maintains search params during navigation', () => {
    renderComponent();
    
    const button = screen.getByText('Test Button');
    fireEvent.click(button);

    expect(mockHistory.push).toHaveBeenCalledWith({
      pathname: '/test-path',
      search: '?test=123',
    });
  });

  it('renders with correct button variant and color', () => {
    renderComponent();
    
    const button = screen.getByText('Test Button');
    expect(button.closest('button')).toHaveClass('MuiButton-contained');
    expect(button.closest('button')).toHaveClass('MuiButton-colorPrimary');
  });

  it('renders with correct typography variant', () => {
    renderComponent();
    
    const buttonText = screen.getByText('Test Button');
    expect(buttonText).toHaveClass('MuiTypography-h3');
  });

  it('handles empty label gracefully', () => {
    renderComponent({ label: '' });
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('handles empty linkTo gracefully', () => {
    renderComponent({ linkTo: '' });
    
    const button = screen.getByText('Test Button');
    fireEvent.click(button);

    expect(mockHistory.push).toHaveBeenCalledWith({
      pathname: '',
      search: '?test=123',
    });
  });
});
