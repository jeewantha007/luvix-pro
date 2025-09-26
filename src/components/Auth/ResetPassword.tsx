import React, { useState, useEffect } from 'react';
import { supabase } from '../../../data/supabaseClient';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setNotice('Follow the password reset link from your email to access this page.');
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setNotice('Password updated successfully. You can close this tab.');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 p-4">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${new URL('../../assets/logo-white.png', import.meta.url).href})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
          backgroundPosition: 'center'
        }}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Set new password</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
          {notice && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{notice}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-md bg-green-600 text-white text-sm font-medium py-2 hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


