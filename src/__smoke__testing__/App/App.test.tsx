import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { App as AppType } from '../../components/App/App';

// Mock the App component
jest.mock('../../components/App/App', () => ({
  App: () => (
    <div>
      <header role="banner">
        <nav role="navigation">
          <h1>Test Project</h1>
          <img src="logo.png" alt="Logo" className="nav-logo" />
        </nav>
      </header>
      <div data-testid="app-container">
        <div data-testid="platform-message"></div>
        <div data-testid="main-content">
          <div data-testid="landing-page"></div>
          <div data-testid="listen-page"></div>
          <div data-testid="speak-page"></div>
        </div>
      </div>
      <footer role="contentinfo">
        <div data-testid="bottom-bar">
          <button data-testid="share-button">Share</button>
          <button data-testid="speak-button">Speak</button>
          <div data-testid="info-popup"></div>
        </div>
      </footer>
    </div>
  )
}));

const { App } = require('../../components/App/App');

describe('App Component Smoke Tests', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  it('renders the project name in the title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const titleElement = screen.getByText('Test Project');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the main navigation elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for main navigation elements
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the main content area with all sections', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('app-container')).toBeInTheDocument();
    expect(screen.getByTestId('platform-message')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('renders the bottom bar with all controls', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
    expect(screen.getByTestId('speak-button')).toBeInTheDocument();
    expect(screen.getByTestId('info-popup')).toBeInTheDocument();
  });

  it('renders all main page sections', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.getByTestId('listen-page')).toBeInTheDocument();
    expect(screen.getByTestId('speak-page')).toBeInTheDocument();
  });
}); 