import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'spesamax.db');

// Remove old DB if exists
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Load and execute schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log('✅ Schema created');

// ─── USERS ──────────────────────────────────────────────
const userId = uuid();
const passwordHash = bcrypt.hashSync('SpesaMax2026!', 10);

db.prepare(`INSERT INTO users (id, email, password_hash, name, surname, cap, city, latitude, longitude, plan, plan_expires_at, reputation, contributions_count, total_savings, monthly_savings, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  userId, 'marco.rossi@email.it', passwordHash, 'Marco', 'Rossi',
  '20100', 'Milano', 45.4642, 9.1900, 'premium', '2026-06-15',
  4.8, 42, 1247.50, 89.30,
  JSON.stringify({ maxStores: 3, searchRadius: 15, priority: 'balanced', preferBio: false, glutenFree: true })
);
console.log('✅ Users seeded');

// ─── STORES ─────────────────────────────────────────────
const stores = [
  { id: 'store-esselunga-viale', name: 'Esselunga', chain: 'esselunga', address: 'Viale Papiniano 28', cap: '20123', lat: 45.4589, lng: 9.1678, logo: 'E', color: '#e31837', rating: 4.5, categories: ['supermercato', 'bio', 'gastronomia'] },
  { id: 'store-esselunga-lorenteggio', name: 'Esselunga', chain: 'esselunga', address: 'Via Lorenteggio 75', cap: '20146', lat: 45.4498, lng: 9.1445, logo: 'E', color: '#e31837', rating: 4.3, categories: ['supermercato', 'bio'] },
  { id: 'store-lidl-navigli', name: 'Lidl', chain: 'lidl', address: 'Via Vigevano 18', cap: '20144', lat: 45.4515, lng: 9.1712, logo: 'L', color: '#0050aa', rating: 4.1, categories: ['discount', 'bio'] },
  { id: 'store-lidl-cenisio', name: 'Lidl', chain: 'lidl', address: 'Viale Cenisio 44', cap: '20154', lat: 45.4788, lng: 9.1756, logo: 'L', color: '#0050aa', rating: 4.0, categories: ['discount'] },
  { id: 'store-conad-buenos', name: 'Conad City', chain: 'conad', address: 'Corso Buenos Aires 45', cap: '20124', lat: 45.4773, lng: 9.2048, logo: 'C', color: '#e94e1b', rating: 4.2, categories: ['supermercato', 'pronto'] },
  { id: 'store-coop-piola', name: 'Coop', chain: 'coop', address: 'Via Piola 12', cap: '20131', lat: 45.4790, lng: 9.2150, logo: 'Co', color: '#e60012', rating: 4.0, categories: ['supermercato', 'bio', 'equosolidale'] },
  { id: 'store-carrefour-loreto', name: 'Carrefour Express', chain: 'carrefour', address: 'Piazzale Loreto 8', cap: '20131', lat: 45.4851, lng: 9.2143, logo: 'Cf', color: '#004b93', rating: 3.8, categories: ['express', 'supermercato'] },
  { id: 'store-eurospin-corvetto', name: 'Eurospin', chain: 'eurospin', address: 'Via Polesine 10', cap: '20139', lat: 45.4385, lng: 9.2200, logo: 'Es', color: '#ffd700', rating: 3.9, categories: ['discount'] },
  { id: 'store-pam-wagner', name: 'Pam Local', chain: 'pam', address: 'Via Wagner 5', cap: '20145', lat: 45.4650, lng: 9.1580, logo: 'P', color: '#00843d', rating: 4.1, categories: ['express', 'bio'] },
  { id: 'store-md-famagosta', name: 'MD Discount', chain: 'md', address: 'Via Famagosta 2', cap: '20142', lat: 45.4320, lng: 9.1650, logo: 'MD', color: '#ff6600', rating: 3.7, categories: ['discount'] },
];

const insertStore = db.prepare(`INSERT INTO stores (id, name, chain, address, city, cap, latitude, longitude, logo, color, rating, categories, opening_hours) VALUES (?, ?, ?, ?, 'Milano', ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const s of stores) {
  insertStore.run(s.id, s.name, s.chain, s.address, s.cap, s.lat, s.lng, s.logo, s.color, s.rating,
    JSON.stringify(s.categories),
    JSON.stringify({ mon_fri: '08:00-21:00', sat: '08:00-21:00', sun: '09:00-20:00' })
  );
}
console.log(`✅ ${stores.length} stores seeded`);

// ─── PRODUCTS ───────────────────────────────────────────
const products = [
  { id: 'prod-barilla-spaghetti', name: 'Spaghetti N.5', brand: 'Barilla', category: 'Pasta', weight: '500g', unit: 'kg', barcode: '8076809513753', unitLabel: 'al kg' },
  { id: 'prod-barilla-penne', name: 'Penne Rigate', brand: 'Barilla', category: 'Pasta', weight: '500g', unit: 'kg', barcode: '8076809513760', unitLabel: 'al kg' },
  { id: 'prod-dececco-fusilli', name: 'Fusilli N.34', brand: 'De Cecco', category: 'Pasta', weight: '500g', unit: 'kg', barcode: '8001250001344', unitLabel: 'al kg' },
  { id: 'prod-rummo-rigatoni', name: 'Rigatoni N.50', brand: 'Rummo', category: 'Pasta', weight: '500g', unit: 'kg', barcode: '8008343500505', unitLabel: 'al kg' },
  { id: 'prod-garofalo-linguine', name: 'Linguine', brand: 'Garofalo', category: 'Pasta', weight: '500g', unit: 'kg', barcode: '8000139910120', unitLabel: 'al kg' },
  { id: 'prod-mulino-fette', name: 'Fette Biscottate Classiche', brand: 'Mulino Bianco', category: 'Colazione', weight: '315g', unit: 'kg', barcode: '8076809527552', unitLabel: 'al kg' },
  { id: 'prod-mulino-biscotti', name: 'Biscotti Tarallucci', brand: 'Mulino Bianco', category: 'Colazione', weight: '800g', unit: 'kg', barcode: '8076809527811', unitLabel: 'al kg' },
  { id: 'prod-nutella-750', name: 'Nutella', brand: 'Ferrero', category: 'Colazione', weight: '750g', unit: 'kg', barcode: '3017620422003', unitLabel: 'al kg', isBio: 0 },
  { id: 'prod-nutella-200', name: 'Nutella', brand: 'Ferrero', category: 'Colazione', weight: '200g', unit: 'kg', barcode: '80177173', unitLabel: 'al kg' },
  { id: 'prod-monini-olio', name: 'Olio Extra Vergine Classico', brand: 'Monini', category: 'Condimenti', weight: '1L', unit: 'l', barcode: '8005510001198', unitLabel: 'al litro' },
  { id: 'prod-defilippo-olio', name: 'Olio Extra Vergine 100% Italiano', brand: 'De Filippo', category: 'Condimenti', weight: '1L', unit: 'l', barcode: '8033576190013', unitLabel: 'al litro' },
  { id: 'prod-mutti-passata', name: 'Passata di Pomodoro', brand: 'Mutti', category: 'Conserve', weight: '700g', unit: 'kg', barcode: '8005110000300', unitLabel: 'al kg' },
  { id: 'prod-mutti-polpa', name: 'Polpa di Pomodoro', brand: 'Mutti', category: 'Conserve', weight: '400g', unit: 'kg', barcode: '8005110000201', unitLabel: 'al kg' },
  { id: 'prod-cirio-pelati', name: 'Pomodori Pelati', brand: 'Cirio', category: 'Conserve', weight: '400g', unit: 'kg', barcode: '8000320430108', unitLabel: 'al kg' },
  { id: 'prod-parmareggio-parm', name: 'Parmigiano Reggiano DOP 24 mesi', brand: 'Parmareggio', category: 'Formaggi', weight: '200g', unit: 'kg', barcode: '8008701004015', unitLabel: 'al kg' },
  { id: 'prod-galbani-mozz', name: 'Mozzarella Santa Lucia', brand: 'Galbani', category: 'Formaggi', weight: '125g', unit: 'kg', barcode: '8000430101423', unitLabel: 'al kg' },
  { id: 'prod-granarolo-latte', name: 'Latte Intero Fresco', brand: 'Granarolo', category: 'Latticini', weight: '1L', unit: 'l', barcode: '8002670000108', unitLabel: 'al litro' },
  { id: 'prod-muller-yogurt', name: 'Yogurt Cremoso Fragola', brand: 'Müller', category: 'Latticini', weight: '125g', unit: 'kg', barcode: '4025500019600', unitLabel: 'al kg' },
  { id: 'prod-lavazza-qualita', name: 'Qualità Rossa', brand: 'Lavazza', category: 'Caffè', weight: '250g', unit: 'kg', barcode: '8000070012400', unitLabel: 'al kg' },
  { id: 'prod-illy-classico', name: 'Caffè Classico Macinato', brand: 'Illy', category: 'Caffè', weight: '250g', unit: 'kg', barcode: '8003753900483', unitLabel: 'al kg' },
  { id: 'prod-sanpellegrino-acqua', name: 'Acqua Minerale Naturale', brand: 'S.Pellegrino', category: 'Bevande', weight: '6x1.5L', unit: 'l', barcode: '8002270018180', unitLabel: 'al litro' },
  { id: 'prod-cocacola-classic', name: 'Coca-Cola Original', brand: 'Coca-Cola', category: 'Bevande', weight: '1.5L', unit: 'l', barcode: '5449000000996', unitLabel: 'al litro' },
  { id: 'prod-findus-4salti', name: '4 Salti in Padella Pollo', brand: 'Findus', category: 'Surgelati', weight: '550g', unit: 'kg', barcode: '8000500003374', unitLabel: 'al kg' },
  { id: 'prod-amadori-pollo', name: 'Petto di Pollo Il Campese', brand: 'Amadori', category: 'Carne', weight: '500g', unit: 'kg', barcode: '8004080100106', unitLabel: 'al kg' },
  { id: 'prod-beretta-prosciutto', name: 'Prosciutto Cotto Alta Qualità', brand: 'Fratelli Beretta', category: 'Salumi', weight: '100g', unit: 'kg', barcode: '8008714001012', unitLabel: 'al kg' },
  { id: 'prod-rio-tonno', name: 'Tonno all\'Olio di Oliva', brand: 'Rio Mare', category: 'Conserve', weight: '3x80g', unit: 'kg', barcode: '8004030100893', unitLabel: 'al kg' },
  { id: 'prod-scottex-carta', name: 'Carta Igienica Pulito Completo', brand: 'Scottex', category: 'Casa', weight: '12 rotoli', unit: 'pz', barcode: '5029053001005', unitLabel: 'al rotolo' },
  { id: 'prod-dash-detersivo', name: 'Detersivo Pods 3in1', brand: 'Dash', category: 'Casa', weight: '35 pods', unit: 'pz', barcode: '8001090460790', unitLabel: 'al lavaggio' },
  { id: 'prod-fairy-piatti', name: 'Detersivo Piatti Limone', brand: 'Fairy', category: 'Casa', weight: '900ml', unit: 'l', barcode: '8001090000132', unitLabel: 'al litro' },
  { id: 'prod-rigoni-nocc', name: 'Nocciolata Biologica', brand: 'Rigoni di Asiago', category: 'Colazione', weight: '270g', unit: 'kg', barcode: '8002391032205', unitLabel: 'al kg', isBio: 1 },
];

const insertProduct = db.prepare(`INSERT INTO products (id, name, brand, category, weight, unit, unit_price_label, barcode, is_bio, normalized_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const p of products) {
  insertProduct.run(p.id, p.name, p.brand, p.category, p.weight, p.unit, p.unitLabel, p.barcode, p.isBio || 0, `${p.brand} ${p.name}`.toLowerCase());
}
console.log(`✅ ${products.length} products seeded`);

// ─── PRICES ─────────────────────────────────────────────
const priceData = [
  // Barilla Spaghetti
  { prod: 'prod-barilla-spaghetti', store: 'store-esselunga-viale', price: 0.85, offer: 0.69, label: 'Promo -19%', end: '2026-03-06' },
  { prod: 'prod-barilla-spaghetti', store: 'store-lidl-navigli', price: 0.79, offer: null },
  { prod: 'prod-barilla-spaghetti', store: 'store-conad-buenos', price: 0.89, offer: null },
  { prod: 'prod-barilla-spaghetti', store: 'store-coop-piola', price: 0.85, offer: null },
  { prod: 'prod-barilla-spaghetti', store: 'store-carrefour-loreto', price: 0.92, offer: null },
  { prod: 'prod-barilla-spaghetti', store: 'store-eurospin-corvetto', price: 0.75, offer: null },
  // Barilla Penne
  { prod: 'prod-barilla-penne', store: 'store-esselunga-viale', price: 0.85, offer: null },
  { prod: 'prod-barilla-penne', store: 'store-lidl-navigli', price: 0.79, offer: null },
  { prod: 'prod-barilla-penne', store: 'store-conad-buenos', price: 0.89, offer: null },
  // De Cecco Fusilli
  { prod: 'prod-dececco-fusilli', store: 'store-esselunga-viale', price: 1.29, offer: 0.99, label: 'Sconto 23%', end: '2026-03-10' },
  { prod: 'prod-dececco-fusilli', store: 'store-conad-buenos', price: 1.35, offer: null },
  { prod: 'prod-dececco-fusilli', store: 'store-coop-piola', price: 1.29, offer: null },
  { prod: 'prod-dececco-fusilli', store: 'store-carrefour-loreto', price: 1.39, offer: null },
  // Rummo Rigatoni
  { prod: 'prod-rummo-rigatoni', store: 'store-esselunga-viale', price: 1.49, offer: null },
  { prod: 'prod-rummo-rigatoni', store: 'store-conad-buenos', price: 1.55, offer: null },
  // Nutella 750g
  { prod: 'prod-nutella-750', store: 'store-esselunga-viale', price: 3.99, offer: null },
  { prod: 'prod-nutella-750', store: 'store-lidl-navigli', price: 3.49, offer: null },
  { prod: 'prod-nutella-750', store: 'store-conad-buenos', price: 3.89, offer: null },
  { prod: 'prod-nutella-750', store: 'store-coop-piola', price: 3.79, offer: 3.29, label: 'Sconto soci', end: '2026-03-08' },
  { prod: 'prod-nutella-750', store: 'store-eurospin-corvetto', price: 3.59, offer: null },
  // Monini Olio
  { prod: 'prod-monini-olio', store: 'store-esselunga-viale', price: 7.99, offer: 5.99, label: 'Promo -25%', end: '2026-03-06' },
  { prod: 'prod-monini-olio', store: 'store-lidl-navigli', price: 7.49, offer: null },
  { prod: 'prod-monini-olio', store: 'store-conad-buenos', price: 8.29, offer: null },
  { prod: 'prod-monini-olio', store: 'store-coop-piola', price: 7.89, offer: null },
  { prod: 'prod-monini-olio', store: 'store-carrefour-loreto', price: 8.49, offer: null },
  { prod: 'prod-monini-olio', store: 'store-pam-wagner', price: 7.99, offer: null },
  // Mutti Passata
  { prod: 'prod-mutti-passata', store: 'store-esselunga-viale', price: 1.39, offer: null },
  { prod: 'prod-mutti-passata', store: 'store-lidl-navigli', price: 1.29, offer: null },
  { prod: 'prod-mutti-passata', store: 'store-conad-buenos', price: 1.45, offer: null },
  { prod: 'prod-mutti-passata', store: 'store-coop-piola', price: 1.35, offer: 1.09, label: '-19%', end: '2026-03-12' },
  // Parmigiano
  { prod: 'prod-parmareggio-parm', store: 'store-esselunga-viale', price: 3.99, offer: null },
  { prod: 'prod-parmareggio-parm', store: 'store-lidl-navigli', price: 3.69, offer: null },
  { prod: 'prod-parmareggio-parm', store: 'store-conad-buenos', price: 4.19, offer: null },
  { prod: 'prod-parmareggio-parm', store: 'store-coop-piola', price: 3.89, offer: null },
  // Mozzarella
  { prod: 'prod-galbani-mozz', store: 'store-esselunga-viale', price: 1.09, offer: 0.79, label: 'Super promo', end: '2026-03-05' },
  { prod: 'prod-galbani-mozz', store: 'store-lidl-navigli', price: 0.99, offer: null },
  { prod: 'prod-galbani-mozz', store: 'store-conad-buenos', price: 1.15, offer: null },
  // Latte
  { prod: 'prod-granarolo-latte', store: 'store-esselunga-viale', price: 1.65, offer: null },
  { prod: 'prod-granarolo-latte', store: 'store-lidl-navigli', price: 1.55, offer: null },
  { prod: 'prod-granarolo-latte', store: 'store-conad-buenos', price: 1.69, offer: null },
  { prod: 'prod-granarolo-latte', store: 'store-coop-piola', price: 1.59, offer: null },
  // Lavazza
  { prod: 'prod-lavazza-qualita', store: 'store-esselunga-viale', price: 3.49, offer: 2.79, label: 'Sconto 20%', end: '2026-03-08' },
  { prod: 'prod-lavazza-qualita', store: 'store-lidl-navigli', price: 3.29, offer: null },
  { prod: 'prod-lavazza-qualita', store: 'store-conad-buenos', price: 3.59, offer: null },
  { prod: 'prod-lavazza-qualita', store: 'store-coop-piola', price: 3.39, offer: null },
  // Mulino Bianco Fette
  { prod: 'prod-mulino-fette', store: 'store-esselunga-viale', price: 1.49, offer: null },
  { prod: 'prod-mulino-fette', store: 'store-lidl-navigli', price: 1.39, offer: null },
  { prod: 'prod-mulino-fette', store: 'store-conad-buenos', price: 1.55, offer: null },
  // Mulino Bianco Biscotti
  { prod: 'prod-mulino-biscotti', store: 'store-esselunga-viale', price: 2.89, offer: null },
  { prod: 'prod-mulino-biscotti', store: 'store-lidl-navigli', price: 2.79, offer: null },
  { prod: 'prod-mulino-biscotti', store: 'store-conad-buenos', price: 2.99, offer: null },
  { prod: 'prod-mulino-biscotti', store: 'store-coop-piola', price: 2.85, offer: 2.49, label: 'Soci -13%', end: '2026-03-10' },
  // Rio Mare Tonno
  { prod: 'prod-rio-tonno', store: 'store-esselunga-viale', price: 3.79, offer: null },
  { prod: 'prod-rio-tonno', store: 'store-lidl-navigli', price: 3.49, offer: null },
  { prod: 'prod-rio-tonno', store: 'store-conad-buenos', price: 3.89, offer: null },
  { prod: 'prod-rio-tonno', store: 'store-coop-piola', price: 3.69, offer: null },
  // Amadori Pollo
  { prod: 'prod-amadori-pollo', store: 'store-esselunga-viale', price: 6.49, offer: 4.99, label: '-23%', end: '2026-03-07' },
  { prod: 'prod-amadori-pollo', store: 'store-conad-buenos', price: 6.79, offer: null },
  { prod: 'prod-amadori-pollo', store: 'store-coop-piola', price: 6.39, offer: null },
  // Prosciutto Beretta
  { prod: 'prod-beretta-prosciutto', store: 'store-esselunga-viale', price: 2.29, offer: null },
  { prod: 'prod-beretta-prosciutto', store: 'store-conad-buenos', price: 2.39, offer: null },
  { prod: 'prod-beretta-prosciutto', store: 'store-lidl-navigli', price: 2.19, offer: null },
  // Coca Cola
  { prod: 'prod-cocacola-classic', store: 'store-esselunga-viale', price: 1.59, offer: null },
  { prod: 'prod-cocacola-classic', store: 'store-lidl-navigli', price: 1.39, offer: null },
  { prod: 'prod-cocacola-classic', store: 'store-conad-buenos', price: 1.65, offer: null },
  { prod: 'prod-cocacola-classic', store: 'store-eurospin-corvetto', price: 1.29, offer: null },
  // Dash Pods
  { prod: 'prod-dash-detersivo', store: 'store-esselunga-viale', price: 12.99, offer: 8.99, label: 'Mega sconto!', end: '2026-03-09' },
  { prod: 'prod-dash-detersivo', store: 'store-lidl-navigli', price: 11.99, offer: null },
  { prod: 'prod-dash-detersivo', store: 'store-conad-buenos', price: 13.49, offer: null },
  // Scottex
  { prod: 'prod-scottex-carta', store: 'store-esselunga-viale', price: 5.49, offer: null },
  { prod: 'prod-scottex-carta', store: 'store-lidl-navigli', price: 4.99, offer: null },
  { prod: 'prod-scottex-carta', store: 'store-eurospin-corvetto', price: 4.79, offer: null },
  // Fairy
  { prod: 'prod-fairy-piatti', store: 'store-esselunga-viale', price: 2.49, offer: null },
  { prod: 'prod-fairy-piatti', store: 'store-lidl-navigli', price: 2.29, offer: null },
  { prod: 'prod-fairy-piatti', store: 'store-conad-buenos', price: 2.59, offer: null },
  // Findus
  { prod: 'prod-findus-4salti', store: 'store-esselunga-viale', price: 3.99, offer: 2.99, label: '-25%', end: '2026-03-10' },
  { prod: 'prod-findus-4salti', store: 'store-conad-buenos', price: 4.19, offer: null },
  { prod: 'prod-findus-4salti', store: 'store-coop-piola', price: 3.89, offer: null },
  // Illy
  { prod: 'prod-illy-classico', store: 'store-esselunga-viale', price: 4.99, offer: null },
  { prod: 'prod-illy-classico', store: 'store-conad-buenos', price: 5.29, offer: null },
  { prod: 'prod-illy-classico', store: 'store-coop-piola', price: 4.89, offer: null },
  // Rigoni Nocciolata
  { prod: 'prod-rigoni-nocc', store: 'store-esselunga-viale', price: 2.89, offer: null },
  { prod: 'prod-rigoni-nocc', store: 'store-coop-piola', price: 2.79, offer: null },
  { prod: 'prod-rigoni-nocc', store: 'store-pam-wagner', price: 2.99, offer: null },
];

const insertPrice = db.prepare(`INSERT INTO prices (product_id, store_id, price, offer_price, offer_label, offer_end, price_per_unit, source) VALUES (?, ?, ?, ?, ?, ?, ?, 'manual')`);
for (const p of priceData) {
  const product = products.find(pr => pr.id === p.prod);
  const effectivePrice = p.offer || p.price;
  let ppu = effectivePrice;
  if (product?.weight) {
    const match = product.weight.match(/([\d.]+)/);
    if (match) {
      const w = parseFloat(match[1]);
      if (product.weight.includes('g') && !product.weight.includes('kg')) ppu = (effectivePrice / w) * 1000;
      else if (product.weight.includes('L') || product.weight.includes('l')) ppu = effectivePrice / w;
    }
  }
  insertPrice.run(p.prod, p.store, p.price, p.offer || null, p.label || null, p.end || null, Math.round(ppu * 100) / 100);
}
console.log(`✅ ${priceData.length} prices seeded`);

// ─── PRICE HISTORY ──────────────────────────────────────
const historyProducts = ['prod-barilla-spaghetti', 'prod-monini-olio', 'prod-nutella-750', 'prod-lavazza-qualita', 'prod-mutti-passata', 'prod-parmareggio-parm'];
const months = ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'];
const basePrices = { 'prod-barilla-spaghetti': 0.85, 'prod-monini-olio': 7.89, 'prod-nutella-750': 3.79, 'prod-lavazza-qualita': 3.39, 'prod-mutti-passata': 1.35, 'prod-parmareggio-parm': 3.89 };

const insertHistory = db.prepare(`INSERT INTO price_history (product_id, avg_price, min_price, max_price, date) VALUES (?, ?, ?, ?, ?)`);
for (const prodId of historyProducts) {
  const base = basePrices[prodId];
  for (const month of months) {
    const variance = (Math.random() - 0.5) * 0.4;
    const avg = Math.round((base + variance) * 100) / 100;
    const min = Math.round((avg - 0.15) * 100) / 100;
    const max = Math.round((avg + 0.25) * 100) / 100;
    insertHistory.run(prodId, avg, min, max, month);
  }
}
console.log('✅ Price history seeded');

// ─── SHOPPING LISTS ─────────────────────────────────────
const lists = [
  { id: 'list-settimanale', name: 'Spesa Settimanale', color: '#10b981', icon: 'shopping-cart', budget: 80 },
  { id: 'list-aperitivo', name: 'Aperitivo Sabato', color: '#8b5cf6', icon: 'wine', budget: 35 },
  { id: 'list-essenziali', name: 'Essenziali Casa', color: '#f59e0b', icon: 'home', budget: 25 },
];

const insertList = db.prepare(`INSERT INTO shopping_lists (id, user_id, name, color, icon, budget, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`);
for (const l of lists) {
  insertList.run(l.id, userId, l.name, l.color, l.icon, l.budget);
}

const listItemsData = [
  { listId: 'list-settimanale', prodId: 'prod-barilla-spaghetti', qty: 2 },
  { listId: 'list-settimanale', prodId: 'prod-monini-olio', qty: 1 },
  { listId: 'list-settimanale', prodId: 'prod-nutella-750', qty: 1 },
  { listId: 'list-settimanale', prodId: 'prod-mutti-passata', qty: 2 },
  { listId: 'list-settimanale', prodId: 'prod-granarolo-latte', qty: 3 },
  { listId: 'list-settimanale', prodId: 'prod-galbani-mozz', qty: 2 },
  { listId: 'list-settimanale', prodId: 'prod-parmareggio-parm', qty: 1 },
  { listId: 'list-settimanale', prodId: 'prod-lavazza-qualita', qty: 1 },
  { listId: 'list-settimanale', prodId: 'prod-amadori-pollo', qty: 1 },
  { listId: 'list-settimanale', prodId: 'prod-mulino-fette', qty: 1 },
  { listId: 'list-essenziali', prodId: 'prod-scottex-carta', qty: 1 },
  { listId: 'list-essenziali', prodId: 'prod-dash-detersivo', qty: 1 },
  { listId: 'list-essenziali', prodId: 'prod-fairy-piatti', qty: 1 },
];

const insertListItem = db.prepare(`INSERT INTO list_items (list_id, product_id, quantity, unit, sort_order) VALUES (?, ?, ?, 'pz', ?)`);
listItemsData.forEach((item, i) => {
  insertListItem.run(item.listId, item.prodId, item.qty, i);
});
console.log('✅ Shopping lists seeded');

// ─── COMMUNITY REPORTS ──────────────────────────────────
const reports = [
  { prodName: 'Olio Monini EV 1L', prodId: 'prod-monini-olio', storeId: 'store-esselunga-viale', reported: 5.99, normal: 7.99, receipt: 1, verified: 1, up: 34, down: 2 },
  { prodName: 'Nutella 750g', prodId: 'prod-nutella-750', storeId: 'store-coop-piola', reported: 3.29, normal: 3.79, receipt: 1, verified: 1, up: 28, down: 1 },
  { prodName: 'Dash Pods 35pz', prodId: 'prod-dash-detersivo', storeId: 'store-esselunga-viale', reported: 8.99, normal: 12.99, receipt: 1, verified: 1, up: 42, down: 0 },
  { prodName: 'Mozzarella Galbani', prodId: 'prod-galbani-mozz', storeId: 'store-esselunga-viale', reported: 0.79, normal: 1.09, receipt: 0, verified: 0, up: 15, down: 3 },
  { prodName: 'Petto Pollo Amadori 500g', prodId: 'prod-amadori-pollo', storeId: 'store-esselunga-viale', reported: 4.99, normal: 6.49, receipt: 1, verified: 1, up: 22, down: 1 },
];

const insertReport = db.prepare(`INSERT INTO community_reports (id, user_id, product_id, store_id, product_name, reported_price, normal_price, has_receipt, is_verified, upvotes, downvotes, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const r of reports) {
  insertReport.run(uuid(), userId, r.prodId, r.storeId, r.prodName, r.reported, r.normal, r.receipt, r.verified, r.up, r.down, '2026-03-15');
}
console.log('✅ Community reports seeded');

// ─── NOTIFICATIONS ──────────────────────────────────────
const notifs = [
  { type: 'price_alert', title: 'Olio Monini in offerta!', message: 'Esselunga: €5.99 (-25%). Prezzo più basso degli ultimi 3 mesi.' },
  { type: 'ai_suggestion', title: 'Risparmia €4.00 sulla spesa', message: 'Ho trovato 3 sostituti più economici per la tua lista settimanale.' },
  { type: 'community', title: 'Nuova segnalazione vicino a te', message: 'Dash Pods a €8.99 da Esselunga (verificato con scontrino).' },
  { type: 'offer_expiring', title: 'Offerte in scadenza domani', message: '5 offerte nella tua zona scadono entro 24 ore.' },
];

const insertNotif = db.prepare(`INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)`);
for (const n of notifs) {
  insertNotif.run(uuid(), userId, n.type, n.title, n.message);
}
console.log('✅ Notifications seeded');

// ─── PRICE ALERTS ───────────────────────────────────────
const alerts = [
  { prodId: 'prod-monini-olio', target: 6.00, type: 'target_price' },
  { prodId: 'prod-nutella-750', target: null, type: 'any_drop' },
  { prodId: 'prod-lavazza-qualita', target: 2.99, type: 'target_price' },
  { prodId: 'prod-parmareggio-parm', target: null, type: 'offer' },
];

const insertAlert = db.prepare(`INSERT INTO price_alerts (id, user_id, product_id, target_price, alert_type) VALUES (?, ?, ?, ?, ?)`);
for (const a of alerts) {
  insertAlert.run(uuid(), userId, a.prodId, a.target, a.type);
}
console.log('✅ Price alerts seeded');

db.close();
console.log('\n🎉 Database seeded successfully!');
console.log(`📦 DB path: ${DB_PATH}`);
