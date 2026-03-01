import { Router } from 'express';
import db from '../db/connection.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products — list all products with best prices
router.get('/', optionalAuth, (req, res) => {
  try {
    const { search, category, brand, hasOffer, limit = 50, offset = 0 } = req.query;
    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push("(p.normalized_name LIKE ? OR p.category LIKE ?)");
      params.push(`%${search.toLowerCase()}%`, `%${search}%`);
    }
    if (category) {
      where.push("p.category = ?");
      params.push(category);
    }
    if (brand) {
      where.push("p.brand = ?");
      params.push(brand);
    }

    const products = db.prepare(`
      SELECT p.*,
        (SELECT MIN(COALESCE(pr.offer_price, pr.price)) FROM prices pr WHERE pr.product_id = p.id) as best_price,
        (SELECT s.name FROM prices pr JOIN stores s ON s.id = pr.store_id WHERE pr.product_id = p.id ORDER BY COALESCE(pr.offer_price, pr.price) ASC LIMIT 1) as best_store_name,
        (SELECT s.id FROM prices pr JOIN stores s ON s.id = pr.store_id WHERE pr.product_id = p.id ORDER BY COALESCE(pr.offer_price, pr.price) ASC LIMIT 1) as best_store_id,
        (SELECT COUNT(*) FROM prices pr WHERE pr.product_id = p.id AND pr.offer_price IS NOT NULL) as offer_count
      FROM products p
      WHERE ${where.join(' AND ')}
      ORDER BY p.brand, p.name
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    // Filter by offers if requested
    let result = products;
    if (hasOffer === 'true') {
      result = products.filter(p => p.offer_count > 0);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM products p WHERE ${where.join(' AND ')}`).get(...params);

    res.json({ products: result, total: total.count });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Errore nel recupero dei prodotti.' });
  }
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category').all();
  res.json({ categories });
});

// GET /api/products/:id — single product with all prices
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato.' });

    const prices = db.prepare(`
      SELECT pr.*, s.name as store_name, s.chain, s.address, s.color, s.logo, s.latitude, s.longitude, s.rating as store_rating,
        COALESCE(pr.offer_price, pr.price) as effective_price
      FROM prices pr
      JOIN stores s ON s.id = pr.store_id
      WHERE pr.product_id = ?
      ORDER BY effective_price ASC
    `).all(req.params.id);

    const history = db.prepare(`
      SELECT * FROM price_history
      WHERE product_id = ?
      ORDER BY date ASC
    `).all(req.params.id);

    res.json({ product, prices, history });
  } catch (err) {
    console.error('Product detail error:', err);
    res.status(500).json({ error: 'Errore nel recupero del prodotto.' });
  }
});

// GET /api/products/:id/prices — price comparison for a product
router.get('/:id/prices', (req, res) => {
  try {
    const prices = db.prepare(`
      SELECT pr.*, s.name as store_name, s.chain, s.address, s.color, s.logo, s.latitude, s.longitude,
        s.rating as store_rating,
        COALESCE(pr.offer_price, pr.price) as effective_price
      FROM prices pr
      JOIN stores s ON s.id = pr.store_id
      WHERE pr.product_id = ?
      ORDER BY effective_price ASC
    `).all(req.params.id);

    res.json({ prices });
  } catch (err) {
    console.error('Prices error:', err);
    res.status(500).json({ error: 'Errore nel recupero dei prezzi.' });
  }
});

// GET /api/products/:id/history — price history
router.get('/:id/history', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM price_history
      WHERE product_id = ?
      ORDER BY date ASC
    `).all(req.params.id);

    res.json({ history });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Errore nel recupero dello storico.' });
  }
});

export default router;
