import { render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
  });

  it('renders loading state initially', () => {
    render(<Home />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the game after loading', async () => {
    render(<Home />);
    
    // Wait for loading to complete - use the h1 in header
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'SNAKE' })).toBeInTheDocument();
    });
    
    // Check game elements
    expect(screen.getByText(/Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/High:/i)).toBeInTheDocument();
    expect(screen.getByTestId('game-grid')).toBeInTheDocument();
  });

  it('renders difficulty buttons', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('EASY')).toBeInTheDocument();
    });
    
    expect(screen.getByText('NORMAL')).toBeInTheDocument();
    expect(screen.getByText('HARD')).toBeInTheDocument();
  });

  it('renders controls info', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/to move/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/to pause/i)).toBeInTheDocument();
  });
});
