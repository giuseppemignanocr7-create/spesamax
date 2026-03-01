import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import ListeSpesa from './pages/ListeSpesa';
import Negozi from './pages/Negozi';
import Prezzi from './pages/Prezzi';
import AiAssistant from './pages/AiAssistant';
import Community from './pages/Community';
import Impostazioni from './pages/Impostazioni';

export default function App() {
  const { isDark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          isDark={isDark}
          onToggleTheme={toggle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/liste" element={<ListeSpesa />} />
            <Route path="/negozi" element={<Negozi />} />
            <Route path="/prezzi" element={<Prezzi />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/community" element={<Community />} />
            <Route path="/impostazioni" element={<Impostazioni />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
