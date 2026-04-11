/**
 * Single source of truth for the HTTP port (avoids drift with upload URLs and frontend).
 * Default 5000 (common MERN). On macOS, AirPlay Receiver often binds port 5000 (EADDRINUSE).
 * Fix: set PORT=5001 in backend/.env and REACT_APP_PROXY_TARGET=http://localhost:5001 in frontend/.env.development
 */
const DEFAULT_PORT = 5000;

function getPort() {
  const n = parseInt(process.env.PORT, 10);
  if (!Number.isNaN(n) && n > 0 && n < 65536) return n;
  return DEFAULT_PORT;
}

module.exports = { getPort, DEFAULT_PORT };
