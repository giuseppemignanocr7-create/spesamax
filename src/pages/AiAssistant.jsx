import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, TrendingDown, RefreshCw, Lightbulb,
  ShoppingCart, Tag, Clock, ArrowDownRight, Mic, Paperclip,
  ThumbsUp, ThumbsDown, Copy, RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { AI_SUGGESTIONS } from '../data/mockData';

const CHAT_HISTORY = [
  {
    id: 1,
    role: 'assistant',
    content: 'Ciao Marco! Sono il tuo assistente AI per la spesa. Ho analizzato la tua lista settimanale e ho trovato **5 modi per risparmiare** questa settimana. Cosa vuoi sapere?',
    timestamp: '14:30',
  },
  {
    id: 2,
    role: 'user',
    content: 'Qual è il momento migliore per comprare l\'olio d\'oliva?',
    timestamp: '14:31',
  },
  {
    id: 3,
    role: 'assistant',
    content: 'Ottima domanda! Analizzando lo storico prezzi degli ultimi 12 mesi:\n\n**Olio Extra Vergine Monini 1L:**\n- 📉 Prezzo attuale: **€5.99** da Esselunga (offerta fino al 6 marzo)\n- 📊 Media ultimi 6 mesi: **€7.89**\n- 🏆 Minimo storico: **€5.49** (agosto 2025)\n- ⚠️ Massimo: **€8.99** (dicembre 2025)\n\n**Il mio consiglio:** Compra ORA. Il prezzo è al -24% rispetto alla media. Dopo la fine dell\'offerta (6 marzo) risalirà probabilmente a €7.99. Se hai spazio, prendi 2 bottiglie.\n\nVuoi che lo aggiunga al carrello?',
    timestamp: '14:31',
    savings: 3.80,
  },
  {
    id: 4,
    role: 'user',
    content: 'Sì, aggiungine 2. E ci sono sostituti più economici per la Nutella?',
    timestamp: '14:32',
  },
  {
    id: 5,
    role: 'assistant',
    content: '✅ Aggiunte 2 bottiglie di Olio Monini al carrello (€11.98 totale, risparmi €7.60 vs prezzo pieno).\n\nPer la **Nutella 750g** (attualmente €3.49 da Lidl), ecco le alternative:\n\n| Prodotto | Prezzo | €/kg | Risparmio |\n|---|---|---|---|\n| 🥇 **Crema Nocciolata Rigoni** 270g | €2.29 | €8.48/kg | Biologica, meno zucchero |\n| 🥈 **Crema Novi** 350g | €2.49 | €7.11/kg | -€0.46/kg vs Nutella |\n| 🥉 **Pan di Stelle Crema** 330g | €2.79 | €8.45/kg | Più cioccolato |\n| 💰 **Nocciolata Lidl** 400g | €1.99 | €4.98/kg | **Risparmio max: -33%** |\n\nLa **Nocciolata Lidl** è il miglior rapporto qualità/prezzo. Se preferisci qualità premium, la **Rigoni** è eccellente e biologica.\n\nQuale preferisci?',
    timestamp: '14:33',
    savings: 1.50,
  },
];

const QUICK_PROMPTS = [
  { icon: '💡', text: 'Cosa posso risparmiare questa settimana?' },
  { icon: '🔄', text: 'Trova sostituti più economici' },
  { icon: '📊', text: 'Analizza i trend dei miei prodotti' },
  { icon: '🏪', text: 'Quale negozio conviene di più?' },
];

function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';

  const formatContent = (content) => {
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, '<br/>')
      .replace(/\|(.*?)\|/g, (match) => {
        return match;
      });
    return html;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'ml-auto' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-500 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200/50 dark:border-white/5'
          }`}
        >
          <div dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
          {message.savings && (
            <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/5 flex items-center gap-1 text-xs">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span className={isUser ? 'text-white/80' : 'text-brand-600 dark:text-brand-400 font-semibold'}>
                Risparmio potenziale: €{message.savings.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-[10px] text-gray-400">{message.timestamp}</span>
          {!isUser && (
            <div className="flex items-center gap-1">
              <button onClick={() => { const el = document.activeElement; el?.classList.add('text-green-500'); setTimeout(() => el?.classList.remove('text-green-500'), 1000); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-300 hover:text-green-500 transition-colors" title="Utile">
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button onClick={() => { const el = document.activeElement; el?.classList.add('text-red-500'); setTimeout(() => el?.classList.remove('text-red-500'), 1000); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-300 hover:text-red-500 transition-colors" title="Non utile">
                <ThumbsDown className="w-3 h-3" />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(message.content.replace(/\*\*/g, '')); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-300 hover:text-gray-500 transition-colors" title="Copia">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AiAssistant() {
  const [messages, setMessages] = useState(CHAT_HISTORY);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState(AI_SUGGESTIONS);

  useEffect(() => {
    api.getAISuggestions()
      .then(data => { if (data.suggestions?.length) setSuggestions(data.suggestions); })
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await api.chatWithAI(input, conversationId);
      if (result.conversationId) setConversationId(result.conversationId);
      const aiMsg = {
        id: messages.length + 2,
        role: 'assistant',
        content: result.message.content,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        savings: result.message.savings,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const aiMsg = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Mi dispiace, c\'è stato un problema di connessione. Riprova tra qualche istante.',
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-7rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Chat panel */}
        <div className="lg:col-span-8 flex flex-col glass-card overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">AI Savings Assistant</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Online · Analizza i tuoi dati in tempo reale</span>
                </div>
              </div>
            </div>
            <button onClick={() => { setMessages(CHAT_HISTORY); setConversationId(null); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-brand-500 transition-colors" title="Nuova conversazione">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} index={i} />
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-5 py-2 flex gap-2 overflow-x-auto">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInput(prompt.text)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-all border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
              >
                <span>{prompt.icon}</span>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Chiedi all'AI come risparmiare..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="input-field pr-12 text-sm"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl gradient-brand text-white shadow-lg shadow-brand-500/30 hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Side panel - Active suggestions */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Suggerimenti Attivi</h3>
            </div>
            <div className="space-y-3">
              {suggestions.map((sug, i) => (
                <motion.div
                  key={sug.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">{sug.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{sug.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {sug.message.replace(/\*\*/g, '')}
                      </p>
                      {sug.savings > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-1">
                          <ArrowDownRight className="w-3 h-3" />
                          -€{sug.savings.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Stats */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Statistiche AI</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Suggerimenti accettati</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">87%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-brand-500" style={{ width: '87%' }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Risparmio totale da AI</span>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">€342.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Sostituti suggeriti</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Alert prezzi inviati</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
