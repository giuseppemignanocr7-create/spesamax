import { Router } from 'express';
import db from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { optimizeCart } from '../services/optimizer.js';

const router = Router();
router.use(authenticate);

// POST /api/optimize/:listId — optimize a shopping list
router.post('/:listId', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?').get(req.params.listId, req.user.id);
    if (!list) return res.status(404).json({ error: 'Lista non trovata.' });

    const prefs = req.user.preferences || {};
    const options = {
      maxStores: req.body.maxStores || prefs.maxStores || 3,
      priority: req.body.priority || prefs.priority || 'balanced',
      userLat: req.user.latitude || 45.4642,
      userLng: req.user.longitude || 9.1900,
      searchRadius: req.body.searchRadius || prefs.searchRadius || 15,
    };

    const result = optimizeCart(req.params.listId, req.user.id, options);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Mark list as optimized
    db.prepare("UPDATE shopping_lists SET is_optimized = 1, estimated_savings = ?, estimated_total = ?, updated_at = datetime('now') WHERE id = ?").run(
      result.totalSavings, result.totalOptimized, req.params.listId
    );

    res.json(result);
  } catch (err) {
    console.error('Optimize error:', err);
    res.status(500).json({ error: 'Errore nell\'ottimizzazione del carrello.' });
  }
});

// GET /api/optimize/history — past optimizations
router.get('/history', (req, res) => {
  try {
    const carts = db.prepare(`
      SELECT oc.*, sl.name as list_name
      FROM optimized_carts oc
      LEFT JOIN shopping_lists sl ON sl.id = oc.list_id
      WHERE oc.user_id = ?
      ORDER BY oc.created_at DESC
      LIMIT 20
    `).all(req.user.id);

    const result = carts.map(c => ({
      ...c,
      route_data: JSON.parse(c.route_data || '{}'),
      store_groups: JSON.parse(c.store_groups || '[]'),
    }));

    res.json({ optimizations: result });
  } catch (err) {
    console.error('Optimization history error:', err);
    res.status(500).json({ error: 'Errore.' });
  }
});

export default router;
