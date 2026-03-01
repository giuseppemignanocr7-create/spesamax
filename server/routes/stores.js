import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/stores — list all stores with filters
router.get('/', (req, res) => {
  try {
    const { search, chain, category, lat, lng, radius = 15, limit = 50 } = req.query;
    let where = ['s.is_active = 1'];
    let params = [];

    if (search) {
      where.push("(s.name LIKE ? OR s.chain LIKE ? OR s.address LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (chain) {
      where.push("s.chain = ?");
      params.push(chain);
    }

    let distanceSelect = '';
    let orderBy = 's.name';

    if (lat && lng) {
      // Haversine approximation for km distance
      distanceSelect = `, (6371 * 2 * asin(sqrt(
        pow(sin((radians(s.latitude) - radians(?)) / 2), 2) +
        cos(radians(?)) * cos(radians(s.latitude)) *
        pow(sin((radians(s.longitude) - radians(?)) / 2), 2)
      ))) as distance_km`;
      // SQLite doesn't have radians/asin natively, use approximation
      distanceSelect = `, ROUND(
        111.045 * sqrt(
          pow(s.latitude - ?, 2) +
          pow((s.longitude - ?) * cos(? * 0.0174533), 2)
        ), 2
      ) as distance_km`;
      params.push(parseFloat(lat), parseFloat(lng), parseFloat(lat));
      orderBy = 'distance_km ASC';
    }

    const stores = db.prepare(`
      SELECT s.* ${distanceSelect},
        (SELECT COUNT(DISTINCT pr.product_id) FROM prices pr WHERE pr.store_id = s.id) as products_count,
        (SELECT COUNT(*) FROM prices pr WHERE pr.store_id = s.id AND pr.offer_price IS NOT NULL) as offers_count
      FROM stores s
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ?
    `).all(...params, parseInt(limit));

    // Parse JSON fields
    const result = stores.map(s => ({
      ...s,
      categories: JSON.parse(s.categories || '[]'),
      opening_hours: JSON.parse(s.opening_hours || '{}'),
    }));

    // Filter by distance if geo params provided
    let filtered = result;
    if (lat && lng && radius) {
      filtered = result.filter(s => !s.distance_km || s.distance_km <= parseFloat(radius));
    }

    // Filter by category if provided
    if (category) {
      filtered = filtered.filter(s => s.categories.includes(category));
    }

    res.json({ stores: filtered });
  } catch (err) {
    console.error('Stores list error:', err);
    res.status(500).json({ error: 'Errore nel recupero dei negozi.' });
  }
});

// GET /api/stores/chains — list unique chains
router.get('/chains', (req, res) => {
  const chains = db.prepare('SELECT DISTINCT chain, COUNT(*) as store_count FROM stores WHERE is_active = 1 GROUP BY chain ORDER BY chain').all();
  res.json({ chains });
});

// GET /api/stores/:id — single store with current offers
router.get('/:id', (req, res) => {
  try {
    const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.params.id);
    if (!store) return res.status(404).json({ error: 'Negozio non trovato.' });

    store.categories = JSON.parse(store.categories || '[]');
    store.opening_hours = JSON.parse(store.opening_hours || '{}');

    const offers = db.prepare(`
      SELECT pr.*, p.name as product_name, p.brand, p.weight, p.category as product_category
      FROM prices pr
      JOIN products p ON p.id = pr.product_id
      WHERE pr.store_id = ? AND pr.offer_price IS NOT NULL
      ORDER BY (1 - pr.offer_price / pr.price) DESC
    `).all(req.params.id);

    const productsCount = db.prepare('SELECT COUNT(DISTINCT product_id) as count FROM prices WHERE store_id = ?').get(req.params.id);

    res.json({ store, offers, productsCount: productsCount.count });
  } catch (err) {
    console.error('Store detail error:', err);
    res.status(500).json({ error: 'Errore nel recupero del negozio.' });
  }
});

export default router;
