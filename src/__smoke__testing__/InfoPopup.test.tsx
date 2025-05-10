import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoPopup from '../components/InfoPopup';

describe('InfoPopup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders INFO button initially', () => {
    render(<InfoPopup />);
    expect(screen.getByRole('button', { name: 'INFO' })).toBeInTheDocument();
  });

  it('opens dialog when INFO button is clicked', () => {
    render(<InfoPopup />);
    const infoButton = screen.getByRole('button', { name: 'INFO' });
    fireEvent.click(infoButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('What is Roundware?')).toBeInTheDocument();
  });

  it('closes dialog when Close button is clicked', async () => {
    render(<InfoPopup />);
    
    // Open dialog
    const infoButton = screen.getByRole('button', { name: 'INFO' });
    fireEvent.click(infoButton);
    
    // Close dialog
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('displays all main sections of content', () => {
    render(<InfoPopup />);
    
    // Open dialog
    const infoButton = screen.getByRole('button', { name: 'INFO' });
    fireEvent.click(infoButton);
    
    // Check main sections
    expect(screen.getByText('Roundware is:')).toBeInTheDocument();
    expect(screen.getByText('With Roundware, you can:')).toBeInTheDocument();
    expect(screen.getByText('Join the fun...')).toBeInTheDocument();
  });

  it('displays GitHub link with correct href', () => {
    render(<InfoPopup />);
    
    // Open dialog
    const infoButton = screen.getByRole('button', { name: 'INFO' });
    fireEvent.click(infoButton);
    
    const githubLink = screen.getByRole('link', { name: 'GitHub page' });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/roundware');
  });

  it('displays all list items in the features section', () => {
    render(<InfoPopup />);
    
    // Open dialog
    const infoButton = screen.getByRole('button', { name: 'INFO' });
    fireEvent.click(infoButton);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('create a seamless, non-linear, location-sensitive layer of audio');
    expect(listItems[1]).toHaveTextContent('collect audio from participants in real-time');
    expect(listItems[2]).toHaveTextContent('tag collected audio with location and project-based metadata');
  });

  it('closes dialog when clicking outside', async () => {
    render(<InfoPopup />);
    
    // Open dialog
    const infoButton = screen.getByRole('button', { name: 'INFO' });
    fireEvent.click(infoButton);
    
    // Simulate clicking outside
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
