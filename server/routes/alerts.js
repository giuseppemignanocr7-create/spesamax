import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/alerts — list user's price alerts
router.get('/', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT pa.*, p.name as product_name, p.brand, p.weight, p.category,
        (SELECT MIN(COALESCE(pr.offer_price, pr.price)) FROM prices pr WHERE pr.product_id = pa.product_id) as current_best_price,
        (SELECT s.name FROM prices pr JOIN stores s ON s.id = pr.store_id WHERE pr.product_id = pa.product_id ORDER BY COALESCE(pr.offer_price, pr.price) ASC LIMIT 1) as best_store_name
      FROM price_alerts pa
      JOIN products p ON p.id = pa.product_id
      WHERE pa.user_id = ?
      ORDER BY pa.is_active DESC, pa.created_at DESC
    `).all(req.user.id);

    res.json({ alerts });
  } catch (err) {
    console.error('Alerts error:', err);
    res.status(500).json({ error: 'Errore nel recupero degli alert.' });
  }
});

// POST /api/alerts — create price alert
router.post('/', (req, res) => {
  try {
    const { product_id, target_price, alert_type } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id obbligatorio.' });

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato.' });

    const existing = db.prepare('SELECT id FROM price_alerts WHERE user_id = ? AND product_id = ? AND is_active = 1').get(req.user.id, product_id);
    if (existing) return res.status(409).json({ error: 'Alert già attivo per questo prodotto.' });

    const id = uuid();
    db.prepare('INSERT INTO price_alerts (id, user_id, product_id, target_price, alert_type) VALUES (?, ?, ?, ?, ?)').run(
      id, req.user.id, product_id, target_price || null, alert_type || 'any_drop'
    );

    res.status(201).json({ alert: db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id) });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Errore nella creazione dell\'alert.' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', (req, res) => {
  try {
    const alert = db.prepare('SELECT * FROM price_alerts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!alert) return res.status(404).json({ error: 'Alert non trovato.' });

    db.prepare('UPDATE price_alerts SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Alert disattivato.' });
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ error: 'Errore.' });
  }
});

export default router;
