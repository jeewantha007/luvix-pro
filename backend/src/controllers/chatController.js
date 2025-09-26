import { createClient } from '@supabase/supabase-js';

// Supabase admin client (for server-side auth checks)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export const chatController = {
  async markAsRead(req, res) {
    try {
      const contactId = req.params?.contactId;
      if (!contactId || typeof contactId !== 'string') {
        return res.status(400).json({ error: 'contactId is required' });
      }

      // If server is not configured with Supabase Service Role, return graceful success
      if (!supabaseAdmin) {
        return res.json({ updated: 0, note: 'No server credentials configured; skipped DB update' });
      }

      const TABLE_NAME = 'luvix_hoichat_app';
      const isNumeric = /^\d+$/.test(contactId);
      let error = null;
      
      try {
        if (isNumeric) {
          const q = supabaseAdmin
            .from(TABLE_NAME)
            .update({ luvix_read: true })
            .eq('id', Number(contactId));
          const resUp = await q;
          error = resUp.error;
          if (!error) {
            return res.json({ updated: true, matched: 'numeric' });
          }
        }
      } catch (e) {
        error = e;
      }

      try {
        const q2 = supabaseAdmin
          .from(TABLE_NAME)
          .update({ luvix_read: true })
          .eq('id', contactId);
        const resUp2 = await q2;
        if (resUp2.error) {
          console.error('[Supabase] Update error (text id):', resUp2.error);
          return res.status(500).json({ error: resUp2.error.message || 'Failed to update read status' });
        }
        return res.json({ updated: true, matched: 'text' });
      } catch (e2) {
        console.error('[Supabase] Update exception:', e2);
        return res.status(500).json({ error: 'Failed to update read status (exception)' });
      }
    } catch (err) {
      console.error('Chat mark as read error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  }
};
