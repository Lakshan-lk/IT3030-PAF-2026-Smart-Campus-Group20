import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdSearch, MdCheckCircle, MdCategory } from 'react-icons/md';
import { useAllEquipment } from '../hooks/useEquipment';
import HireModal from '../components/HireModal';
import { resolveMediaUrl } from '../utils/media';

const EquipmentHirePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: equipmentData, isLoading, isError } = useAllEquipment();

  const hiringEquipment = useMemo(() => {
    const list = equipmentData?.content || equipmentData || [];
    return list.filter(item => item.hiringEquipment);
  }, [equipmentData]);

  const uniqueTypes = useMemo(() => {
    const types = new Set();
    hiringEquipment.forEach(item => {
      if (item.hireType) types.add(item.hireType);
    });
    return Array.from(types);
  }, [hiringEquipment]);

  const filteredEquipment = useMemo(() => {
    return hiringEquipment.filter(item => {
      const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !filterType || item.hireType === filterType;
      return matchSearch && matchType;
    });
  }, [hiringEquipment, searchTerm, filterType]);

  const handleHireSuccess = () => {
    setSuccessMessage('Hire request submitted successfully!');
    setSelectedEquipment(null);
    setTimeout(() => { setSuccessMessage(''); }, 3000);
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Equipment Hire</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search equipment..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
           <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
           <select
             value={filterType}
             onChange={e => setFilterType(e.target.value)}
             className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all appearance-none"
           >
             <option value="">All Types</option>
             {uniqueTypes.map(type => (
               <option key={type} value={type}>{type}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">Failed to load equipment.</div>
      ) : filteredEquipment.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No equipment found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map(item => (
            <motion.div key={item.id} whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="h-40 bg-slate-100 dark:bg-slate-700 relative">
                {item.imageUrls?.length > 0 ? (
                  <img src={resolveMediaUrl(item.imageUrls[0])} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-slate-800/90 rounded text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm backdrop-blur-sm">
                  {item.hireType || 'Equipment'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{item.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{item.description || 'No description available'}</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                    {item.status}
                  </span>
                  <button
                    onClick={() => setSelectedEquipment(item)}
                    disabled={item.status !== 'ACTIVE'}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Hire
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedEquipment && (
          <HireModal
            equipment={selectedEquipment}
            onClose={() => setSelectedEquipment(null)}
            onSuccess={handleHireSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl font-medium">
              <MdCheckCircle className="text-xl" />
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquipmentHirePage;
