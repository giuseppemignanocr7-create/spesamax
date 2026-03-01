import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/notifications
router.get('/', (req, res) => {
  try {
    const { unread, limit = 30 } = req.query;
    let where = ['n.user_id = ?'];
    let params = [req.user.id];

    if (unread === 'true') {
      where.push('n.is_read = 0');
    }

    const notifications = db.prepare(`
      SELECT * FROM notifications n
      WHERE ${where.join(' AND ')}
      ORDER BY n.created_at DESC
      LIMIT ?
    `).all(...params, parseInt(limit));

    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);

    res.json({ notifications, unreadCount: unreadCount.count });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Errore nel recupero delle notifiche.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Notifica letta.' });
  } catch (err) {
    res.status(500).json({ error: 'Errore.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);
    res.json({ message: 'Tutte le notifiche lette.' });
  } catch (err) {
    res.status(500).json({ error: 'Errore.' });
  }
});

export default router;
