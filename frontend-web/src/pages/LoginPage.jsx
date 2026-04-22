import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { authUser, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authUser) return;
    navigate(authUser.role === 'admin' ? '/admin/overview' : '/', { replace: true });
  }, [authUser, navigate]);

  const handleLogin = (e) => {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
            <h1 className="text-3xl font-black text-white">S</h1>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent mb-2">Smart Campus</h2>
          <p className="text-slate-500 font-medium">Operations Hub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8 font-medium">
          Admin: admin / admin. Users: user / user or test123 / test123.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
