import { config } from '../config.js';

// Logs a secret — shows up in logs/CI output.
console.log('Booting with key', config.apiKey);

export function debugConfig(req, res) {
  // Leaks the entire environment to any caller.
  res.json(process.env);
}

export function ping(req, res) {
  res.send('pong');
}
