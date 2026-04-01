import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDashboard, MdEventSeat, MdEvent, MdBuild } from 'react-icons/md';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Facilities & Assets', path: '/facilities', icon: <MdEventSeat /> },
    { name: 'My Bookings', path: '/bookings', icon: <MdEvent /> },
    { name: 'Maintenance Tickets', path: '/tickets', icon: <MdBuild /> },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white shadow-[2px_0_15px_-3px_rgba(0,0,0,0.1)] flex flex-col fixed left-0 top-0 z-20"
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
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
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-500'
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
