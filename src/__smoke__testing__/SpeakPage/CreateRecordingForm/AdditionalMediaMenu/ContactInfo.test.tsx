import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactInfo from '@/components/SpeakPage/CreateRecordingForm/AdditionalMediaMenu/ContactInfo';
import { useRoundwareDraft } from '@/hooks';

// Add type definitions for Jest DOM matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent(text: string): R;
      toHaveValue(value: string): R;
    }
  }
}

// Mock the useRoundwareDraft hook
jest.mock('@/hooks', () => ({
  useRoundwareDraft: jest.fn(),
}));

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  MenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} data-testid="menu-item">
      {children}
    </button>
  ),
  ListItemIcon: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="list-item-icon">{children}</div>
  ),
  ListItemText: ({ primary }: { primary: string }) => (
    <div data-testid="list-item-text">{primary}</div>
  ),
  TextField: ({ label, inputRef, defaultValue, onKeyDown }: any) => (
    <input
      data-testid={`text-field-${label.toLowerCase().replace(' ', '-')}`}
      ref={inputRef}
      defaultValue={defaultValue}
      onKeyDown={onKeyDown}
      aria-label={label}
    />
  ),
  Box: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="box">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
}));

// Mock Modal component
jest.mock('@/components/elements/Modal', () => ({
  __esModule: true,
  default: ({ children, open, onClose, title }: any) => (
    open ? (
      <div data-testid="modal">
        <h2 data-testid="modal-title">{title}</h2>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material/Email', () => () => <span data-testid="email-icon">📧</span>);
jest.mock('@mui/icons-material/Check', () => () => <span data-testid="check-icon">✓</span>);

describe('ContactInfo', () => {
  const mockSetUser = jest.fn();
  const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoundwareDraft as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
      user: mockUser,
    });
  });

  it('should render menu item with correct text and icon', () => {
    render(<ContactInfo />);
    
    const menuItem = screen.getByTestId('menu-item');
    expect(menuItem).toBeInTheDocument();
    
    const listItemText = screen.getByTestId('list-item-text');
    expect(listItemText.textContent).toBe('Contact Info');
    
    const emailIcon = screen.getByTestId('email-icon');
    expect(emailIcon).toBeInTheDocument();
  });

  it('should open modal when menu item is clicked', () => {
    render(<ContactInfo />);
    
    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);
    
    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId('modal-title').textContent).toBe('Contact Info');
  });

  it('should close modal when close button is clicked', () => {
    render(<ContactInfo />);
    
    // Open modal
    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);
    
    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should render form fields with user data', () => {
    render(<ContactInfo />);
    
    // Open modal
    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);
    
    const firstNameField = screen.getByTestId('text-field-first-name') as HTMLInputElement;
    const lastNameField = screen.getByTestId('text-field-last-name') as HTMLInputElement;
    const emailField = screen.getByTestId('text-field-email') as HTMLInputElement;
    
    expect(firstNameField.value).toBe(mockUser.first_name);
    expect(lastNameField.value).toBe(mockUser.last_name);
    expect(emailField.value).toBe(mockUser.email);
  });

  it('should handle form submission correctly', async () => {
    render(<ContactInfo />);
    
    // Open modal
    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);
    
    // Fill form
    const firstNameField = screen.getByTestId('text-field-first-name') as HTMLInputElement;
    const lastNameField = screen.getByTestId('text-field-last-name') as HTMLInputElement;
    const emailField = screen.getByTestId('text-field-email') as HTMLInputElement;
    
    fireEvent.change(firstNameField, { target: { value: 'Jane' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jane.smith@example.com' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /✓ OK/ });
    fireEvent.click(submitButton);
    
    // Check if setUser was called with correct data
    expect(mockSetUser).toHaveBeenCalledWith({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
    });
    
    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should handle tab navigation between fields', () => {
    render(<ContactInfo />);
    
    // Open modal
    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);
    
    const firstNameField = screen.getByTestId('text-field-first-name');
    const lastNameField = screen.getByTestId('text-field-last-name');
    const emailField = screen.getByTestId('text-field-email');
    
    // Focus first name field
    firstNameField.focus();
    
    // Press tab
    fireEvent.keyDown(firstNameField, { key: 'Tab' });
    expect(document.activeElement).toBe(lastNameField);
    
    // Press tab again
    fireEvent.keyDown(lastNameField, { key: 'Tab' });
    expect(document.activeElement).toBe(emailField);
  });
});
