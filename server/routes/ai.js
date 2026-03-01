import { Router } from 'express';
import db from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { chat, getSuggestions } from '../services/ai.js';

const router = Router();
router.use(authenticate);

// POST /api/ai/chat — send message to AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) return res.status(400).json({ error: 'Messaggio obbligatorio.' });

    const result = await chat(req.user.id, conversationId, message);
    res.json(result);
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Errore nella comunicazione con l\'assistente AI.' });
  }
});

// GET /api/ai/suggestions — get AI-generated suggestions
router.get('/suggestions', (req, res) => {
  try {
    const suggestions = getSuggestions(req.user.id);
    res.json({ suggestions });
  } catch (err) {
    console.error('AI suggestions error:', err);
    res.status(500).json({ error: 'Errore nel recupero dei suggerimenti.' });
  }
});

// GET /api/ai/conversations — list conversations
router.get('/conversations', (req, res) => {
  try {
    const conversations = db.prepare(`
      SELECT ac.*, 
        (SELECT COUNT(*) FROM ai_messages am WHERE am.conversation_id = ac.id) as message_count
      FROM ai_conversations ac
      WHERE ac.user_id = ?
      ORDER BY ac.updated_at DESC
      LIMIT 20
    `).all(req.user.id);

    res.json({ conversations });
  } catch (err) {
    console.error('Conversations error:', err);
    res.status(500).json({ error: 'Errore.' });
  }
});

// GET /api/ai/conversations/:id/messages — get conversation messages
router.get('/conversations/:id/messages', (req, res) => {
  try {
    const conv = db.prepare('SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!conv) return res.status(404).json({ error: 'Conversazione non trovata.' });

    const messages = db.prepare(`
      SELECT id, role, content, savings_amount, created_at
      FROM ai_messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `).all(req.params.id);

    res.json({ conversation: conv, messages });
  } catch (err) {
    console.error('Messages error:', err);
    res.status(500).json({ error: 'Errore.' });
  }
});

export default router;
