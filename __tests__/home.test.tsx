import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('SNAKE GAME')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Home />);
    expect(screen.getByText(/Classic arcade action/i)).toBeInTheDocument();
  });

  it('renders the coming soon message', () => {
    render(<Home />);
    expect(screen.getByText(/Game implementation coming soon/i)).toBeInTheDocument();
  });

  it('has correct heading level', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('SNAKE GAME');
  });
});
