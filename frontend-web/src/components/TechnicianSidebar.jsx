import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdBuild, MdLogout } from 'react-icons/md';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TechnicianSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: 'My Tickets', path: '/technician/tickets', icon: <MdBuild /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white dark:bg-slate-800 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-black/20 flex flex-col fixed left-0 top-0 z-20"
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/40 gap-3">
        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-700 to-teal-600 dark:from-cyan-300 dark:to-teal-400 bg-clip-text text-transparent">
          Technician
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-cyan-700 dark:bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-slate-500 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <span className="text-xl"><MdLogout /></span>
            Sign out
          </button>
        </div>
      </nav>
    </motion.aside>
  );
};

export default TechnicianSidebar;
