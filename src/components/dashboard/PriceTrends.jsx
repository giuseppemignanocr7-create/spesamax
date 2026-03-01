import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, ArrowDown, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { PRICE_HISTORY, PRODUCTS } from '../../data/mockData';

const TRACKED_PRODUCTS = [
  { id: 'prod_004', color: '#10b981' },
  { id: 'prod_007', color: '#8b5cf6' },
  { id: 'prod_008', color: '#f59e0b' },
  { id: 'prod_001', color: '#3b82f6' },
  { id: 'prod_010', color: '#ef4444' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">€{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PriceTrends() {
  const [selectedProduct, setSelectedProduct] = useState('prod_004');
  const product = PRODUCTS.find(p => p.id === selectedProduct);
  const history = PRICE_HISTORY[selectedProduct] || [];
  const currentPrice = history[history.length - 1]?.avg || 0;
  const previousPrice = history[history.length - 2]?.avg || 0;
  const changePercent = previousPrice ? (((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Trend Prezzi</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Storico ultimi 6 mesi</p>
          </div>
        </div>
      </div>

      {/* Product selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {TRACKED_PRODUCTS.map(({ id, color }) => {
          const p = PRODUCTS.find(pr => pr.id === id);
          return (
            <button
              key={id}
              onClick={() => setSelectedProduct(id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedProduct === id
                  ? 'text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
              style={selectedProduct === id ? { backgroundColor: color } : {}}
            >
              {p?.brand}
            </button>
          );
        })}
      </div>

      {/* Current price info */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{product?.brand} {product?.name}</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">€{currentPrice}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${
          Number(changePercent) <= 0
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {Number(changePercent) <= 0 ? <TrendingDown className="w-4 h-4" /> : <ArrowDown className="w-4 h-4 rotate-180" />}
          {changePercent}%
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${v}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avg"
              name={product?.brand}
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/5 border border-brand-200/50 dark:border-brand-800/30">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-brand-700 dark:text-brand-300">
            <strong>Minimo storico!</strong> {product?.brand} {product?.name} al prezzo più basso degli ultimi 6 mesi. Consigliamo l'acquisto ora.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
