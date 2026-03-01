import jwt from 'jsonwebtoken';
import db from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'spesamax-jwt-secret-dev-2026-xK9mP2qR7vL4';

export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante. Effettua il login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, surname, cap, city, latitude, longitude, plan, plan_expires_at, reputation, contributions_count, total_savings, monthly_savings, preferences, created_at FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato.' });
    }
    user.preferences = JSON.parse(user.preferences || '{}');
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token non valido o scaduto.' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, surname, plan FROM users WHERE id = ?').get(decoded.id);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}
