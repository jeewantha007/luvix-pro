import React, { useState } from 'react';
import { supabase } from '../../../data/supabaseClient';

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email to reset your password');
      return;
    }
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      // Check server-side if email exists for clearer UX
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const { exists } = checkRes.ok ? await checkRes.json() : { exists: true };
      if (!exists) {
        setError('No account found with that email');
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (resetError) throw resetError;
      setNotice('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (signUpError) throw signUpError;
        setNotice('Check your email to confirm your account.');
      } else {
        // Before login, optionally verify email exists on server to provide nicer error
        try {
          await fetch('/api/auth/check-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        } catch {}
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 p-4">
      {/* LUVIX white logo pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${new URL('../../assets/logo-white.png', import.meta.url).href})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
          backgroundPosition: 'center'
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        {/* Shadcn-like Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center shadow-sm overflow-hidden mb-2">
                <img src={new URL('../../assets/logo.png', import.meta.url).href} alt="LUVIX" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">LUVIX</h1>
          
            </div>

            {/* Professional Heading */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Welcome</h1>
              <p className="text-sm text-gray-600 mt-1">Sign in to continue to LUVIX</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {isLogin && (
                  <div className="text-right">
                    <button type="button" onClick={handleForgotPassword} className="text-xs text-green-700 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              {notice && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Auth;


