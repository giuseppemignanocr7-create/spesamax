import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/community — list reports
router.get('/', optionalAuth, (req, res) => {
  try {
    const { search, store_id, verified, limit = 30, offset = 0 } = req.query;
    let where = ["cr.status = 'active'"];
    let params = [];

    if (search) {
      where.push("cr.product_name LIKE ?");
      params.push(`%${search}%`);
    }
    if (store_id) {
      where.push("cr.store_id = ?");
      params.push(store_id);
    }
    if (verified === 'true') {
      where.push("cr.is_verified = 1");
    }

    const reports = db.prepare(`
      SELECT cr.*,
        u.name as user_name, u.surname as user_surname, u.reputation as user_reputation, u.contributions_count as user_contributions,
        s.name as store_name, s.chain as store_chain, s.color as store_color, s.logo as store_logo, s.address as store_address
      FROM community_reports cr
      JOIN users u ON u.id = cr.user_id
      JOIN stores s ON s.id = cr.store_id
      WHERE ${where.join(' AND ')}
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    const total = db.prepare(`SELECT COUNT(*) as count FROM community_reports cr WHERE ${where.join(' AND ')}`).get(...params);

    res.json({ reports, total: total.count });
  } catch (err) {
    console.error('Community list error:', err);
    res.status(500).json({ error: 'Errore nel recupero delle segnalazioni.' });
  }
});

// POST /api/community — create report
router.post('/', authenticate, (req, res) => {
  try {
    const { product_id, store_id, product_name, reported_price, normal_price, has_receipt } = req.body;

    if (!store_id || !product_name || !reported_price) {
      return res.status(400).json({ error: 'Campi obbligatori: store_id, product_name, reported_price.' });
    }

    const id = uuid();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`INSERT INTO community_reports (id, user_id, product_id, store_id, product_name, reported_price, normal_price, has_receipt, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, product_id || null, store_id, product_name, reported_price, normal_price || null, has_receipt ? 1 : 0, expiresAt
    );

    // Increment user contributions
    db.prepare('UPDATE users SET contributions_count = contributions_count + 1 WHERE id = ?').run(req.user.id);

    const report = db.prepare(`
      SELECT cr.*,
        u.name as user_name, u.surname as user_surname, u.reputation as user_reputation,
        s.name as store_name, s.chain as store_chain, s.color as store_color, s.logo as store_logo
      FROM community_reports cr
      JOIN users u ON u.id = cr.user_id
      JOIN stores s ON s.id = cr.store_id
      WHERE cr.id = ?
    `).get(id);

    res.status(201).json({ report });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Errore nella creazione della segnalazione.' });
  }
});

// POST /api/community/:id/vote — upvote/downvote
router.post('/:id/vote', authenticate, (req, res) => {
  try {
    const { vote } = req.body; // 1 or -1
    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ error: 'Voto non valido. Usa 1 (up) o -1 (down).' });
    }

    const report = db.prepare('SELECT * FROM community_reports WHERE id = ?').get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Segnalazione non trovata.' });

    // Check existing vote
    const existing = db.prepare('SELECT * FROM report_votes WHERE report_id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (existing) {
      if (existing.vote === vote) {
        // Remove vote
        db.prepare('DELETE FROM report_votes WHERE id = ?').run(existing.id);
        if (vote === 1) db.prepare('UPDATE community_reports SET upvotes = upvotes - 1 WHERE id = ?').run(req.params.id);
        else db.prepare('UPDATE community_reports SET downvotes = downvotes - 1 WHERE id = ?').run(req.params.id);
        return res.json({ message: 'Voto rimosso.', action: 'removed' });
      } else {
        // Change vote
        db.prepare('UPDATE report_votes SET vote = ? WHERE id = ?').run(vote, existing.id);
        if (vote === 1) {
          db.prepare('UPDATE community_reports SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ?').run(req.params.id);
        } else {
          db.prepare('UPDATE community_reports SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ?').run(req.params.id);
        }
        return res.json({ message: 'Voto cambiato.', action: 'changed' });
      }
    }

    // New vote
    db.prepare('INSERT INTO report_votes (report_id, user_id, vote) VALUES (?, ?, ?)').run(req.params.id, req.user.id, vote);
    if (vote === 1) db.prepare('UPDATE community_reports SET upvotes = upvotes + 1 WHERE id = ?').run(req.params.id);
    else db.prepare('UPDATE community_reports SET downvotes = downvotes + 1 WHERE id = ?').run(req.params.id);

    // Auto-verify if enough upvotes
    const updated = db.prepare('SELECT upvotes FROM community_reports WHERE id = ?').get(req.params.id);
    if (updated.upvotes >= 10 && !report.is_verified) {
      db.prepare("UPDATE community_reports SET is_verified = 1, verified_by = 'community' WHERE id = ?").run(req.params.id);
    }

    res.json({ message: 'Voto registrato.', action: 'added' });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Errore nel voto.' });
  }
});

// GET /api/community/leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const { city = 'Milano', limit = 20 } = req.query;
    const leaders = db.prepare(`
      SELECT id, name, surname, reputation, contributions_count, total_savings,
        (SELECT COUNT(*) FROM community_reports cr WHERE cr.user_id = users.id AND cr.is_verified = 1) as verified_reports
      FROM users
      WHERE city = ? AND contributions_count > 0
      ORDER BY contributions_count DESC, reputation DESC
      LIMIT ?
    `).all(city, parseInt(limit));

    res.json({ leaderboard: leaders });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Errore nel recupero della classifica.' });
  }
});

export default router;
