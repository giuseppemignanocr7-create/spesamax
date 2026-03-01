/**
 * SpesaMax Price Scraper Service
 * 
 * Scrapes prices from Italian grocery store chains.
 * Each chain has its own adapter with specific parsing logic.
 * 
 * Supported chains: Esselunga, Lidl, Conad, Coop, Carrefour, Eurospin
 * 
 * Note: In production, these would scrape real websites/APIs.
 * Some chains offer public APIs (e.g., Esselunga has a product API),
 * others require HTML parsing of digital flyers (volantini digitali).
 */

import db from '../db/connection.js';
import { v4 as uuid } from 'uuid';

// Base scraper class
class ChainScraper {
  constructor(chain, config = {}) {
    this.chain = chain;
    this.config = config;
    this.results = [];
    this.errors = [];
  }

  async scrape() {
    const logId = this.startLog();
    const startTime = Date.now();

    try {
      const products = await this.fetchProducts();
      const normalized = this.normalizeProducts(products);
      const saved = this.saveToDatabase(normalized);

      this.completeLog(logId, 'success', saved.found, saved.updated, Date.now() - startTime);
      return { status: 'success', ...saved };
    } catch (err) {
      this.completeLog(logId, 'failed', 0, 0, Date.now() - startTime, err.message);
      throw err;
    }
  }

  // Override in subclasses
  async fetchProducts() {
    return [];
  }

  normalizeProducts(products) {
    return products.map(p => ({
      name: p.name?.trim(),
      brand: p.brand?.trim(),
      price: parseFloat(p.price),
      offerPrice: p.offerPrice ? parseFloat(p.offerPrice) : null,
      offerLabel: p.offerLabel || null,
      offerEnd: p.offerEnd || null,
      weight: p.weight || null,
      barcode: p.barcode || null,
      category: p.category || 'Altro',
      storeId: p.storeId,
    }));
  }

