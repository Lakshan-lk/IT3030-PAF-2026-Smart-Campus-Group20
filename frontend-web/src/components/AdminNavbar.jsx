import React from 'react';
import { MdNotifications, MdAccountCircle, MdLightMode, MdDarkMode, MdLogout } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-black/20 sticky top-0 z-10 flex items-center justify-between px-8 border-b border-slate-200/60 dark:border-slate-700/40">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          {theme === 'dark' ? <MdLightMode className="w-5 h-5 text-amber-400" /> : <MdDarkMode className="w-5 h-5 text-slate-500" />}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          <MdNotifications className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </motion.button>
        <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{authUser?.username || 'Admin User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
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

export default AdminNavbar;
