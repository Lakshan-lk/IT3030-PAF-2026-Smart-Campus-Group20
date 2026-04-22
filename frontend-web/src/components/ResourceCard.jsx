import React from 'react';
import { motion } from 'framer-motion';
import { MdLocationOn, MdPeople, MdLock } from 'react-icons/md';
import { EQUIPMENT_CONFIG } from '../constants/facilities';

const ResourceCard = ({ resource, onBook, index = 0 }) => {
  const isBooked = resource.bookedForSlot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isBooked ? 0.75 : 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.055, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={!isBooked ? { y: -4, transition: { duration: 0.18 } } : {}}
      className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300
        ${isBooked
          ? 'border-rose-200/70 dark:border-rose-900/40 bg-white dark:bg-slate-800/60'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300/60 dark:hover:border-indigo-600/50 hover:shadow-xl hover:shadow-indigo-500/8'
        }`}
    >
      {/* top status bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] z-10
        ${isBooked ? 'bg-rose-500' : 'bg-emerald-500'}`} />

      {/* image / placeholder */}
      <div className="h-44 relative overflow-hidden flex-shrink-0">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className={`w-full h-full object-cover transition-all duration-500
              ${isBooked ? 'brightness-75 saturate-50' : ''}`}
          />
        ) : (
          <div className={`w-full h-full grid-texture flex items-center justify-center
            ${isBooked
              ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'
              : 'bg-gradient-to-br from-indigo-50 via-violet-50/60 to-slate-100 dark:from-indigo-950/50 dark:via-violet-950/30 dark:to-slate-900'
            }`}>
            <span className={`font-bold text-sm tracking-[0.2em] uppercase
              ${isBooked ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-300 dark:text-indigo-600'}`}>
              {resource.type?.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* booked diagonal overlay */}
        {isBooked && (
          <div className="absolute inset-0 stripe-overlay" />
        )}

        {/* type pill */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {resource.type?.replace(/_/g, ' ').toLowerCase()}
          </span>
        </div>

        {/* status badge */}
        {isBooked ? (
          <div className="absolute top-4 right-3 flex items-center gap-1.5 bg-rose-600 px-2.5 py-1 rounded-lg shadow-lg shadow-rose-600/30">
            <MdLock className="text-white text-xs" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Booked</span>
          </div>
        ) : (
          <div className="absolute top-4 right-3 flex items-center gap-1.5 bg-emerald-500 px-2.5 py-1 rounded-lg shadow-lg shadow-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Available</span>
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-5 flex-1 flex flex-col gap-3.5">
        <div>
          <h3 className={`font-bold text-[16px] leading-snug mb-2
            ${isBooked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
            {resource.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <span className={`flex items-center gap-1 text-xs
              ${isBooked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
              <MdLocationOn className="flex-shrink-0 text-sm" />
              <span className="truncate max-w-[120px]">{resource.location || 'Location TBD'}</span>
            </span>
            <span className={`flex items-center gap-1 text-xs
              ${isBooked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
              <MdPeople className="flex-shrink-0 text-sm" />
              <span>Cap. {resource.capacity ?? 'N/A'}</span>
            </span>
          </div>
        </div>

        {resource.equipments?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.equipments.slice(0, 4).map(eq => {
              const cfg = EQUIPMENT_CONFIG[eq.type];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <div
                  key={eq.id}
                  title={cfg.label}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-opacity
                    ${isBooked ? 'opacity-35' : ''} ${cfg.bg}`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center bg-gradient-to-br ${cfg.color}`}>
                    <Icon className="text-white text-[8px]" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300">{cfg.label}</span>
                </div>
              );
            })}
            {resource.equipments.length > 4 && (
              <div className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                +{resource.equipments.length - 4} more
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          {isBooked ? (
            <div className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2
              bg-rose-50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40
              text-rose-400 dark:text-rose-500/80 text-sm font-semibold cursor-not-allowed select-none">
              <MdLock className="text-base" />
              <span>Already Booked</span>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onBook(resource)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500
                text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30"
            >
              View &amp; Book
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
