import { motion } from 'framer-motion';
import { Users, ThumbsUp, ThumbsDown, Camera, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { COMMUNITY_REPORTS } from '../../data/mockData';

function timeAgo(timestamp) {
  const now = new Date('2026-03-01T15:00:00');
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ore fa`;
  return `${Math.floor(diffH / 24)} giorni fa`;
}

function ReportCard({ report, index }) {
  const discount = Math.round((1 - report.reportedPrice / report.normalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {report.user.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{report.user.name}</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-amber-500">★</span>
              <span className="text-[10px] text-gray-400">{report.user.reputation}</span>
            </div>
            {report.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
            )}
          </div>

          {/* Product & Price */}
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
            <span className="font-medium text-gray-900 dark:text-white">{report.product}</span>
            {' '}presso {report.store.name}
          </p>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
              €{report.reportedPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 line-through">
              €{report.normalPrice.toFixed(2)}
            </span>
            <span className="badge-green text-[10px]">-{discount}%</span>
            {report.hasReceipt && (
              <span className="badge-blue text-[10px]">
                <Camera className="w-3 h-3" /> Scontrino
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{report.upvotes}</span>
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{report.downvotes}</span>
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              {timeAgo(report.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityFeed() {
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
        <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1">
          Vedi tutte <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {COMMUNITY_REPORTS.slice(0, 4).map((report, i) => (
          <ReportCard key={report.id} report={report} index={i} />
        ))}
      </div>

      {/* CTA */}
      <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-all">
        <Camera className="w-4 h-4" />
        Segnala un prezzo
      </button>
    </motion.div>
  );
}
