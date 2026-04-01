import React from 'react';
import { motion } from 'framer-motion';
import { MdEvent, MdBuild } from 'react-icons/md';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
        >
          <div>
            <p className="text-slate-500 font-medium mb-1 relative z-10">Active Bookings</p>
            <h2 className="text-4xl font-extrabold text-indigo-600">3</h2>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
            <MdEvent className="text-3xl" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
        >
          <div>
            <p className="text-slate-500 font-medium mb-1">Open Tickets</p>
            <h2 className="text-4xl font-extrabold text-emerald-600">1</h2>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
            <MdBuild className="text-3xl" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
