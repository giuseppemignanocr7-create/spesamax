import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Camera, ThumbsUp, ThumbsDown, CheckCircle2, Clock,
  Award, Star, TrendingUp, Upload, Filter, Search, Shield,
  MessageSquare, Flame, ChevronRight, Crown
} from 'lucide-react';
import { COMMUNITY_REPORTS, USER_PROFILE } from '../data/mockData';

const LEADERBOARD = [
  { rank: 1, name: 'Chiara T.', contributions: 203, reputation: 4.7, savings: 890, avatar: 'CT' },
  { rank: 2, name: 'Laura B.', contributions: 156, reputation: 4.9, savings: 720, avatar: 'LB' },
  { rank: 3, name: 'Sofia R.', contributions: 127, reputation: 4.6, savings: 650, avatar: 'SR' },
  { rank: 4, name: 'Giovanni M.', contributions: 89, reputation: 4.5, savings: 430, avatar: 'GM' },
  { rank: 5, name: 'Marco R.', contributions: 42, reputation: 4.8, savings: 340, avatar: 'MR', isYou: true },
  { rank: 6, name: 'Andrea F.', contributions: 34, reputation: 4.2, savings: 280, avatar: 'AF' },
];

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card-hover p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {report.user.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{report.user.name}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs text-gray-500">{report.user.reputation}</span>
            </div>
            {report.verified && (
              <span className="badge-green text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Verificato
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(report.timestamp)}
            </span>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">
            Ha trovato <strong className="text-gray-900 dark:text-white">{report.product}</strong> a{' '}
            <strong className="text-brand-600 dark:text-brand-400">€{report.reportedPrice.toFixed(2)}</strong>
            <span className="text-gray-400 line-through ml-1">€{report.normalPrice.toFixed(2)}</span>
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: `${report.store.color}15`, color: report.store.color }}
            >
              <div
                className="w-4 h-4 rounded text-[8px] text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: report.store.color }}
              >
                {report.store.logo[0]}
              </div>
              {report.store.name}
            </div>
            <span className="badge-green text-[10px]">-{discount}%</span>
            {report.hasReceipt && (
              <span className="badge-blue text-[10px]">
                <Camera className="w-3 h-3" /> Scontrino
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-500 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="font-semibold">{report.upvotes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
                <ThumbsDown className="w-4 h-4" />
                <span className="font-semibold">{report.downvotes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Commenta</span>
              </button>
            </div>
            <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors">
              Aggiungi al carrello
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Community() {
  const [tab, setTab] = useState('feed');
  const [search, setSearch] = useState('');

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Community</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Condividi e scopri prezzi segnalati dagli utenti
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Segnala Prezzo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs & filters */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-4 mb-3">
              {['feed', 'verificati', 'vicini'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-sm font-semibold capitalize transition-all pb-1 border-b-2 ${
                    tab === t
                      ? 'text-brand-600 dark:text-brand-400 border-brand-500'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t === 'feed' ? 'Tutti' : t === 'verificati' ? 'Verificati' : 'Vicino a me'}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca segnalazioni..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          {/* Upload CTA */}
          <div className="glass-card p-5 border-2 border-dashed border-brand-200 dark:border-brand-800/30 bg-brand-50/30 dark:bg-brand-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hai visto un'offerta?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Scatta una foto allo scontrino o al cartellino prezzo. L'OCR legge automaticamente i dati!
                </p>
              </div>
              <button className="btn-primary text-sm">
                <Camera className="w-4 h-4 inline mr-1" />
                Scatta
              </button>
            </div>
          </div>

          {/* Reports */}
          <div className="space-y-3">
            {COMMUNITY_REPORTS.map((report, i) => (
              <ReportCard key={report.id} report={report} index={i} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Your stats */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold">
                {USER_PROFILE.name[0]}{USER_PROFILE.surname[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {USER_PROFILE.name} {USER_PROFILE.surname}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{USER_PROFILE.reputation}</span>
                  <span className="text-xs text-gray-400">· {USER_PROFILE.contributionsCount} contributi</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">{USER_PROFILE.contributionsCount}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Segnalazioni</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">89%</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Accuratezza</p>
              </div>
            </div>

            {/* Level progress */}
            <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/5 border border-brand-200/50 dark:border-brand-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Livello Contributor</span>
                <span className="badge-green text-[10px]">
                  <Shield className="w-3 h-3" /> Livello 3
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-200 dark:bg-brand-900/50">
                <div className="h-full rounded-full gradient-brand" style={{ width: '68%' }} />
              </div>
              <p className="text-[10px] text-brand-600/70 dark:text-brand-400/70 mt-1">
                8 contributi al Livello 4 (50 punti bonus)
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Classifica Milano</h3>
              </div>
              <button className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                Tutto <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {LEADERBOARD.map((user, i) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    user.isYou
                      ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-700/30'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`w-6 text-center text-sm font-extrabold ${
                    user.rank === 1 ? 'text-amber-500' :
                    user.rank === 2 ? 'text-gray-400' :
                    user.rank === 3 ? 'text-amber-700' :
                    'text-gray-300 dark:text-gray-600'
                  }`}>
                    {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : `#${user.rank}`}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {user.name} {user.isYou && <span className="text-brand-500">(Tu)</span>}
                    </p>
                    <p className="text-[10px] text-gray-400">{user.contributions} contributi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400">€{user.savings}</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] text-gray-400">{user.reputation}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hot deals */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Offerte Trending</h3>
            </div>
            <div className="space-y-2">
              {COMMUNITY_REPORTS.filter(r => r.upvotes > 20).map((r, i) => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">
                    {r.product}
                  </p>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    €{r.reportedPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