  saveToDatabase(products) {
    let found = 0;
    let updated = 0;

    const upsertProduct = db.prepare(`
      INSERT INTO products (id, name, brand, category, weight, barcode, normalized_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(barcode) DO UPDATE SET
        name = excluded.name,
        brand = excluded.brand,
        category = excluded.category,
        weight = excluded.weight
    `);

    const upsertPrice = db.prepare(`
      INSERT INTO prices (product_id, store_id, price, offer_price, offer_label, offer_end, source)
      VALUES (?, ?, ?, ?, ?, ?, 'scraper')
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        found++;

        // Find or create product
        let product;
        if (item.barcode) {
          product = db.prepare('SELECT id FROM products WHERE barcode = ?').get(item.barcode);
        }
        if (!product) {
          product = db.prepare('SELECT id FROM products WHERE normalized_name = ?').get(`${item.brand} ${item.name}`.toLowerCase());
        }

        let productId;
        if (product) {
          productId = product.id;
        } else {
          productId = `prod-${uuid().substring(0, 8)}`;
          upsertProduct.run(productId, item.name, item.brand, item.category, item.weight, item.barcode, `${item.brand} ${item.name}`.toLowerCase());
        }

        // Save price
        upsertPrice.run(productId, item.storeId, item.price, item.offerPrice, item.offerLabel, item.offerEnd);
        updated++;
      }
    });

    transaction(products);
    return { found, updated };
  }

  startLog() {
    const stores = db.prepare('SELECT id FROM stores WHERE chain = ?').all(this.chain);
    const storeId = stores[0]?.id || null;
    const result = db.prepare(`INSERT INTO scrape_logs (store_id, chain, status) VALUES (?, ?, 'running')`).run(storeId, this.chain);
    return result.lastInsertRowid;
  }

  completeLog(logId, status, found, updated, durationMs, errors = null) {
    db.prepare(`UPDATE scrape_logs SET status = ?, products_found = ?, prices_updated = ?, duration_ms = ?, errors = ?, completed_at = datetime('now') WHERE id = ?`).run(
      status, found, updated, durationMs, errors, logId
    );
  }
}

// ─── ESSELUNGA SCRAPER ──────────────────────────────────
class EsselungaScraper extends ChainScraper {
  constructor() {
    super('esselunga', {
      baseUrl: 'https://www.esselungaacasa.it',
      flyerUrl: 'https://www.esselunga.it/it-it/offerte.html',
    });
  }

  async fetchProducts() {
    /**
     * Production implementation would:
     * 1. Fetch https://www.esselungaacasa.it/api/v1/products?category=...
     * 2. Parse JSON response with product details
     * 3. Also scrape volantino digitale for current offers
     * 
     * Esselunga has a semi-public API for their e-commerce that returns:
     * { products: [{ name, brand, price, promoPrice, description, ean, ... }] }
     */
    
    // Simulated fresh scrape data (in production, this comes from HTTP requests)
    const stores = db.prepare("SELECT id FROM stores WHERE chain = 'esselunga'").all();
    
    return [
      { name: 'Spaghetti N.5', brand: 'Barilla', price: 0.85, offerPrice: 0.69, offerLabel: 'Promo -19%', offerEnd: '2026-03-06', weight: '500g', barcode: '8076809513753', category: 'Pasta', storeId: stores[0]?.id },
      { name: 'Fusilli N.34', brand: 'De Cecco', price: 1.29, offerPrice: 0.99, offerLabel: 'Sconto 23%', offerEnd: '2026-03-10', weight: '500g', barcode: '8001250001344', category: 'Pasta', storeId: stores[0]?.id },
      { name: 'Olio Extra Vergine Classico', brand: 'Monini', price: 7.99, offerPrice: 5.99, offerLabel: 'Promo -25%', offerEnd: '2026-03-06', weight: '1L', barcode: '8005510001198', category: 'Condimenti', storeId: stores[0]?.id },
      { name: 'Mozzarella Santa Lucia', brand: 'Galbani', price: 1.09, offerPrice: 0.79, offerLabel: 'Super promo', offerEnd: '2026-03-05', weight: '125g', barcode: '8000430101423', category: 'Formaggi', storeId: stores[0]?.id },
      { name: 'Qualità Rossa', brand: 'Lavazza', price: 3.49, offerPrice: 2.79, offerLabel: 'Sconto 20%', offerEnd: '2026-03-08', weight: '250g', barcode: '8000070012400', category: 'Caffè', storeId: stores[0]?.id },
      { name: 'Petto di Pollo Il Campese', brand: 'Amadori', price: 6.49, offerPrice: 4.99, offerLabel: '-23%', offerEnd: '2026-03-07', weight: '500g', barcode: '8004080100106', category: 'Carne', storeId: stores[0]?.id },
      { name: 'Detersivo Pods 3in1', brand: 'Dash', price: 12.99, offerPrice: 8.99, offerLabel: 'Mega sconto!', offerEnd: '2026-03-09', weight: '35 pods', barcode: '8001090460790', category: 'Casa', storeId: stores[0]?.id },
      { name: '4 Salti in Padella Pollo', brand: 'Findus', price: 3.99, offerPrice: 2.99, offerLabel: '-25%', offerEnd: '2026-03-10', weight: '550g', barcode: '8000500003374', category: 'Surgelati', storeId: stores[0]?.id },
    ].filter(p => p.storeId);
  }
}

// ─── LIDL SCRAPER ───────────────────────────────────────
class LidlScraper extends ChainScraper {
  constructor() {
    super('lidl', {
      baseUrl: 'https://www.lidl.it',
      flyerApi: 'https://www.lidl.it/api/v1/flyer',
    });
  }

  async fetchProducts() {
    /**
     * Production implementation would:
     * 1. Fetch Lidl's volantino API or scrape HTML
     * 2. Parse weekly flyer with current offers
     * 3. Lidl changes offers Mon/Thu, so timing is crucial
     */
    const stores = db.prepare("SELECT id FROM stores WHERE chain = 'lidl'").all();
    
    return [
      { name: 'Spaghetti N.5', brand: 'Barilla', price: 0.79, weight: '500g', barcode: '8076809513753', category: 'Pasta', storeId: stores[0]?.id },
      { name: 'Nutella', brand: 'Ferrero', price: 3.49, weight: '750g', barcode: '3017620422003', category: 'Colazione', storeId: stores[0]?.id },
      { name: 'Olio Extra Vergine Classico', brand: 'Monini', price: 7.49, weight: '1L', barcode: '8005510001198', category: 'Condimenti', storeId: stores[0]?.id },
      { name: 'Passata di Pomodoro', brand: 'Mutti', price: 1.29, weight: '700g', barcode: '8005110000300', category: 'Conserve', storeId: stores[0]?.id },
      { name: 'Latte Intero Fresco', brand: 'Granarolo', price: 1.55, weight: '1L', barcode: '8002670000108', category: 'Latticini', storeId: stores[0]?.id },
      { name: 'Mozzarella Santa Lucia', brand: 'Galbani', price: 0.99, weight: '125g', barcode: '8000430101423', category: 'Formaggi', storeId: stores[0]?.id },
      { name: 'Coca-Cola Original', brand: 'Coca-Cola', price: 1.39, weight: '1.5L', barcode: '5449000000996', category: 'Bevande', storeId: stores[0]?.id },
      { name: 'Carta Igienica Pulito Completo', brand: 'Scottex', price: 4.99, weight: '12 rotoli', barcode: '5029053001005', category: 'Casa', storeId: stores[0]?.id },
    ].filter(p => p.storeId);
  }
}

// ─── CONAD SCRAPER ──────────────────────────────────────
class ConadScraper extends ChainScraper {
  constructor() {
    super('conad', {
      baseUrl: 'https://www.conad.it',
      flyerUrl: 'https://www.conad.it/offerte-e-promozioni.html',
    });
  }

  async fetchProducts() {
    /**
     * Production: Scrape Conad's digital flyer (DoveConviene integration)
     * or use their product search API
     */
    const stores = db.prepare("SELECT id FROM stores WHERE chain = 'conad'").all();
    
    return [
      { name: 'Spaghetti N.5', brand: 'Barilla', price: 0.89, weight: '500g', barcode: '8076809513753', category: 'Pasta', storeId: stores[0]?.id },
      { name: 'Fusilli N.34', brand: 'De Cecco', price: 1.35, weight: '500g', barcode: '8001250001344', category: 'Pasta', storeId: stores[0]?.id },
      { name: 'Nutella', brand: 'Ferrero', price: 3.89, weight: '750g', barcode: '3017620422003', category: 'Colazione', storeId: stores[0]?.id },
      { name: 'Olio Extra Vergine Classico', brand: 'Monini', price: 8.29, weight: '1L', barcode: '8005510001198', category: 'Condimenti', storeId: stores[0]?.id },
      { name: 'Passata di Pomodoro', brand: 'Mutti', price: 1.45, weight: '700g', barcode: '8005110000300', category: 'Conserve', storeId: stores[0]?.id },
      { name: 'Parmigiano Reggiano DOP 24 mesi', brand: 'Parmareggio', price: 4.19, weight: '200g', barcode: '8008701004015', category: 'Formaggi', storeId: stores[0]?.id },
    ].filter(p => p.storeId);
  }
}

// ─── SCRAPER REGISTRY ───────────────────────────────────
const scrapers = {
  esselunga: EsselungaScraper,
  lidl: LidlScraper,
  conad: ConadScraper,
};

/**
 * Run scraper for a specific chain
 */
export async function scrapeChain(chain) {
  const ScraperClass = scrapers[chain];
  if (!ScraperClass) throw new Error(`Scraper non disponibile per: ${chain}`);

  const scraper = new ScraperClass();
  return scraper.scrape();
}

/**
 * Run all scrapers
 */
export async function scrapeAll() {
  const results = {};
  for (const [chain, ScraperClass] of Object.entries(scrapers)) {
    try {
      const scraper = new ScraperClass();
      results[chain] = await scraper.scrape();
      console.log(`✅ ${chain}: ${results[chain].found} prodotti, ${results[chain].updated} prezzi aggiornati`);
    } catch (err) {
      results[chain] = { status: 'failed', error: err.message };
      console.error(`❌ ${chain}: ${err.message}`);
    }
  }
  return results;
}

/**
 * Get scrape history/logs
 */
export function getScrapeLogs(limit = 20) {
  return db.prepare(`
    SELECT sl.*, s.name as store_name
    FROM scrape_logs sl
    LEFT JOIN stores s ON s.id = sl.store_id
    ORDER BY sl.started_at DESC
    LIMIT ?
  `).all(limit);
}

export default { scrapeChain, scrapeAll, getScrapeLogs };
