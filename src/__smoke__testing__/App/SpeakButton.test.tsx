import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SpeakButton from '@/components/App/SpeakButton';

describe('SpeakButton', () => {
  it('renders without crashing', () => {
    render(<SpeakButton />);
    expect(screen.getByTitle('Speak')).toBeInTheDocument();
  });

  it('renders microphone icon', () => {
    render(<SpeakButton />);
    const micIcon = screen.getByTestId('MicIcon');
    expect(micIcon).toBeInTheDocument();
  });

  it('is wrapped in a Box component', () => {
    render(<SpeakButton />);
    const box = screen.getByTestId('MicIcon').closest('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });
}); 