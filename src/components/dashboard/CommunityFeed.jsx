import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ThumbsUp, ThumbsDown, Camera, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { COMMUNITY_REPORTS } from '../../data/mockData';

function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ore fa`;
  return `${Math.floor(diffH / 24)} giorni fa`;
}

function ReportCard({ report, index }) {
  const [ups, setUps] = useState(report.upvotes || 0);
  const [downs, setDowns] = useState(report.downvotes || 0);
  const [voted, setVoted] = useState(null);

  const productName = report.product || report.product_name || '';
  const reportedPrice = report.reportedPrice ?? report.reported_price ?? 0;
  const normalPrice = report.normalPrice ?? report.normal_price ?? reportedPrice;
  const discount = normalPrice > 0 ? Math.round((1 - reportedPrice / normalPrice) * 100) : 0;
  const userName = report.user?.name || report.user_name || 'Utente';
  const userAvatar = report.user?.avatar || (userName[0] || 'U');
  const userRep = report.user?.reputation || report.user_reputation || 4.0;
  const storeName = report.store?.name || report.store_name || '';
  const isVerified = report.verified || report.is_verified;
  const hasReceipt = report.hasReceipt || report.has_receipt;
  const timestamp = report.timestamp || report.created_at;

  const handleVote = async (vote) => {
    if (voted === vote) { setVoted(null); vote === 1 ? setUps(u => u - 1) : setDowns(d => d - 1); }
    else {
      if (voted === -vote) { vote === 1 ? (setUps(u => u + 1), setDowns(d => d - 1)) : (setUps(u => u - 1), setDowns(d => d + 1)); }
      else { vote === 1 ? setUps(u => u + 1) : setDowns(d => d + 1); }
      setVoted(vote);
    }
    try { await api.voteReport(report.id, vote); } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {userAvatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-amber-500">★</span>
              <span className="text-[10px] text-gray-400">{userRep}</span>
            </div>
            {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
            <span className="font-medium text-gray-900 dark:text-white">{productName}</span>
            {storeName && <> presso {storeName}</>}
          </p>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">€{reportedPrice.toFixed(2)}</span>
            {normalPrice > reportedPrice && <span className="text-xs text-gray-400 line-through">€{normalPrice.toFixed(2)}</span>}
            {discount > 0 && <span className="badge-green text-[10px]">-{discount}%</span>}
            {hasReceipt && (
              <span className="badge-blue text-[10px]"><Camera className="w-3 h-3" /> Scontrino</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => handleVote(1)} className={`flex items-center gap-1 text-xs transition-colors ${voted === 1 ? 'text-brand-600 font-bold' : 'text-gray-400 hover:text-brand-500'}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{ups}</span>
              </button>
              <button onClick={() => handleVote(-1)} className={`flex items-center gap-1 text-xs transition-colors ${voted === -1 ? 'text-red-600 font-bold' : 'text-gray-400 hover:text-red-500'}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{downs}</span>
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              {timeAgo(timestamp)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityFeed() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(COMMUNITY_REPORTS.slice(0, 4));

  useEffect(() => {
    api.getCommunityReports({ limit: 4 })
      .then(data => { if (data.reports?.length) setReports(data.reports.slice(0, 4)); })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Community</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ultime segnalazioni verificate</p>
          </div>
        </div>
        <button onClick={() => navigate('/community')} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1">
          Vedi tutte <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {reports.map((report, i) => (
          <ReportCard key={report.id} report={report} index={i} />
        ))}
      </div>

      <button onClick={() => navigate('/community')} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-all">
        <Camera className="w-4 h-4" />
        Segnala un prezzo
      </button>
    </motion.div>
  );
}
