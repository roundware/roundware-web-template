import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DebugPage from '@/components/DebugPage';

// Mock the LegalAgreementForm component
jest.mock('@/components/LegalAgreementForm', () => ({
  __esModule: true,
  default: () => <div data-testid="legal-agreement-form">Legal Agreement Form</div>,
}));

describe('DebugPage', () => {
  it('renders without crashing', () => {
    render(<DebugPage />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders with dialog open', () => {
    render(<DebugPage />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveStyle({ display: 'none' });
  });

  it('contains LegalAgreementForm', () => {
    render(<DebugPage />);
    expect(screen.getByTestId('legal-agreement-form')).toBeInTheDocument();
  });
}); 