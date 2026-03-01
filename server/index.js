import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import storesRoutes from './routes/stores.js';
import listsRoutes from './routes/lists.js';
import communityRoutes from './routes/community.js';
import notificationsRoutes from './routes/notifications.js';
import optimizerRoutes from './routes/optimizer.js';
import aiRoutes from './routes/ai.js';
import alertsRoutes from './routes/alerts.js';

import db from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ──────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Troppe richieste. Riprova tra qualche minuto.' },
});
app.use('/api/', limiter);

// AI chat has tighter limits
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Limite messaggi raggiunto. Attendi un minuto.' },
});
app.use('/api/ai/chat', aiLimiter);

// ─── ROUTES ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/optimize', optimizerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertsRoutes);

// ─── DASHBOARD STATS ────────────────────────────────────
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    const storesCount = db.prepare('SELECT COUNT(*) as count FROM stores WHERE is_active = 1').get();
    const offersCount = db.prepare('SELECT COUNT(*) as count FROM prices WHERE offer_price IS NOT NULL').get();
    const reportsCount = db.prepare("SELECT COUNT(*) as count FROM community_reports WHERE status = 'active'").get();

    const topOffers = db.prepare(`
      SELECT p.brand, p.name, p.weight, pr.price, pr.offer_price, pr.offer_label, pr.offer_end,
        s.name as store_name, s.color as store_color, s.logo as store_logo,
        ROUND((1.0 - pr.offer_price / pr.price) * 100) as discount_pct
      FROM prices pr
      JOIN products p ON p.id = pr.product_id
      JOIN stores s ON s.id = pr.store_id
      WHERE pr.offer_price IS NOT NULL
      ORDER BY discount_pct DESC
      LIMIT 10
    `).all();

    const weeklyStats = {
      productsTracked: productsCount.count,
      activeOffers: offersCount.count,
      storesMonitored: storesCount.count,
      communityReports: reportsCount.count,
    };

    res.json({ stats: weeklyStats, topOffers });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Errore nel recupero delle statistiche.' });
  }
});

// ─── HEALTH CHECK ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbCheck = db.prepare('SELECT 1 as ok').get();
  res.json({
    status: 'ok',
    version: '1.0.0',
    database: dbCheck?.ok === 1 ? 'connected' : 'error',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 ────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint non trovato: ${req.method} ${req.originalUrl}` });
});

// ─── ERROR HANDLER ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Errore interno del server.'
      : err.message,
  });
});

// ─── START ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SpesaMax API Server`);
  console.log(`   ├─ URL:      http://localhost:${PORT}`);
  console.log(`   ├─ Env:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ├─ CORS:     ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`);
  console.log(`   ├─ AI:       ${process.env.OPENAI_API_KEY ? 'OpenAI ✅' : 'Fallback mode (no API key)'}`);
  console.log(`   └─ Health:   http://localhost:${PORT}/api/health\n`);
});

export default app;
