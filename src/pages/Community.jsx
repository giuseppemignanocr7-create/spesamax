import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Camera, ThumbsUp, ThumbsDown, CheckCircle2, Clock,
  Award, Star, TrendingUp, Upload, Filter, Search, Shield,
  MessageSquare, Flame, ChevronRight, Crown, X, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { COMMUNITY_REPORTS, USER_PROFILE } from '../data/mockData';

const FALLBACK_LEADERBOARD = [
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

function ReportCard({ report, index, onVote }) {
  const [ups, setUps] = useState(report.upvotes);
  const [downs, setDowns] = useState(report.downvotes);
  const [voted, setVoted] = useState(null);

  const productName = report.product || report.product_name || '';
  const reportedPrice = report.reportedPrice ?? report.reported_price ?? 0;
  const normalPrice = report.normalPrice ?? report.normal_price ?? reportedPrice;
  const discount = normalPrice > 0 ? Math.round((1 - reportedPrice / normalPrice) * 100) : 0;
  const userName = report.user?.name || report.user_name || 'Utente';
  const userAvatar = report.user?.avatar || (report.user_name ? report.user_name[0] + (report.user_surname?.[0] || '') : 'U');
  const userRep = report.user?.reputation || report.user_reputation || 4.0;
  const isVerified = report.verified || report.is_verified;
  const storeName = report.store?.name || report.store_name || '';
  const storeColor = report.store?.color || report.store_color || '#10b981';
  const storeLogo = report.store?.logo || report.store_logo || storeName[0] || '?';
  const hasReceipt = report.hasReceipt || report.has_receipt;
  const timestamp = report.timestamp || report.created_at;

  const handleVote = async (vote) => {
    if (voted === vote) {
      setVoted(null);
      if (vote === 1) setUps(u => u - 1); else setDowns(d => d - 1);
    } else {
      if (voted === -vote) {
        if (vote === 1) { setUps(u => u + 1); setDowns(d => d - 1); }
        else { setUps(u => u - 1); setDowns(d => d + 1); }
      } else {
        if (vote === 1) setUps(u => u + 1); else setDowns(d => d + 1);
      }
      setVoted(vote);
    }
    try { await api.voteReport(report.id, vote); } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card-hover p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {userAvatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{userName}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs text-gray-500">{userRep}</span>
            </div>
            {isVerified && (
              <span className="badge-green text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Verificato
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(timestamp)}
            </span>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">
            Ha trovato <strong className="text-gray-900 dark:text-white">{productName}</strong> a{' '}
            <strong className="text-brand-600 dark:text-brand-400">€{reportedPrice.toFixed(2)}</strong>
            {normalPrice > reportedPrice && <span className="text-gray-400 line-through ml-1">€{normalPrice.toFixed(2)}</span>}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: `${storeColor}15`, color: storeColor }}>
              <div className="w-4 h-4 rounded text-[8px] text-white flex items-center justify-center font-bold" style={{ backgroundColor: storeColor }}>
                {storeLogo[0]}
              </div>
              {storeName}
            </div>
            {discount > 0 && <span className="badge-green text-[10px]">-{discount}%</span>}
            {hasReceipt && (
              <span className="badge-blue text-[10px]">
                <Camera className="w-3 h-3" /> Scontrino
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => handleVote(1)} className={`flex items-center gap-1.5 text-xs transition-colors ${voted === 1 ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-brand-500'}`}>
                <ThumbsUp className="w-4 h-4" />
                <span className="font-semibold">{ups}</span>
              </button>
              <button onClick={() => handleVote(-1)} className={`flex items-center gap-1.5 text-xs transition-colors ${voted === -1 ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-red-500'}`}>
                <ThumbsDown className="w-4 h-4" />
                <span className="font-semibold">{downs}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const profile = user || USER_PROFILE;
  const [tab, setTab] = useState('feed');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(COMMUNITY_REPORTS);
  const [leaderboard, setLeaderboard] = useState(FALLBACK_LEADERBOARD);
  const [showReport, setShowReport] = useState(false);
  const [stores, setStores] = useState([]);
  const [newReport, setNewReport] = useState({ store_id: '', product_name: '', reported_price: '', normal_price: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCommunityReports({ limit: 30 })
      .then(data => { if (data.reports?.length) setReports(data.reports); })
      .catch(() => {});
    api.getLeaderboard()
      .then(data => {
        if (data.leaderboard?.length) {
          setLeaderboard(data.leaderboard.map((u, i) => ({
            rank: i + 1, name: `${u.name} ${u.surname?.[0] || ''}.`, contributions: u.contributions_count,
            reputation: u.reputation, savings: u.total_savings, avatar: `${u.name[0]}${u.surname?.[0] || ''}`,
            isYou: u.id === profile?.id,
          })));
        }
      })
      .catch(() => {});
    api.getStores().then(data => { if (data.stores?.length) setStores(data.stores); }).catch(() => {});
  }, []);

  const handleSubmitReport = async () => {
    if (!newReport.store_id || !newReport.product_name || !newReport.reported_price) return;
    setSubmitting(true);
    try {
      const data = await api.createReport({
        store_id: newReport.store_id,
        product_name: newReport.product_name,
        reported_price: parseFloat(newReport.reported_price),
        normal_price: newReport.normal_price ? parseFloat(newReport.normal_price) : null,
      });
      setReports(prev => [data.report, ...prev]);
      setShowReport(false);
      setNewReport({ store_id: '', product_name: '', reported_price: '', normal_price: '' });
    } catch (err) {
      alert(err.message || 'Errore nella segnalazione');
    } finally {
      setSubmitting(false);
    }
  };

  // Tab filtering
  let filteredReports = reports;
  if (tab === 'verificati') filteredReports = reports.filter(r => r.verified || r.is_verified);
  if (search) {
    const q = search.toLowerCase();
    filteredReports = filteredReports.filter(r =>
      (r.product || r.product_name || '').toLowerCase().includes(q) ||
      (r.store?.name || r.store_name || '').toLowerCase().includes(q)
    );
  }

  const hotDeals = reports.filter(r => (r.upvotes || 0) > 5).slice(0, 5);

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Community</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {reports.length} segnalazioni · Condividi e scopri prezzi
          </p>
        </div>
        <button onClick={() => setShowReport(true)} className="btn-primary flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Segnala Prezzo
        </button>
      </div>

      {/* Segnala Prezzo Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Segnala un prezzo</h3>
                <button onClick={() => setShowReport(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                <select value={newReport.store_id} onChange={e => setNewReport(p => ({ ...p, store_id: e.target.value }))} className="input-field text-sm">
                  <option value="">Seleziona negozio...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" placeholder="Nome prodotto" value={newReport.product_name} onChange={e => setNewReport(p => ({ ...p, product_name: e.target.value }))} className="input-field text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.01" placeholder="Prezzo trovato €" value={newReport.reported_price} onChange={e => setNewReport(p => ({ ...p, reported_price: e.target.value }))} className="input-field text-sm" />
                  <input type="number" step="0.01" placeholder="Prezzo normale €" value={newReport.normal_price} onChange={e => setNewReport(p => ({ ...p, normal_price: e.target.value }))} className="input-field text-sm" />
                </div>
                <button onClick={handleSubmitReport} disabled={submitting || !newReport.store_id || !newReport.product_name || !newReport.reported_price} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {submitting ? 'Invio...' : 'Pubblica segnalazione'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs & filters */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-4 mb-3">
              {['feed', 'verificati'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-sm font-semibold capitalize transition-all pb-1 border-b-2 ${
                    tab === t
                      ? 'text-brand-600 dark:text-brand-400 border-brand-500'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t === 'feed' ? 'Tutti' : 'Verificati'}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cerca segnalazioni..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm" />
            </div>
          </div>

          {/* Reports */}
          <div className="space-y-3">
            {filteredReports.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nessuna segnalazione trovata</p>
              </div>
            )}
            {filteredReports.map((report, i) => (
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
                {(profile.name || 'U')[0]}{(profile.surname || '')[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {profile.name} {profile.surname}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{profile.reputation}</span>
                  <span className="text-xs text-gray-400">· {profile.contributions_count || profile.contributionsCount || 0} contributi</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">{profile.contributions_count || profile.contributionsCount || 0}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Segnalazioni</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">89%</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Accuratezza</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/5 border border-brand-200/50 dark:border-brand-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Livello Contributor</span>
                <span className="badge-green text-[10px]"><Shield className="w-3 h-3" /> Livello 3</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-200 dark:bg-brand-900/50">
                <div className="h-full rounded-full gradient-brand" style={{ width: '68%' }} />
              </div>
              <p className="text-[10px] text-brand-600/70 dark:text-brand-400/70 mt-1">8 contributi al Livello 4</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Classifica Milano</h3>
            </div>
            <div className="space-y-2">
              {leaderboard.map((u, i) => (
                <motion.div key={u.rank} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${u.isYou ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-700/30' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <span className={`w-6 text-center text-sm font-extrabold ${u.rank === 1 ? 'text-amber-500' : u.rank === 2 ? 'text-gray-400' : u.rank === 3 ? 'text-amber-700' : 'text-gray-300 dark:text-gray-600'}`}>
                    {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : `#${u.rank}`}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{u.name} {u.isYou && <span className="text-brand-500">(Tu)</span>}</p>
                    <p className="text-[10px] text-gray-400">{u.contributions} contributi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400">€{u.savings}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hot deals */}
          {hotDeals.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Offerte Trending</h3>
              </div>
              <div className="space-y-2">
                {hotDeals.map(r => (
                  <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                    <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{r.product || r.product_name}</p>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">€{(r.reportedPrice ?? r.reported_price ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
