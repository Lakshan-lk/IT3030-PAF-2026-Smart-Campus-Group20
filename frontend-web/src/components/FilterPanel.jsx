import React from 'react';
import { MdClose, MdCalendarToday, MdAccessTime } from 'react-icons/md';
import { TIME_SLOTS, INPUT_CLS, EQUIPMENT_TYPES, EQUIPMENT_CONFIG } from '../constants/facilities';

const FilterPanel = ({
  filterType, setFilterType,
  filterMinCapacity, setFilterMinCapacity,
  filterEquipmentTypes, setFilterEquipmentTypes,
  filterDate, setFilterDate,
  filterStartTime, setFilterStartTime,
  filterEndTime, setFilterEndTime,
  onClear,
}) => {
  const hasFilters =
    filterType ||
    filterMinCapacity ||
    filterEquipmentTypes.length ||
    filterDate ||
    filterStartTime ||
    filterEndTime;

  const toggleEquipment = (type) => {
    setFilterEquipmentTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

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

      {/* ================= EQUIPMENT (UPGRADED UI ONLY) ================= */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Equipment
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {EQUIPMENT_TYPES.map((type) => {
            const cfg = EQUIPMENT_CONFIG[type];
            const selected = filterEquipmentTypes.includes(type);
            const Icon = cfg.icon;

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleEquipment(type)}
                className={`
                  relative group flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl
                  transition-all duration-300 overflow-hidden border
                  ${selected
                    ? `border-transparent shadow-2xl scale-[1.05] ${cfg.bg} ring-2 ${cfg.ring}`
                    : 'border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/40 hover:shadow-md hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-500'
                  }
                `}
              >
                {/* animated glow background */}
                <div
                  className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl
                    ${cfg.color}
                  `}
                />

                {/* selected pulse glow */}
                {selected && (
                  <div className={`absolute inset-0 opacity-30 animate-pulse bg-gradient-to-br ${cfg.color}`} />
                )}

                {/* icon container */}
                <div
                  className={`
                    relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cfg.color}
                    shadow-lg transition-transform duration-300
                    ${selected ? 'scale-110' : 'group-hover:scale-105'}
                  `}
                >
                  <Icon className="text-white text-base" />
                </div>

                {/* label */}
                <span
                  className={`
                    relative text-[11px] font-semibold tracking-wide transition-colors duration-200
                    ${selected
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white'
                    }
                  `}
                >
                  {cfg.label}
                </span>

                {/* active dot */}
                {selected && (
                  <span
                    className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br ${cfg.color} shadow-md`}
                  />
                )}

                {/* bottom glow line */}
                {selected && (
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${cfg.color}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* row 2: date + time */}
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