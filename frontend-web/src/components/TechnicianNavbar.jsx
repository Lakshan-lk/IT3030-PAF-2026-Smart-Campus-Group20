import React from 'react';
import { MdAccountCircle, MdLightMode, MdDarkMode, MdLogout, MdBuild } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const TechnicianNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-black/20 sticky top-0 z-10 flex items-center justify-between px-8 border-b border-slate-200/60 dark:border-slate-700/40">
      <div className="flex items-center gap-2">
        <MdBuild className="text-cyan-600 dark:text-cyan-400 text-lg" />
        <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Technician Portal</span>
      </div>
      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          {theme === 'dark' ? <MdLightMode className="w-5 h-5 text-amber-400" /> : <MdDarkMode className="w-5 h-5 text-slate-500" />}
        </motion.button>
        <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
              {authUser?.name || authUser?.username || 'Technician'}
            </p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">Technician</p>
          </div>
          <MdAccountCircle className="w-9 h-9 text-slate-300 dark:text-slate-500" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <MdLogout className="text-sm" />
          Logout
        </motion.button>
      </div>
    </header>
  );
};

export default TechnicianNavbar;
