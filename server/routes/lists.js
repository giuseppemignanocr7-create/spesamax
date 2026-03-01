import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/lists — all lists for current user
router.get('/', (req, res) => {
  try {
    const lists = db.prepare(`
      SELECT sl.*,
        (SELECT COUNT(*) FROM list_items li WHERE li.list_id = sl.id) as items_count,
        (SELECT COUNT(*) FROM list_items li WHERE li.list_id = sl.id AND li.is_checked = 1) as checked_count
      FROM shopping_lists sl
      WHERE sl.user_id = ? AND sl.is_active = 1
      ORDER BY sl.updated_at DESC
    `).all(req.user.id);

    res.json({ lists });
  } catch (err) {
    console.error('Lists error:', err);
    res.status(500).json({ error: 'Errore nel recupero delle liste.' });
  }
});

// POST /api/lists — create new list
router.post('/', (req, res) => {
  try {
    const { name, color, icon, budget } = req.body;
    if (!name) return res.status(400).json({ error: 'Il nome della lista è obbligatorio.' });

    const id = uuid();
    db.prepare(`INSERT INTO shopping_lists (id, user_id, name, color, icon, budget) VALUES (?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, name, color || '#10b981', icon || 'shopping-cart', budget || null
    );

    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ?').get(id);
    res.status(201).json({ list });
  } catch (err) {
    console.error('Create list error:', err);
    res.status(500).json({ error: 'Errore nella creazione della lista.' });
  }
});

// GET /api/lists/:id — single list with items
router.get('/:id', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Lista non trovata.' });

    const items = db.prepare(`
      SELECT li.*, p.name as product_name, p.brand, p.weight, p.category as product_category, p.barcode,
        (SELECT MIN(COALESCE(pr.offer_price, pr.price)) FROM prices pr WHERE pr.product_id = li.product_id) as best_price,
        (SELECT s.name FROM prices pr JOIN stores s ON s.id = pr.store_id WHERE pr.product_id = li.product_id ORDER BY COALESCE(pr.offer_price, pr.price) ASC LIMIT 1) as best_store_name,
        (SELECT s.id FROM prices pr JOIN stores s ON s.id = pr.store_id WHERE pr.product_id = li.product_id ORDER BY COALESCE(pr.offer_price, pr.price) ASC LIMIT 1) as best_store_id
      FROM list_items li
      LEFT JOIN products p ON p.id = li.product_id
      WHERE li.list_id = ?
      ORDER BY li.is_checked ASC, li.sort_order ASC
    `).all(req.params.id);

    res.json({ list, items });
  } catch (err) {
    console.error('List detail error:', err);
    res.status(500).json({ error: 'Errore nel recupero della lista.' });
  }
});

// PUT /api/lists/:id — update list
router.put('/:id', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Lista non trovata.' });

    const { name, color, icon, budget } = req.body;
    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (color) { updates.push('color = ?'); params.push(color); }
    if (icon) { updates.push('icon = ?'); params.push(icon); }
    if (budget !== undefined) { updates.push('budget = ?'); params.push(budget); }

    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    db.prepare(`UPDATE shopping_lists SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM shopping_lists WHERE id = ?').get(req.params.id);
    res.json({ list: updated });
  } catch (err) {
    console.error('Update list error:', err);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della lista.' });
  }
});

// DELETE /api/lists/:id
router.delete('/:id', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Lista non trovata.' });

    db.prepare('UPDATE shopping_lists SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Lista eliminata.' });
  } catch (err) {
    console.error('Delete list error:', err);
    res.status(500).json({ error: 'Errore nell\'eliminazione della lista.' });
  }
});

// POST /api/lists/:id/items — add item to list
router.post('/:id/items', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Lista non trovata.' });

    const { product_id, custom_name, quantity, unit, notes } = req.body;
    if (!product_id && !custom_name) {
      return res.status(400).json({ error: 'Specificare un prodotto o un nome personalizzato.' });
    }

    const maxOrder = db.prepare('SELECT MAX(sort_order) as max_order FROM list_items WHERE list_id = ?').get(req.params.id);

    const result = db.prepare(`INSERT INTO list_items (list_id, product_id, custom_name, quantity, unit, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      req.params.id, product_id || null, custom_name || null, quantity || 1, unit || 'pz', notes || null, (maxOrder?.max_order || 0) + 1
    );

    db.prepare("UPDATE shopping_lists SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

    const item = db.prepare(`
      SELECT li.*, p.name as product_name, p.brand, p.weight, p.category as product_category,
        (SELECT MIN(COALESCE(pr.offer_price, pr.price)) FROM prices pr WHERE pr.product_id = li.product_id) as best_price,
        (SELECT s.name FROM prices pr JOIN stores s ON s.id = pr.store_id WHERE pr.product_id = li.product_id ORDER BY COALESCE(pr.offer_price, pr.price) ASC LIMIT 1) as best_store_name
      FROM list_items li
      LEFT JOIN products p ON p.id = li.product_id
      WHERE li.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ item });
  } catch (err) {
    console.error('Add item error:', err);
    res.status(500).json({ error: 'Errore nell\'aggiunta dell\'articolo.' });
  }
});

// PUT /api/lists/:listId/items/:itemId — update item (check/uncheck, quantity)
router.put('/:listId/items/:itemId', (req, res) => {
  try {
    const item = db.prepare('SELECT li.* FROM list_items li JOIN shopping_lists sl ON sl.id = li.list_id WHERE li.id = ? AND sl.user_id = ?').get(req.params.itemId, req.user.id);
    if (!item) return res.status(404).json({ error: 'Articolo non trovato.' });

    const { is_checked, quantity, notes, sort_order } = req.body;
    const updates = [];
    const params = [];

    if (is_checked !== undefined) { updates.push('is_checked = ?'); params.push(is_checked ? 1 : 0); }
    if (quantity !== undefined) { updates.push('quantity = ?'); params.push(quantity); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }

    params.push(req.params.itemId);
    db.prepare(`UPDATE list_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    res.json({ message: 'Articolo aggiornato.' });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Errore nell\'aggiornamento dell\'articolo.' });
  }
});

// DELETE /api/lists/:listId/items/:itemId
router.delete('/:listId/items/:itemId', (req, res) => {
  try {
    const item = db.prepare('SELECT li.* FROM list_items li JOIN shopping_lists sl ON sl.id = li.list_id WHERE li.id = ? AND sl.user_id = ?').get(req.params.itemId, req.user.id);
    if (!item) return res.status(404).json({ error: 'Articolo non trovato.' });

    db.prepare('DELETE FROM list_items WHERE id = ?').run(req.params.itemId);
    res.json({ message: 'Articolo rimosso.' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Errore nella rimozione dell\'articolo.' });
  }
});

export default router;
