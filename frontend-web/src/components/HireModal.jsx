import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';

const HireModal = ({ equipment, onClose, onSuccess }) => {
  const [date, setDate] = useState('');
  const [days, setDays] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call since no explicit hire endpoint exists yet
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 1000);
  };

  const isValid = date && purpose.trim().length > 0 && days > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hire Equipment</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><MdClose size={24} /></button>
        </div>
        <div className="p-5">
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{equipment.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{equipment.hireType || 'Equipment'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={days}
                  onChange={e => setDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-500 block mb-1 font-medium">Purpose</label>
              <textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                rows={3}
                placeholder="Briefly describe why you need this equipment..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Hire Request'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default HireModal;
