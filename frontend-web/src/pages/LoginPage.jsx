import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { authUser, login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!authUser) return;
    navigate(authUser.role === 'admin' ? '/admin/overview' : '/', { replace: true });
  }, [authUser, navigate]);

  useEffect(() => {
    if (!googleClientId) return;

    const existingScript = document.querySelector('script[data-google-identity="true"]');

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const result = await loginWithGoogle(response.credential);
          if (!result.success) {
            setError(result.message);
            return;
          }

          navigate(result.role === 'admin' ? '/admin/overview' : '/', { replace: true });
        },
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        shape: 'pill',
        text: 'signin_with',
        theme: 'outline',
        size: 'large',
        width: 320,
      });

      setIsGoogleReady(true);
    };

    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogle();
      } else {
        existingScript.addEventListener('load', initializeGoogle, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', initializeGoogle, { once: true });
    document.body.appendChild(script);
  }, [googleClientId, loginWithGoogle, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(username, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(result.role === 'admin' ? '/admin/overview' : '/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_10%,rgba(14,165,233,0.15),transparent_35%),radial-gradient(circle_at_100%_80%,rgba(249,115,22,0.16),transparent_40%),linear-gradient(140deg,#f8fafc,#fff7ed)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur rounded-3xl shadow-[0_28px_80px_-30px_rgba(15,23,42,0.45)] border border-white overflow-hidden grid md:grid-cols-[1.1fr_1fr]"
      >
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300 font-bold mb-6">Smart Campus</p>
            <h2 className="text-4xl font-black leading-tight">One Portal for Campus Operations</h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              Google sign-in creates and syncs campus user accounts automatically, so every login is tied to a real user record.
            </p>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>Google sign-in creates user accounts automatically</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-900">Sign In</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back to Smart Campus. Google sign-in is the recommended path.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold py-3.5 px-6 rounded-xl hover:brightness-110 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or continue with</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {googleClientId ? (
            <div className="flex justify-center min-h-11" ref={googleButtonRef} />
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Google login is enabled in UI but needs VITE_GOOGLE_CLIENT_ID in your frontend environment.
            </p>
          )}

          {googleClientId && !isGoogleReady && (
            <p className="text-xs text-slate-500 mt-2 text-center">Loading Google sign-in...</p>
          )}

          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Use Google to create or reopen a campus account.
          </p>

          <p className="text-center text-xs text-slate-400 mt-6 font-medium md:hidden">
            Google sign-in is the supported login path.
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
