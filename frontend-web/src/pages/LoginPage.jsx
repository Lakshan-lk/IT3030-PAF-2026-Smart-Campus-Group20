import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowForward, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { canAccessPath, getHomeRouteForRole } from '../utils/auth';
import loginImage from '../assets/Login_Image.png';
import backgroundImage from '../assets/background.png';

function getPostLoginRoute(role, requestedPath) {
  return canAccessPath(role, requestedPath) ? requestedPath : getHomeRouteForRole(role);
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const requestedPath = location.state?.from?.pathname;

  useEffect(() => {
    if (!authUser) return;
    navigate(getPostLoginRoute(authUser.role, requestedPath), { replace: true });
  }, [authUser, navigate, requestedPath]);

  useEffect(() => {
    if (!googleClientId) return;

    const existingScript = document.querySelector('script[data-google-identity="true"]');

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      if (window.google.accounts.id._isInitialized) return; // Prevent multiple initializations

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setError('');
          setIsGoogleSubmitting(true);
          const result = await loginWithGoogle(response.credential);
          setIsGoogleSubmitting(false);

          if (!result.success) {
            setError(result.message);
            return;
          }

          navigate(getPostLoginRoute(result.role, requestedPath), { replace: true });
        },
      });

      // Mark as initialized to prevent the [GSI_LOGGER] multiple initialization warning
      window.google.accounts.id._isInitialized = true;

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
  }, [googleClientId, loginWithGoogle, navigate, requestedPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(getPostLoginRoute(result.role, requestedPath), { replace: true });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur rounded-3xl shadow-[0_28px_80px_-30px_rgba(15,23,42,0.45)] border border-white overflow-hidden grid md:grid-cols-[1.1fr_1fr]"
      >
        <div className="relative hidden min-h-[640px] md:block">
          <img
            src={loginImage}
            alt="Campus Portal"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/82 via-slate-900/66 to-slate-800/48" />
          <div className="relative flex h-full flex-col justify-end p-10 text-white">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300 font-bold">Smart Campus</p>
              <h2 className="text-4xl font-black leading-tight">Campus Portal</h2>
              <p className="max-w-md text-sm leading-relaxed text-slate-200">
                Sign in to access campus services, bookings, support requests, and administration tools.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-900">Sign In</h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to continue to the portal.
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold py-3.5 px-6 rounded-xl hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting ? <MdArrowForward className="text-lg" /> : null}
            </span>
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

          {isGoogleSubmitting ? (
            <p className="text-xs text-slate-500 mt-2 text-center">Completing Google sign-in...</p>
          ) : null}

          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            If you cannot access your account, please contact the system administrator.
          </p>

          <p className="text-center text-xs text-slate-400 mt-6 font-medium md:hidden">
            Campus Portal
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
