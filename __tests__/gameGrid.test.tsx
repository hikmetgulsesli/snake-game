import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameGrid } from '../components/GameGrid';
import { Position } from '../types/game';

describe('GameGrid', () => {
  const defaultProps = {
    gridSize: 20,
    cellSize: 20,
    snakeBody: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }] as Position[],
    food: { x: 15, y: 15 } as Position,
  };

  it('should render game grid with correct dimensions', () => {
    render(<GameGrid {...defaultProps} />);
    
    const grid = screen.getByTestId('game-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveStyle({
      width: '400px',
      height: '400px',
    });
  });

  it('should render grid lines when showGridLines is true', () => {
    render(<GameGrid {...defaultProps} showGridLines={true} />);
    
    const gridLines = screen.getByTestId('grid-lines');
    expect(gridLines).toBeInTheDocument();
  });

  it('should not render grid lines when showGridLines is false', () => {
    render(<GameGrid {...defaultProps} showGridLines={false} />);
    
    const gridLines = screen.queryByTestId('grid-lines');
    expect(gridLines).not.toBeInTheDocument();
  });

  it('should render snake head with correct position and styling', () => {
    render(<GameGrid {...defaultProps} />);
    
    const snakeHead = screen.getByTestId('snake-head');
    expect(snakeHead).toBeInTheDocument();
    expect(snakeHead).toHaveStyle({
      left: '200px',  // 10 * 20
      top: '200px',   // 10 * 20
      width: '18px',  // cellSize - 2
      height: '18px',
    });
    expect(snakeHead).toHaveClass('snake-head');
  });

  it('should render snake body segments', () => {
    render(<GameGrid {...defaultProps} />);
    
    const snakeBodySegments = screen.getAllByTestId('snake-body');
    expect(snakeBodySegments).toHaveLength(2); // 3 total segments - 1 head
    
    // First body segment (index 1 in snakeBody)
    expect(snakeBodySegments[0]).toHaveStyle({
      left: '180px', // 9 * 20
      top: '200px',  // 10 * 20
    });
    expect(snakeBodySegments[0]).toHaveClass('snake-body');
  });

  it('should render food with correct position', () => {
    render(<GameGrid {...defaultProps} />);
    
    const food = screen.getByTestId('food');
    expect(food).toBeInTheDocument();
    expect(food).toHaveStyle({
      left: '302px', // 15 * 20 + 2
      top: '302px',  // 15 * 20 + 2
      width: '14px', // cellSize - 6
      height: '14px',
    });
    expect(food).toHaveClass('food');
  });

  it('should apply opacity gradient to snake body segments', () => {
    render(<GameGrid {...defaultProps} snakeBody={[
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ]} />);
    
    const snakeHead = screen.getByTestId('snake-head');
    const snakeBodySegments = screen.getAllByTestId('snake-body');
    
    // Head should have full opacity
    expect(snakeHead).toHaveStyle({ opacity: '1' });
    
    // Body segments should have decreasing opacity
    expect(snakeBodySegments[0]).toHaveStyle({ opacity: '0.85' });
    expect(snakeBodySegments[1]).toHaveStyle({ opacity: '0.7' });
    expect(snakeBodySegments[2]).toHaveStyle({ opacity: '0.55' });
  });

  it('should handle different grid sizes', () => {
    render(<GameGrid {...defaultProps} gridSize={25} cellSize={24} />);
    
    const grid = screen.getByTestId('game-grid');
    expect(grid).toHaveStyle({
      width: '600px',  // 25 * 24
      height: '600px',
    });
  });

  it('should handle snake at edges of grid', () => {
    render(<GameGrid {...defaultProps} snakeBody={[
      { x: 0, y: 0 },   // Top-left corner
      { x: 19, y: 19 }, // Bottom-right corner
    ]} />);
    
    const snakeHead = screen.getByTestId('snake-head');
    const snakeBodySegments = screen.getAllByTestId('snake-body');
    
    expect(snakeHead).toHaveStyle({
      left: '0px',
      top: '0px',
    });
    
    expect(snakeBodySegments[0]).toHaveStyle({
      left: '380px', // 19 * 20
      top: '380px',
    });
  });

  it('should apply custom className', () => {
    render(<GameGrid {...defaultProps} className="custom-class" />);
    
    const grid = screen.getByTestId('game-grid');
    expect(grid).toHaveClass('custom-class');
  });

  it('should render correctly with single segment snake', () => {
    render(<GameGrid {...defaultProps} snakeBody={[{ x: 5, y: 5 }]} />);
    
    const snakeHead = screen.getByTestId('snake-head');
    expect(snakeHead).toBeInTheDocument();
    
    const snakeBodySegments = screen.queryAllByTestId('snake-body');
    expect(snakeBodySegments).toHaveLength(0);
  });

  it('should calculate correct cell sizes for different viewports', () => {
    const { rerender } = render(<GameGrid {...defaultProps} cellSize={24} />);
    
    let grid = screen.getByTestId('game-grid');
    expect(grid).toHaveStyle({
      width: '480px', // 20 * 24
      height: '480px',
    });
    
    rerender(<GameGrid {...defaultProps} cellSize={16} />);
    grid = screen.getByTestId('game-grid');
    expect(grid).toHaveStyle({
      width: '320px', // 20 * 16
      height: '320px',
    });
  });
});
