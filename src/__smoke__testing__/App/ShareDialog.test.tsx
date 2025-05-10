import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ShareDialog from '@/components/App/ShareDialog';
import { useUIContext } from '@/context/UIContext';
import { useRoundware } from '@/hooks';
import { useLocation } from 'react-router';
import { useGoogleMap } from '@react-google-maps/api';

// Mock the hooks
jest.mock('@/context/UIContext', () => ({
  useUIContext: jest.fn(),
}));

jest.mock('@/context/URLContext', () => ({
  URLContext: React.createContext({
    params: new URLSearchParams(),
    setParams: jest.fn()
  })
}));

jest.mock('@/hooks', () => ({
  useRoundware: jest.fn(),
}));

jest.mock('react-router', () => ({
  useLocation: jest.fn(),
}));

jest.mock('@react-google-maps/api', () => ({
  useGoogleMap: jest.fn(),
}));

// Mock the react-share components
jest.mock('react-share', () => ({
  WhatsappShareButton: ({ children }: { children: React.ReactNode }) => <button data-testid="whatsapp-share">{children}</button>,
  EmailShareButton: ({ children }: { children: React.ReactNode }) => <button data-testid="email-share">{children}</button>,
  TwitterShareButton: ({ children }: { children: React.ReactNode }) => <button data-testid="twitter-share">{children}</button>,
  FacebookShareButton: ({ children }: { children: React.ReactNode }) => <button data-testid="facebook-share">{children}</button>,
  WhatsappIcon: () => <div data-testid="whatsapp-icon" />,
  EmailIcon: () => <div data-testid="email-icon" />,
  TwitterIcon: () => <div data-testid="twitter-icon" />,
  FacebookIcon: () => <div data-testid="facebook-icon" />,
}));

// Mock the CopyableText component
jest.mock('@/components/elements/CopyableText', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="copyable-text">{children}</div>,
}));

describe('ShareDialog', () => {
  const mockHandleCloseShare = jest.fn();
  const mockLogEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/listen',
        toString: () => 'http://localhost:3000/listen'
      },
      writable: true
    });

    (useUIContext as jest.Mock).mockReturnValue({
      showShare: true,
      handleCloseShare: mockHandleCloseShare,
    });

    (useRoundware as jest.Mock).mockReturnValue({
      roundware: {
        events: {
          logEvent: mockLogEvent,
        },
        project: {
          data: {
            sharing_message: 'Test sharing message',
          },
        },
      },
    });

    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/listen',
    });

    (useGoogleMap as jest.Mock).mockReturnValue({
      getCenter: () => ({ lat: () => 40, lng: () => -74 }),
      getZoom: () => 12,
    });
  });

  it('renders without crashing', () => {
    render(<ShareDialog />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders social share buttons', () => {
    render(<ShareDialog />);
    expect(screen.getByTestId('whatsapp-share')).toBeInTheDocument();
    expect(screen.getByTestId('email-share')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-share')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-share')).toBeInTheDocument();
  });

  it('renders copyable text', () => {
    render(<ShareDialog />);
    expect(screen.getByTestId('copyable-text')).toBeInTheDocument();
  });

  it('renders geo information checkbox when on listen page', () => {
    render(<ShareDialog />);
    const checkbox = screen.getByRole('checkbox', { name: 'controlled' });
    expect(checkbox).toBeInTheDocument();
  });

  it('handles checkbox change', () => {
    render(<ShareDialog />);
    const checkbox = screen.getByRole('checkbox', { name: 'controlled' }) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('calls handleCloseShare when close button is clicked', () => {
    render(<ShareDialog />);
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    fireEvent.click(closeButton!);
    expect(mockHandleCloseShare).toHaveBeenCalled();
  });

  it('logs event when dialog is opened', () => {
    render(<ShareDialog />);
    expect(mockLogEvent).toHaveBeenCalledWith('share_map', expect.any(Object));
  });

  it('generates correct share link with geo information', () => {
    render(<ShareDialog />);
    const geoCheckbox = screen.getByRole('checkbox', { name: 'controlled' }) as HTMLInputElement;
    fireEvent.click(geoCheckbox);
    
    const copyableText = screen.getByTestId('copyable-text');
    const textContent = copyableText.textContent || '';
    expect(textContent).toContain('latitude=40');
    expect(textContent).toContain('longitude=-74');
    expect(textContent).toContain('zoom=12');
  });
});