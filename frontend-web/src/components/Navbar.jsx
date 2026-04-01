import React from 'react';
import { MdNotifications, MdAccountCircle } from 'react-icons/md';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] sticky top-0 z-10 flex items-center justify-between px-8 border-b border-white/20">
      <div className="flex-1"></div>
      <div className="flex items-center gap-6 text-slate-500">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <MdNotifications className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        </motion.button>
        <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-slate-50 transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">Alex Johnson</p>
            <p className="text-xs text-slate-500">Student</p>
          </div>
          <MdAccountCircle className="w-9 h-9 text-slate-300" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
