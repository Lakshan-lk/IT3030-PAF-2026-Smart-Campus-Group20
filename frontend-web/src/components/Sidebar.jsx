import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDashboard, MdEventSeat, MdEvent, MdBuild, MdSell } from 'react-icons/md';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Facilities & Assets', path: '/facilities', icon: <MdEventSeat /> },
    { name: 'Hire Equipment', path: '/hire-equipment', icon: <MdBuild /> },
    { name: 'My Bookings', path: '/bookings', icon: <MdEvent /> },
    { name: 'Equipment Hire', path: '/equipment-hire', icon: <MdSell /> },
    { name: 'Maintenance Tickets', path: '/tickets', icon: <MdBuild /> },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white dark:bg-slate-800 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-black/20 flex flex-col fixed left-0 top-0 z-20"
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
          Smart Campus
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
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-500 dark:hover:text-amber-400'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
