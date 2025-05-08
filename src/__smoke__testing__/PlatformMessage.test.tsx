import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlatformMessage from '../components/PlatformMessage';

describe('PlatformMessage Component', () => {
  const mockMessage = {
    title: 'Test Title',
    message: 'Test Message',
    buttonLabel: 'Test Button',
    action: <button>Custom Action</button>
  };

  const mockGetMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when getMessage returns null', () => {
    mockGetMessage.mockReturnValue(null);
    const { container } = render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with default title when no title provided', () => {
    mockGetMessage.mockReturnValue({
      ...mockMessage,
      title: undefined
    });
    render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('renders modal with custom title when provided', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders message content correctly', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('renders custom action when provided', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('renders default button label when no custom label provided', () => {
    mockGetMessage.mockReturnValue({
      ...mockMessage,
      buttonLabel: undefined
    });
    render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(screen.getByText('Continue Anyway')).toBeInTheDocument();
  });

  it('renders custom button label when provided', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    render(<PlatformMessage getMessage={mockGetMessage} />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('closes modal when continue button is clicked', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    const { container } = render(<PlatformMessage getMessage={mockGetMessage} />);
    
    // Initially modal should be visible
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    
    // Click continue button
    const continueButton = screen.getByText('Test Button');
    fireEvent.click(continueButton);
    
    // Modal should be closed
    expect(container.innerHTML).toBe('');
  });

  it('closes modal when custom action is clicked', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    const { container } = render(<PlatformMessage getMessage={mockGetMessage} />);
    
    // Initially modal should be visible
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    
    // Click custom action button
    const customActionButton = screen.getByText('Custom Action');
    fireEvent.click(customActionButton);
    
    // Modal should be closed
    expect(container.innerHTML).toBe('');
  });

  it('renders chevron icon on continue button', () => {
    mockGetMessage.mockReturnValue(mockMessage);
    render(<PlatformMessage getMessage={mockGetMessage} />);
    
    const continueButton = screen.getByText('Test Button');
    expect(continueButton.querySelector('svg')).toBeInTheDocument();
  });
});
