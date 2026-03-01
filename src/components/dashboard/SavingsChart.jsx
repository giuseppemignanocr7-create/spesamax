import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { SAVINGS_CHART_DATA, USER_PROFILE } from '../../data/mockData';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">€{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SavingsChart() {
  const totalSaved = SAVINGS_CHART_DATA.reduce((s, d) => s + d.risparmio, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Andamento Risparmi</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ultime 8 settimane</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Totale periodo</p>
          <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">€{totalSaved.toFixed(2)}</p>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SAVINGS_CHART_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${v}`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="spesa"
              name="Spesa"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              barSize={20}
              opacity={0.4}
            />
            <Bar
              dataKey="risparmio"
              name="Risparmio"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Risparmio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-400 opacity-40" />
          <span>Spesa effettiva</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          Media €{(totalSaved / SAVINGS_CHART_DATA.length).toFixed(2)}/sett
        </div>
      </div>
    </motion.div>
  );
}
