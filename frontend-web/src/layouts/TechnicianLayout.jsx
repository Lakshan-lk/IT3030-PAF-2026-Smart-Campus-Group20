import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TechnicianSidebar from '../components/TechnicianSidebar';
import TechnicianNavbar from '../components/TechnicianNavbar';

const TechnicianLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <TechnicianSidebar />
      <div className="flex-1 flex flex-col sm:ml-64">
        <TechnicianNavbar />
        <main className="flex-1 p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default TechnicianLayout;
