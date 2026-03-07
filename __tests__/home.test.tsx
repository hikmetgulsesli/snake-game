import { render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders loading state initially', () => {
    render(<Home />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the main menu after loading', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('main-menu')).toBeInTheDocument();
    });
  });

  it('renders game title after loading', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('game-title')).toBeInTheDocument();
    });
  });
});
