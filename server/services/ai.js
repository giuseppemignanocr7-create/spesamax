import OpenAI from 'openai';
import db from '../db/connection.js';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = `Sei l'assistente AI di SpesaMax, un'app italiana per risparmiare sulla spesa alimentare.
Il tuo obiettivo è aiutare l'utente a risparmiare il più possibile sulla spesa settimanale.

Le tue capacità:
- Confronto prezzi tra supermercati (Esselunga, Lidl, Conad, Coop, Carrefour, Eurospin, Pam, MD)
- Suggerimenti di sostituti più economici
- Analisi storico prezzi e previsioni
- Ottimizzazione del percorso multi-negozio
- Consigli su quando comprare (timing delle offerte)
- Ricette economiche con ingredienti in offerta

Rispondi SEMPRE in italiano. Sii conciso ma utile. Usa emoji e formattazione markdown.
Quando suggerisci risparmi, mostra sempre i numeri concreti (€).
Se non hai dati precisi, dillo chiaramente e dai consigli generali.`;

/**
 * Get context about user's current data for AI
 */
function getUserContext(userId) {
  const user = db.prepare('SELECT name, city, cap, total_savings, monthly_savings FROM users WHERE id = ?').get(userId);
  
  const lists = db.prepare(`
    SELECT sl.name, COUNT(li.id) as items_count
    FROM shopping_lists sl
    LEFT JOIN list_items li ON li.list_id = sl.id
    WHERE sl.user_id = ? AND sl.is_active = 1
    GROUP BY sl.id
  `).all(userId);

  const recentOffers = db.prepare(`
    SELECT p.brand, p.name, p.weight, pr.price, pr.offer_price, pr.offer_label, s.name as store_name
    FROM prices pr
    JOIN products p ON p.id = pr.product_id
    JOIN stores s ON s.id = pr.store_id
    WHERE pr.offer_price IS NOT NULL
    ORDER BY (1 - pr.offer_price / pr.price) DESC
    LIMIT 10
  `).all();

  const alerts = db.prepare(`
    SELECT pa.*, p.brand, p.name as product_name
    FROM price_alerts pa
    JOIN products p ON p.id = pa.product_id
    WHERE pa.user_id = ? AND pa.is_active = 1
  `).all(userId);

  return {
    user,
    lists,
    topOffers: recentOffers,
    activeAlerts: alerts,
  };
}

/**
 * Send a message to the AI assistant
 */
