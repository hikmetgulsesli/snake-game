import type { Position } from '../types/game';
import { GRID_SIZE, CELL_SIZE } from '../types/game';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function GameBoard({ snake, food, onTouchStart, onTouchEnd }: GameBoardProps) {
  return (
    <div 
      className="relative mx-auto rounded-xl overflow-hidden"
      style={{ 
        width: GRID_SIZE * CELL_SIZE + 32,
        backgroundColor: 'var(--stitch-bg-card)',
        border: '1px solid var(--stitch-border)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: 16,
      }}
    >
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE,
          backgroundColor: 'var(--stitch-bg-primary)',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Grid cells */}
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className="absolute"
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: (x + y) % 2 === 0 ? '#151519' : '#1a1a1f',
              }}
            />
          ))
        )}

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute rounded-sm"
            style={{
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: index === 0 ? 'var(--stitch-accent-light)' : 'var(--stitch-accent)',
              boxShadow: index === 0 ? '0 0 8px var(--stitch-accent-glow)' : 'none',
              borderRadius: index === 0 ? 4 : 3,
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            backgroundColor: 'var(--stitch-danger)',
            boxShadow: '0 0 10px var(--stitch-danger-glow)',
          }}
        />
      </div>
    </div>
  );
}
