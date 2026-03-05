import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3528;

// Check for build output at startup
const indexPath = path.join(__dirname, 'dist', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('Build not found. Run "npm run build" first.');
  process.exit(1);
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'snake-game',
    timestamp: new Date().toISOString(),
  });
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all routes (SPA support)
app.get('*', (_req, res) => {
  res.sendFile(indexPath);
});

const server = app.listen(PORT, () => {
  console.log(`Snake Game server running on port ${PORT}`);
});

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

export default app;
