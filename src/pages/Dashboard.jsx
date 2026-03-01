import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HeroSavings from '../components/dashboard/HeroSavings';
import QuickStats from '../components/dashboard/QuickStats';
import SmartCart from '../components/dashboard/SmartCart';
import AiSuggestions from '../components/dashboard/AiSuggestions';
import PriceTrends from '../components/dashboard/PriceTrends';
import SavingsChart from '../components/dashboard/SavingsChart';
import StoreMap from '../components/dashboard/StoreMap';
import CommunityFeed from '../components/dashboard/CommunityFeed';

export default function Dashboard() {
  const { user } = useAuth();
  const [apiStats, setApiStats] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    api.getDashboardStats()
      .then(data => { setApiStats(data); setApiConnected(true); })
      .catch(() => setApiConnected(false));
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {apiConnected && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-xs text-green-700 dark:text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Backend connesso · {apiStats?.stats?.productsTracked || 0} prodotti · {apiStats?.stats?.activeOffers || 0} offerte attive · {apiStats?.stats?.storesMonitored || 0} negozi
        </div>
      )}

      {/* Hero */}
      <HeroSavings user={user} />

      {/* Quick Stats */}
      <QuickStats apiStats={apiStats?.stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <SmartCart />
          <SavingsChart />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <StoreMap />
          <AiSuggestions />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrends />
        <CommunityFeed />
      </div>
    </div>
  );
}
