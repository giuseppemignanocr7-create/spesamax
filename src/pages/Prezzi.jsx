import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Search, Filter, TrendingDown, TrendingUp,
  ArrowUpDown, Tag, Star, Bell, BellPlus, Eye, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PRODUCTS, PRICES, STORES, PRICE_HISTORY } from '../data/mockData';

function getProductPrices(productId) {
  return PRICES.filter(p => p.productId === productId).map(pp => ({
    ...pp,
    store: STORES.find(s => s.id === pp.storeId),
    effectivePrice: pp.offerPrice || pp.price,
  })).sort((a, b) => a.effectivePrice - b.effectivePrice);
}

function PriceComparisonRow({ product, index }) {
  const prices = getProductPrices(product.id);
  const best = prices[0];
  const worst = prices[prices.length - 1];
  const savings = worst && best ? (worst.effectivePrice - best.effectivePrice).toFixed(2) : '0.00';
  const history = PRICE_HISTORY[product.id];
  const [expanded, setExpanded] = useState(false);
  const [tracked, setTracked] = useState(!!history);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card-hover overflow-hidden"
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
          {product.brand[0]}{product.brand[1]}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {product.brand} {product.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{product.weight}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{product.category}</span>
            {best?.offerPrice && (
              <span className="badge-red text-[10px]">
                <Tag className="w-3 h-3" /> In offerta
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          {/* Best price */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Miglior prezzo</p>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                €{best?.effectivePrice.toFixed(2)}
              </p>
              {best?.store && (
                <div
                  className="w-5 h-5 rounded text-[8px] text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: best.store.color }}
                >
                  {best.store.logo[0]}
                </div>
              )}
            </div>
          </div>

          {/* Savings */}
          {Number(savings) > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Risparmi</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                €{savings}
              </p>
            </div>
          )}
        </div>

        {/* Track button */}
        <button
          onClick={(e) => { e.stopPropagation(); setTracked(!tracked); }}
          className={`p-2 rounded-lg transition-all ${
            tracked
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
          }`}
        >
          {tracked ? <Bell className="w-4 h-4 fill-current" /> : <BellPlus className="w-4 h-4" />}
        </button>

        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {/* Expanded: price comparison + chart */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 pt-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price list by store */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Confronto Prezzi
              </h5>
              <div className="space-y-1.5">
                {prices.map((pp, i) => (
                  <div
                    key={pp.storeId}
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${
                      i === 0 ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-700/30' : 'bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: pp.store?.color }}
                    >
                      {pp.store?.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{pp.store?.name}</p>
                      <p className="text-[10px] text-gray-400">{pp.store?.distance} km</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${i === 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                        €{pp.effectivePrice.toFixed(2)}
                      </p>
                      {pp.offerPrice && (
                        <p className="text-[10px] text-gray-400 line-through">€{pp.price.toFixed(2)}</p>
                      )}
                    </div>
                    {i === 0 && (
                      <span className="badge-green text-[10px]">Best</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-xs text-gray-500 dark:text-gray-400">
                {product.unitPrice}: <strong className="text-gray-900 dark:text-white">€{best?.pricePerUnit?.toFixed(2)}</strong>
                <span className="text-[10px] ml-1">(prezzo unitario migliore)</span>
              </div>
            </div>

            {/* Price history chart */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Storico Prezzi (6 mesi)
              </h5>
              {history ? (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <defs>
                        <linearGradient id={`grad-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={40} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="glass-card p-2 shadow-xl text-xs">
                              <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                              <p className="text-brand-600 dark:text-brand-400 font-bold">€{payload[0].value}</p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} fill={`url(#grad-${product.id})`} dot={{ r: 3, fill: '#10b981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <div className="text-center">
                    <Eye className="w-5 h-5 mx-auto mb-1 opacity-50" />
                    <p>Attiva il tracciamento per vedere lo storico</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Prezzi() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [onlyOffers, setOnlyOffers] = useState(false);

  let filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (onlyOffers) {
    filtered = filtered.filter(p =>
      PRICES.some(pp => pp.productId === p.id && pp.offerPrice)
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Confronto Prezzi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filtered.length} prodotti · {STORES.length} negozi monitorati
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca prodotto, marca, categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>
          <button
            onClick={() => setOnlyOffers(!onlyOffers)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              onlyOffers
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            Solo Offerte
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            <ArrowUpDown className="w-4 h-4" />
            Ordina
          </button>
        </div>
      </div>

      {/* Products grid */}
      <div className="space-y-3">
        {filtered.map((product, i) => (
          <PriceComparisonRow key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
