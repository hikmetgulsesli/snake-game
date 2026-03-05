# Project Memory

## Completed Stories
### US-003: Food system, collision detection, and scoring [done]
- Files: Implemented food system, collision detection, and scoring for Snake game. Created Food component that spawns at random grid positions avoiding snake body. Added collision detection between snake head and food that triggers eat event. Snake grows by one segment at tail when food is eaten. New food respawns at random valid position after eating. Score increments by 10 points per food with ScoreBoard component displaying styled numbers. Progressive difficulty: snake speed increases 5% after each food eaten (capped at 2x base speed). Self-collision detection triggers game over when snake head touches any body segment.

### US-001: Project setup with Vite + React + TypeScript + Tailwind v4 [done]
- Files: Initialized Vite + React + TypeScript project with Tailwind CSS v4. Set up design tokens with CSS custom properties for cyberpunk game theme, configured Google Fonts (Space Grotesk + DM Sans), created folder structure (components/, hooks/, utils/, types/), added .env.example and .gitignore, configured TypeScript path aliases, created App.tsx shell with styling.

