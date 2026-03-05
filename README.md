# Snake Game

A modern Snake browser game built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Responsive game board with smooth snake movement
- Score counter and high score (localStorage)
- 3 difficulty levels: Easy, Medium, Expert
- Arrow keys + WASD controls, swipe on mobile
- Pause/resume with spacebar
- Game over screen with restart
- Sound effects using Web Audio API
- Speed increases as snake grows

## Tech Stack

- React + TypeScript + Vite + Tailwind CSS v4
- Express server for production serving
- No external game libraries

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The dev server will start on http://localhost:5173
```

## Production Build

```bash
# Build for production
npm run build

# The build output will be in the `dist/` directory
```

## Production Server

The Express server serves static files from the `dist/` directory.

```bash
# Start production server
npm start
# or
node server.js

# The server runs on port 3528 by default
# Set PORT environment variable to override
```

### Health Check

The server provides a health check endpoint at `/health`:

```bash
curl http://localhost:3528/health
```

Response:
```json
{
  "status": "ok",
  "service": "snake-game",
  "timestamp": "2026-03-05T06:00:00.000Z"
}
```

## Deployment

### Systemd User Service

1. Copy the service file to your systemd user directory:
   ```bash
   mkdir -p ~/.config/systemd/user
   cp snake-game.service ~/.config/systemd/user/
   ```

2. Reload systemd and enable the service:
   ```bash
   systemctl --user daemon-reload
   systemctl --user enable snake-game.service
   ```

3. Start the service:
   ```bash
   systemctl --user start snake-game.service
   ```

4. Check service status:
   ```bash
   systemctl --user status snake-game.service
   ```

### Cloudflare Tunnel

1. Install cloudflared:
   ```bash
   # Follow official Cloudflare documentation for your OS
   ```

2. Authenticate with Cloudflare:
   ```bash
   cloudflared tunnel login
   ```

3. Create a tunnel:
   ```bash
   cloudflared tunnel create snake-game
   ```

4. Update `cloudflare-tunnel.yml` with your tunnel ID:
   ```yaml
   tunnel: <your-tunnel-id>
   credentials-file: /home/setrox/.cloudflared/<your-tunnel-id>.json
   
   ingress:
     - hostname: snake-game.setrox.com.tr
       service: http://localhost:3528
     - service: http_status:404
   ```

5. Route DNS to your tunnel in the Cloudflare dashboard:
   - Go to Cloudflare dashboard → DNS
   - Add a CNAME record: `snake-game` → `<your-tunnel-id>.cfargotunnel.com`

6. Run the tunnel:
   ```bash
   cloudflared tunnel run snake-game
   ```

7. (Optional) Run tunnel as a service:
   ```bash
   cloudflared service install
   systemctl start cloudflared
   ```

## Project Structure

```
├── src/               # React source code
├── public/            # Static assets
├── dist/              # Production build output
├── server.js          # Express production server
├── snake-game.service # Systemd service file
├── cloudflare-tunnel.yml  # Cloudflare tunnel config
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm start` | Start production server |

## License

MIT
