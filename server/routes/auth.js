import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, name, surname, cap, city } = req.body;

    if (!email || !password || !name || !surname) {
      return res.status(400).json({ error: 'Tutti i campi obbligatori devono essere compilati.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email già registrata.' });
    }

    const id = uuid();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`INSERT INTO users (id, email, password_hash, name, surname, cap, city) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      id, email, passwordHash, name, surname, cap || '20100', city || 'Milano'
    );

    const token = generateToken(id);
    const user = db.prepare('SELECT id, email, name, surname, cap, city, plan, reputation, contributions_count, total_savings, monthly_savings, preferences, created_at FROM users WHERE id = ?').get(id);
    user.preferences = JSON.parse(user.preferences || '{}');

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Errore durante la registrazione.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }

    const token = generateToken(user.id);
    delete user.password_hash;
    user.preferences = JSON.parse(user.preferences || '{}');

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Errore durante il login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, surname, cap, city, latitude, longitude, preferences } = req.body;
    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (surname) { updates.push('surname = ?'); params.push(surname); }
    if (cap) { updates.push('cap = ?'); params.push(cap); }
    if (city) { updates.push('city = ?'); params.push(city); }
    if (latitude) { updates.push('latitude = ?'); params.push(latitude); }
    if (longitude) { updates.push('longitude = ?'); params.push(longitude); }
    if (preferences) { updates.push('preferences = ?'); params.push(JSON.stringify(preferences)); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nessun campo da aggiornare.' });
    }

    updates.push("updated_at = datetime('now')");
    params.push(req.user.id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const user = db.prepare('SELECT id, email, name, surname, cap, city, latitude, longitude, plan, plan_expires_at, reputation, contributions_count, total_savings, monthly_savings, preferences, created_at FROM users WHERE id = ?').get(req.user.id);
    user.preferences = JSON.parse(user.preferences || '{}');

    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del profilo.' });
  }
});

// PUT /api/auth/password
router.put('/password', authenticate, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Password attuale non corretta.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ message: 'Password aggiornata con successo.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Errore durante il cambio password.' });
  }
});

export default router;
