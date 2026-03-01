import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Bell, ListChecks, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { WEEKLY_STATS } from '../../data/mockData';

const STATS = [
  {
    label: 'Prodotti Tracciati',
    value: WEEKLY_STATS.productsTracked,
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    trend: '+5',
    trendUp: true,
    link: '/prezzi',
  },
  {
    label: 'Alert Attivi',
    value: WEEKLY_STATS.priceAlerts,
    icon: Bell,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    trend: '+2',
    trendUp: true,
    link: '/prezzi',
  },
  {
    label: 'Liste Ottimizzate',
    value: WEEKLY_STATS.listsOptimized,
    icon: ListChecks,
    color: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-100 dark:bg-brand-900/30',
    trend: '=',
    trendUp: null,
    link: '/liste',
  },
  {
    label: 'Contributi Community',
    value: WEEKLY_STATS.communityContributions,
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    trend: '+3',
    trendUp: true,
    link: '/community',
  },
];

export default function QuickStats({ apiStats }) {
  const navigate = useNavigate();

  const stats = apiStats ? [
    { ...STATS[0], value: apiStats.productsTracked || STATS[0].value },
    { ...STATS[1], value: apiStats.activeOffers || STATS[1].value },
    { ...STATS[2], value: STATS[2].value },
    { ...STATS[3], value: apiStats.communityReports || STATS[3].value },
  ] : STATS;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          onClick={() => navigate(stat.link)}
          className="glass-card-hover p-4 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            {stat.trendUp !== null && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500'
              }`}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            )}
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
