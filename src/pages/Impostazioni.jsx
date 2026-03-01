import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Bell, MapPin, Shield, CreditCard, Palette,
  Globe, Smartphone, Download, Trash2, LogOut, ChevronRight,
  Crown, Check, Moon, Sun, Monitor, Mail, Lock, Eye, EyeOff,
  HelpCircle, MessageSquare, Star, ExternalLink, Heart, X, Loader2, Save
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { USER_PROFILE } from '../data/mockData';

function SettingSection({ icon: Icon, title, description, children, color = 'text-gray-600 dark:text-gray-400', bg = 'bg-gray-100 dark:bg-white/10' }) {
  return (
    <div className="glass-card p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleSetting({ label, description, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          on ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

function SelectSetting({ label, options, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/30"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function Impostazioni() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const profile = user || USER_PROFILE;

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: profile.name, surname: profile.surname, cap: profile.cap || '20100', city: profile.city || 'Milano' });
  const [saving, setSaving] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new1: '', new2: '' });
  const [pwdError, setPwdError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile(profileForm);
      } else {
        await api.updateProfile(profileForm);
      }
      setEditingProfile(false);
      setSavedMsg('Profilo aggiornato!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePwd = async () => {
    setPwdError('');
    if (pwdForm.new1 !== pwdForm.new2) { setPwdError('Le password non corrispondono'); return; }
    if (pwdForm.new1.length < 6) { setPwdError('Minimo 6 caratteri'); return; }
    try {
      await api.changePassword(pwdForm.current, pwdForm.new1);
      setShowPwdModal(false);
      setPwdForm({ current: '', new1: '', new2: '' });
      setSavedMsg('Password aggiornata!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setPwdError(err.message || 'Errore nel cambio password');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ profile, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'spesamax-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Impostazioni</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestisci il tuo account e le preferenze
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <SettingSection
          icon={User}
          title="Profilo"
          description="Informazioni personali"
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-100 dark:bg-blue-900/30"
        >
          {savedMsg && <div className="mb-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs font-semibold text-green-600 dark:text-green-400 text-center">{savedMsg}</div>}
          <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-xl">
              {(profile.name || 'U')[0]}{(profile.surname || '')[0]}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {profile.name} {profile.surname}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</p>
              {(profile.plan === 'premium' || profile.isPremium) && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge-amber text-[10px]"><Crown className="w-3 h-3" /> Premium</span>
                </div>
              )}
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)} className="btn-secondary text-xs">{editingProfile ? 'Annulla' : 'Modifica'}</button>
          </div>

          <AnimatePresence>
            {editingProfile && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome" className="input-field text-sm" />
                  <input type="text" value={profileForm.surname} onChange={e => setProfileForm(p => ({ ...p, surname: e.target.value }))} placeholder="Cognome" className="input-field text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={profileForm.cap} onChange={e => setProfileForm(p => ({ ...p, cap: e.target.value }))} placeholder="CAP" className="input-field text-sm" />
                  <input type="text" value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} placeholder="Città" className="input-field text-sm" />
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Salvataggio...' : 'Salva profilo'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">CAP</span>
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{profile.cap || '20100'} — {profile.city || 'Milano'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">Email</span>
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">Password</span>
              </div>
              <button onClick={() => setShowPwdModal(true)} className="text-xs font-semibold text-brand-600 dark:text-brand-400">Cambia</button>
            </div>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          icon={Bell}
          title="Notifiche"
          description="Scegli cosa ricevere"
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-100 dark:bg-amber-900/30"
        >
          <ToggleSetting label="Alert prezzi" description="Quando un prodotto tracciato scende di prezzo" defaultOn={true} />
          <ToggleSetting label="Offerte in scadenza" description="Promemoria prima che un'offerta scada" defaultOn={true} />
          <ToggleSetting label="Suggerimenti AI" description="Consigli personalizzati dal tuo assistente" defaultOn={true} />
          <ToggleSetting label="Community" description="Segnalazioni nella tua zona" defaultOn={false} />
          <ToggleSetting label="Newsletter settimanale" description="Riepilogo risparmi e migliori offerte" defaultOn={true} />
        </SettingSection>

        {/* Shopping preferences */}
        <SettingSection
          icon={Settings}
          title="Preferenze Spesa"
          description="Personalizza l'ottimizzazione"
          color="text-brand-600 dark:text-brand-400"
          bg="bg-brand-100 dark:bg-brand-900/30"
        >
          <SelectSetting
            label="Numero massimo negozi"
            defaultValue="3"
            options={[
              { value: '1', label: '1 negozio' },
              { value: '2', label: '2 negozi' },
              { value: '3', label: '3 negozi' },
              { value: '4', label: '4 negozi' },
              { value: '5', label: '5+ negozi' },
            ]}
          />
          <SelectSetting
            label="Raggio di ricerca"
            defaultValue="15"
            options={[
              { value: '5', label: '5 km' },
              { value: '10', label: '10 km' },
              { value: '15', label: '15 km' },
              { value: '25', label: '25 km' },
              { value: '50', label: '50 km' },
            ]}
          />
          <SelectSetting
            label="Priorità ottimizzazione"
            defaultValue="balanced"
            options={[
              { value: 'savings', label: 'Massimo risparmio' },
              { value: 'balanced', label: 'Bilanciato (€ vs tempo)' },
              { value: 'convenience', label: 'Meno negozi possibili' },
            ]}
          />
          <ToggleSetting label="Preferisci prodotti biologici" description="Mostra alternative bio quando disponibili" defaultOn={false} />
          <ToggleSetting label="Senza glutine" description="Filtra prodotti senza glutine" defaultOn={true} />
        </SettingSection>

        {/* Appearance */}
        <SettingSection
          icon={Palette}
          title="Aspetto"
          description="Personalizza l'interfaccia"
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-100 dark:bg-purple-900/30"
        >
          <SelectSetting
            label="Tema"
            defaultValue="dark"
            options={[
              { value: 'light', label: 'Chiaro' },
              { value: 'dark', label: 'Scuro' },
              { value: 'system', label: 'Sistema' },
            ]}
          />
          <SelectSetting
            label="Lingua"
            defaultValue="it"
            options={[
              { value: 'it', label: 'Italiano' },
              { value: 'en', label: 'English' },
            ]}
          />
          <ToggleSetting label="Animazioni" description="Effetti di transizione nell'interfaccia" defaultOn={true} />
        </SettingSection>

        {/* Premium */}
        <div className="glass-card overflow-hidden">
          <div className="gradient-brand p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-6 h-6" />
              <h3 className="text-lg font-bold">SpesaMax Premium</h3>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Il tuo abbonamento Premium è attivo fino al 15 giugno 2026.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-2xl font-extrabold">€{profile.total_savings ?? profile.totalSavings ?? 0}</p>
                <p className="text-xs text-white/70">Risparmiati in totale</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-2xl font-extrabold">€{profile.monthly_savings ?? profile.monthlySavings ?? 0}</p>
                <p className="text-xs text-white/70">Questo mese</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Il tuo piano include:</h4>
            <div className="space-y-2">
              {[
                'AI Assistant avanzato con suggerimenti personalizzati',
                'Storico prezzi illimitato (fino a 12 mesi)',
                'Percorso ottimizzato multi-negozio',
                'Alert personalizzati in tempo reale',
                'Multi-lista famiglia (fino a 10 liste)',
                'Nessuna pubblicità',
                'Supporto prioritario',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary text-xs flex-1">Gestisci Abbonamento</button>
              <button className="text-xs text-gray-400 hover:text-gray-600 px-3">Annulla</button>
            </div>
          </div>
        </div>

        {/* Data & privacy */}
        <SettingSection
          icon={Shield}
          title="Privacy & Dati"
          color="text-green-600 dark:text-green-400"
          bg="bg-green-100 dark:bg-green-900/30"
        >
          <ToggleSetting label="Condividi dati anonimi" description="Aiutaci a migliorare il servizio con dati aggregati" defaultOn={true} />
          <ToggleSetting label="Cronologia ricerche" description="Salva le tue ricerche per suggerimenti migliori" defaultOn={true} />
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Esporta i tuoi dati</span>
            <button onClick={handleExport} className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <Download className="w-3.5 h-3.5" /> Scarica
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Elimina account</span>
            <button onClick={() => { if (confirm('Sei sicuro? Questa azione è irreversibile.')) alert('Funzione non disponibile nella demo.'); }} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" /> Elimina
            </button>
          </div>
        </SettingSection>

        {/* Support */}
        <SettingSection
          icon={HelpCircle}
          title="Supporto"
          color="text-indigo-600 dark:text-indigo-400"
          bg="bg-indigo-100 dark:bg-indigo-900/30"
        >
          <div className="space-y-2">
            {[
              { icon: HelpCircle, label: 'Centro assistenza', action: 'Apri' },
              { icon: MessageSquare, label: 'Contattaci', action: 'Scrivi' },
              { icon: Star, label: 'Valuta SpesaMax', action: 'Valuta' },
              { icon: Heart, label: 'Condividi con amici', action: 'Invita' },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-left text-sm text-gray-900 dark:text-white">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut className="w-5 h-5" />
          Esci dall'account
        </button>

        {/* Password change modal */}
        <AnimatePresence>
          {showPwdModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cambia password</h3>
                  <button onClick={() => setShowPwdModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="space-y-3">
                  <input type="password" placeholder="Password attuale" value={pwdForm.current} onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))} className="input-field text-sm" />
                  <input type="password" placeholder="Nuova password" value={pwdForm.new1} onChange={e => setPwdForm(p => ({ ...p, new1: e.target.value }))} className="input-field text-sm" />
                  <input type="password" placeholder="Conferma nuova password" value={pwdForm.new2} onChange={e => setPwdForm(p => ({ ...p, new2: e.target.value }))} className="input-field text-sm" />
                  {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
                  <button onClick={handleChangePwd} className="btn-primary w-full text-sm">Aggiorna password</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Version */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 py-4">
          SpesaMax v1.0.0 · Made with ❤️ in Italia
        </p>
      </div>
    </div>
  );
}
