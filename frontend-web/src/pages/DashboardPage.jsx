import React from 'react';
import { motion } from 'framer-motion';
import { MdEvent, MdBuild } from 'react-icons/md';
import { useActiveBookingsCount } from '../hooks/useBookings';

const DashboardPage = () => {
  const { data: activeBookings, isLoading } = useActiveBookingsCount();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between"
        >
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Active Bookings</p>
            <h2 className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : activeBookings ?? 0}
            </h2>
          </div>
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500 dark:text-amber-400">
            <MdEvent className="text-3xl" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between"
        >
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Open Tickets</p>
            <h2 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">0</h2>
          </div>
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <MdBuild className="text-3xl" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
