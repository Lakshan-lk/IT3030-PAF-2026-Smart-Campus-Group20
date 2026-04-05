import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDashboard, MdEvent } from 'react-icons/md';

const tabs = [
  { path: '/admin/overview', label: 'Overview', icon: <MdDashboard /> },
  { path: '/admin/bookings', label: 'Bookings', icon: <MdEvent /> },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="relative">
      <div className="absolute -top-20 -right-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Admin Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage campus operations and resources</p>
        </div>

        <div className="flex gap-1.5 mb-8 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 w-fit">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`
              }
            >
              {tab.icon}
              {tab.label}
            </NavLink>
          ))}
        </div>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLayout;
