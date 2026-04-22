import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDashboard, MdEvent, MdApartment, MdAdminPanelSettings, MdPersonAdd, MdSchool, MdWork } from 'react-icons/md';

const AdminSidebar = () => {
  const links = [
    { name: 'Overview', path: '/admin/overview', icon: <MdDashboard /> },
    { name: 'Resources', path: '/admin/resources', icon: <MdApartment /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <MdEvent /> },
    { name: 'Create User', path: '/admin/users/create', icon: <MdPersonAdd /> },
    { name: 'Students', path: '/admin/users/students', icon: <MdSchool /> },
    { name: 'Staff', path: '/admin/users/staff', icon: <MdWork /> },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white dark:bg-slate-800 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-black/20 flex flex-col fixed left-0 top-0 z-20"
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/40 gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white dark:text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          Admin Panel
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
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/40">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <span className="text-xl"><MdAdminPanelSettings /></span>
            Back to Campus
          </NavLink>
        </div>
      </nav>
    </motion.aside>
  );
};

export default AdminSidebar;
