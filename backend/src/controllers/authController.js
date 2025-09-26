import { createClient } from '@supabase/supabase-js';

// Supabase admin client (for server-side auth checks)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export const authController = {
  async checkEmail(req, res) {
    try {
      if (!supabaseAdmin) {
        // Gracefully degrade when server-side credentials are not configured
        // to avoid noisy 500s in development. Assume the email may exist.
        return res.json({ exists: true });
      }
      
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' });
      }

      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        filter: `email.eq.${email}`
      });
      
      if (error) {
        return res.status(500).json({ error: error.message || 'Failed to check email' });
      }
      
      return res.json({ exists: data?.users && data.users.length > 0 });
    } catch (err) {
      console.error('Auth check email error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  }
};
