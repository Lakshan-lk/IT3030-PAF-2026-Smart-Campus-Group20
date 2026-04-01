import React from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdFilterList } from 'react-icons/md';

const FacilitiesPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Facilities & Assets</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8 flex gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-3 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Search for lecture halls, labs..." 
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors font-medium">
          <MdFilterList /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <motion.div 
            key={item}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer"
          >
            <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-100 relative">
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700">
                Lecture Hall
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-800 mb-1">Main Hall A</h3>
              <p className="text-sm text-slate-500 mb-4">Capacity: 200 • Has Projector</p>
              <button className="w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                View Availability
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FacilitiesPage;
