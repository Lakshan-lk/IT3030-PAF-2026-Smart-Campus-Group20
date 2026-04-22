import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdCalendarToday, MdAccessTime } from 'react-icons/md';
import { EQUIPMENT_TYPES, EQUIPMENT_CONFIG, TIME_SLOTS, INPUT_CLS } from '../constants/facilities';

const FilterPanel = ({
  filterType, setFilterType,
  filterMinCapacity, setFilterMinCapacity,
  filterEquipment, toggleEquipment,
  filterDate, setFilterDate,
  filterStartTime, setFilterStartTime,
  filterEndTime, setFilterEndTime,
  onClear,
}) => {
  const hasFilters = filterType || filterMinCapacity || filterDate || filterStartTime || filterEndTime || filterEquipment.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">

      {/* row 1: type + capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Room Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={INPUT_CLS}>
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="SEMINAR_ROOM">Seminar Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Min Capacity</label>
          <input
            type="number"
            value={filterMinCapacity}
            onChange={e => setFilterMinCapacity(e.target.value)}
            placeholder="e.g., 10"
            min="1"
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* row 2: equipment */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">Equipment</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {EQUIPMENT_TYPES.map(eq => {
            const cfg = EQUIPMENT_CONFIG[eq];
            const Icon = cfg.icon;
            const active = filterEquipment.includes(eq);
            return (
              <motion.button
                key={eq}
                type="button"
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => toggleEquipment(eq)}
                className={`relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl cursor-pointer select-none overflow-hidden transition-all duration-250
                  ${active
                    ? `${cfg.bg} ring-2 ${cfg.ring} shadow-xl ${cfg.glow}`
                    : 'bg-white/60 dark:bg-slate-700/30 ring-1 ring-slate-200/80 dark:ring-slate-600/50 hover:bg-white dark:hover:bg-slate-700/60 hover:ring-slate-300 dark:hover:ring-slate-500'
                  }`}
              >
                <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${cfg.color} transition-all duration-250
                  ${active ? 'shadow-lg scale-110' : 'opacity-50 scale-100'}`}>
                  <Icon className="text-white text-[22px]" />
                  {active && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl bg-white/20"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-widest uppercase leading-none transition-colors duration-200
                  ${active ? 'text-slate-700 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {cfg.label}
                </span>
                {active && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${cfg.color} shadow-sm`}
                  />
                )}
                {active && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.color} origin-left`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* row 3: date + time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <MdCalendarToday className="inline mr-1 -mt-0.5" />Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setFilterStartTime(''); setFilterEndTime(''); }}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <MdAccessTime className="inline mr-1 -mt-0.5" />Start Time
          </label>
          <select
            value={filterStartTime}
            onChange={e => { const v = e.target.value; setFilterStartTime(v); if (filterEndTime && filterEndTime <= v) setFilterEndTime(''); }}
            disabled={!filterDate}
            className={`${INPUT_CLS} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Select start time</option>
            {TIME_SLOTS.slice(0, -1).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <MdAccessTime className="inline mr-1 -mt-0.5" />End Time
          </label>
          <select
            value={filterEndTime}
            onChange={e => setFilterEndTime(e.target.value)}
            disabled={!filterStartTime}
            className={`${INPUT_CLS} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Select end time</option>
            {TIME_SLOTS.filter(t => !filterStartTime || t.value > filterStartTime).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors mt-3"
          >
            <MdClose className="text-sm" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
