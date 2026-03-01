import HeroSavings from '../components/dashboard/HeroSavings';
import QuickStats from '../components/dashboard/QuickStats';
import SmartCart from '../components/dashboard/SmartCart';
import AiSuggestions from '../components/dashboard/AiSuggestions';
import PriceTrends from '../components/dashboard/PriceTrends';
import SavingsChart from '../components/dashboard/SavingsChart';
import StoreMap from '../components/dashboard/StoreMap';
import CommunityFeed from '../components/dashboard/CommunityFeed';

export default function Dashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Hero */}
      <HeroSavings />

      {/* Quick Stats */}
      <QuickStats />

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