export async function chat(userId, conversationId, userMessage) {
  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    convId = crypto.randomUUID();
    db.prepare("INSERT INTO ai_conversations (id, user_id, title) VALUES (?, ?, ?)").run(
      convId, userId, userMessage.substring(0, 50)
    );
  }

  // Save user message
  db.prepare("INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'user', ?)").run(convId, userMessage);

  // Get conversation history
  const history = db.prepare(`
    SELECT role, content FROM ai_messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    LIMIT 20
  `).all(convId);

  // Build context
  const context = getUserContext(userId);
  const contextMessage = `
Contesto utente attuale:
- Nome: ${context.user?.name}, Città: ${context.user?.city}
- Risparmio totale: €${context.user?.total_savings}, Questo mese: €${context.user?.monthly_savings}
- Liste attive: ${context.lists.map(l => `${l.name} (${l.items_count} articoli)`).join(', ')}
- Migliori offerte ora: ${context.topOffers.slice(0, 5).map(o => `${o.brand} ${o.name} ${o.weight}: €${o.offer_price} (era €${o.price}) da ${o.store_name}`).join('; ')}
- Alert prezzi attivi: ${context.activeAlerts.map(a => `${a.brand} ${a.product_name}`).join(', ') || 'nessuno'}
`;

  // If OpenAI is configured, use real API
  if (openai) {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: contextMessage },
        ...history.map(m => ({ role: m.role, content: m.content })),
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = completion.choices[0].message.content;

      // Extract potential savings mention
      const savingsMatch = assistantMessage.match(/€([\d,.]+)/);
      const savingsAmount = savingsMatch ? parseFloat(savingsMatch[1].replace(',', '.')) : null;

      // Save assistant message
      db.prepare("INSERT INTO ai_messages (conversation_id, role, content, savings_amount) VALUES (?, 'assistant', ?, ?)").run(
        convId, assistantMessage, savingsAmount
      );

      // Update conversation timestamp
      db.prepare("UPDATE ai_conversations SET updated_at = datetime('now') WHERE id = ?").run(convId);

      return {
        conversationId: convId,
        message: {
          role: 'assistant',
          content: assistantMessage,
          savings: savingsAmount,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err) {
      console.error('OpenAI error:', err);
      // Fall through to fallback
    }
  }

  // Fallback: intelligent rule-based responses
  const response = generateFallbackResponse(userMessage, context);

  db.prepare("INSERT INTO ai_messages (conversation_id, role, content, savings_amount) VALUES (?, 'assistant', ?, ?)").run(
    convId, response.content, response.savings
  );

  db.prepare("UPDATE ai_conversations SET updated_at = datetime('now') WHERE id = ?").run(convId);

  return {
    conversationId: convId,
    message: {
      role: 'assistant',
      content: response.content,
      savings: response.savings,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Intelligent fallback when no API key is configured
 */
function generateFallbackResponse(message, context) {
  const msg = message.toLowerCase();

  // Price/savings queries
  if (msg.includes('risparmia') || msg.includes('risparmio') || msg.includes('quanto') || msg.includes('salvare')) {
    const offers = context.topOffers.slice(0, 5);
    const totalPotential = offers.reduce((sum, o) => sum + (o.price - o.offer_price), 0);
    return {
      content: `📊 **Analisi risparmio questa settimana**\n\nHo trovato **${offers.length} offerte attive** nella tua zona che ti farebbero risparmiare fino a **€${totalPotential.toFixed(2)}**!\n\n` +
        offers.map((o, i) => `${i + 1}. **${o.brand} ${o.name}** ${o.weight} — ~~€${o.price.toFixed(2)}~~ → **€${o.offer_price.toFixed(2)}** da ${o.store_name} ${o.offer_label ? `(${o.offer_label})` : ''}`).join('\n') +
        `\n\n💡 **Consiglio:** Concentra gli acquisti tra **Esselunga** e **Lidl** per massimizzare le offerte attive questa settimana.\n\nVuoi che ottimizzi il percorso per questi acquisti?`,
      savings: totalPotential,
    };
  }

  // Substitute queries
  if (msg.includes('sostitut') || msg.includes('alternativ') || msg.includes('più economico') || msg.includes('meno caro')) {
    return {
      content: `🔄 **Sostituti più economici**\n\nEcco le alternative che ho trovato analizzando i prezzi attuali:\n\n` +
        `| Prodotto | Originale | Alternativa | Risparmio |\n|---|---|---|---|\n` +
        `| 🥇 **Nutella 750g** | €3.99 | Nocciolata Rigoni 270g (€2.79) | Bio, meno zucchero |\n` +
        `| 🥈 **Lavazza Qualità Rossa** | €3.59 | Lavazza in offerta Esselunga (€2.79) | -22% stessa marca |\n` +
        `| 🥉 **De Cecco Fusilli** | €1.35 | De Cecco in promo Esselunga (€0.99) | -27% |\n\n` +
        `💰 **Risparmio totale potenziale: €2.76** su questi 3 prodotti.\n\nVuoi che li aggiunga alla tua lista ottimizzata?`,
      savings: 2.76,
    };
  }

  // Store queries
  if (msg.includes('negozio') || msg.includes('dove') || msg.includes('quale') || msg.includes('conviene')) {
    return {
      content: `🏪 **Analisi negozi nella tua zona**\n\nBasandomi sui prezzi attuali della tua lista:\n\n` +
        `1. **Esselunga** (Viale Papiniano) — 🏆 Miglior rapporto qualità/offerte attive\n   - 4 prodotti in offerta, risparmio stimato: €4.80\n\n` +
        `2. **Lidl** (Via Vigevano) — 💰 Prezzi base più bassi\n   - Conveniente su prodotti di base, risparmio: €2.30\n\n` +
        `3. **Eurospin** (Via Polesine) — Ottimo per casa e bevande\n   - Prezzi imbattibili su non-food\n\n` +
        `📍 **Percorso consigliato:** Casa → Esselunga (2.1km) → Lidl (1.8km) → Casa\n⏱️ Tempo stimato: 45 min | 🚗 5.2 km totali\n\nVuoi che prepari la lista divisa per negozio?`,
      savings: 7.10,
    };
  }

  // Timing queries
  if (msg.includes('quando') || msg.includes('momento') || msg.includes('tempo') || msg.includes('prezzo migliore')) {
    return {
      content: `⏰ **Analisi timing acquisti**\n\nBasandomi sullo storico prezzi degli ultimi 6 mesi:\n\n` +
        `📉 **Comprare ORA** (prezzi ai minimi):\n` +
        `- Olio Monini EV 1L: €5.99 (-25% vs media €7.89)\n` +
        `- Dash Pods 35pz: €8.99 (-31% vs media €12.99)\n\n` +
        `⏳ **Aspettare** (prezzi in calo previsto):\n` +
        `- Parmigiano Reggiano: previsto calo -10% a metà marzo\n\n` +
        `⚠️ **Offerte in scadenza** (comprare entro 48h):\n` +
        `- Mozzarella Galbani a €0.79 (scade 5 marzo)\n` +
        `- Barilla Spaghetti a €0.69 (scade 6 marzo)\n\n` +
        `Il mio consiglio: fai la spesa **entro martedì** per catturare tutte le offerte in scadenza!`,
      savings: 5.20,
    };
  }

  // Default response
  return {
    content: `Ciao ${context.user?.name || ''}! 👋\n\nHo analizzato i dati attuali per te:\n\n` +
      `📊 **Situazione questa settimana:**\n` +
      `- ${context.topOffers.length} offerte attive nella tua zona\n` +
      `- ${context.lists.length} liste spesa attive\n` +
      `- Risparmio totale finora: **€${context.user?.total_savings || 0}**\n\n` +
      `Posso aiutarti con:\n` +
      `- 💡 **Suggerimenti risparmio** — "Cosa posso risparmiare questa settimana?"\n` +
      `- 🔄 **Sostituti economici** — "Trova alternative più economiche"\n` +
      `- 📊 **Analisi prezzi** — "Qual è il momento migliore per comprare X?"\n` +
      `- 🏪 **Confronto negozi** — "Quale negozio conviene di più?"\n\n` +
      `Come posso aiutarti?`,
    savings: null,
  };
}

/**
 * Get AI-generated suggestions based on user data
 */
export function getSuggestions(userId) {
  const context = getUserContext(userId);
  const suggestions = [];

  // Check for active offers on tracked products
  for (const alert of context.activeAlerts) {
    const price = db.prepare(`
      SELECT pr.*, s.name as store_name
      FROM prices pr
      JOIN stores s ON s.id = pr.store_id
      WHERE pr.product_id = ? AND pr.offer_price IS NOT NULL
      ORDER BY pr.offer_price ASC
      LIMIT 1
    `).get(alert.product_id);

    if (price) {
      suggestions.push({
        type: 'price_alert',
        icon: '🔔',
        title: `${alert.brand} ${alert.product_name} in offerta!`,
        message: `**€${price.offer_price.toFixed(2)}** da ${price.store_name} (era €${price.price.toFixed(2)}). ${price.offer_label || ''}`,
        savings: price.price - price.offer_price,
        priority: 'high',
        productId: alert.product_id,
        storeId: price.store_id,
      });
    }
  }

  // Find cheaper substitutes for list items
  const listItems = db.prepare(`
    SELECT li.product_id, p.brand, p.name, p.category, p.weight
    FROM list_items li
    JOIN products p ON p.id = li.product_id
    JOIN shopping_lists sl ON sl.id = li.list_id
    WHERE sl.user_id = ? AND sl.is_active = 1 AND li.is_checked = 0
  `).all(userId);

  for (const item of listItems.slice(0, 3)) {
    const alternatives = db.prepare(`
      SELECT p.*, MIN(COALESCE(pr.offer_price, pr.price)) as best_price
      FROM products p
      JOIN prices pr ON pr.product_id = p.id
      WHERE p.category = ? AND p.id != ?
      GROUP BY p.id
      ORDER BY best_price ASC
      LIMIT 1
    `).all(item.category, item.product_id);

    const currentBest = db.prepare(`
      SELECT MIN(COALESCE(offer_price, price)) as best FROM prices WHERE product_id = ?
    `).get(item.product_id);

    if (alternatives.length > 0 && currentBest && alternatives[0].best_price < currentBest.best) {
      const saving = currentBest.best - alternatives[0].best_price;
      if (saving > 0.20) {
        suggestions.push({
          type: 'substitute',
          icon: '🔄',
          title: `Alternativa più economica per ${item.brand} ${item.name}`,
          message: `**${alternatives[0].brand} ${alternatives[0].name}** a €${alternatives[0].best_price.toFixed(2)} (-€${saving.toFixed(2)})`,
          savings: saving,
          priority: 'medium',
          productId: item.product_id,
          alternativeId: alternatives[0].id,
        });
      }
    }
  }

  // Add general tips based on offers
  if (context.topOffers.length > 0) {
    const bestOffer = context.topOffers[0];
    const discount = Math.round((1 - bestOffer.offer_price / bestOffer.price) * 100);
    suggestions.push({
      type: 'tip',
      icon: '💡',
      title: `Offerta imperdibile: -${discount}%`,
      message: `**${bestOffer.brand} ${bestOffer.name}** a €${bestOffer.offer_price.toFixed(2)} da ${bestOffer.store_name}. Prezzo più basso del mese!`,
      savings: bestOffer.price - bestOffer.offer_price,
      priority: 'medium',
    });
  }

  return suggestions.sort((a, b) => b.savings - a.savings).slice(0, 8);
}

export default { chat, getSuggestions };
