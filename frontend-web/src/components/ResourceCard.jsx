import React from 'react';
import { motion } from 'framer-motion';
import { MdLocationOn, MdPeople } from 'react-icons/md';
import { EQUIPMENT_CONFIG } from '../constants/facilities';
import { resolveMediaUrl } from '../utils/media';
import { getResourceVisual } from '../utils/resourceVisuals';

const ResourceCard = ({ resource, onBook }) => {
  const visual = getResourceVisual(resource.type);
  const VisualIcon = visual.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col"
    >
      <div className="h-40 bg-slate-200 dark:bg-slate-700 relative">
        {resource.imageUrl ? (
          <img src={resolveMediaUrl(resource.imageUrl)} alt={resource.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${visual.gradient} flex items-center justify-center relative overflow-hidden`}>
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10"
              animate={{ y: [0, 8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-black/10"
              animate={{ y: [0, -10, 0], scale: [1, 0.95, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative z-10 text-center text-white"
              initial={{ opacity: 0.85, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <motion.div
                className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <VisualIcon className="text-3xl" />
              </motion.div>
              <motion.p className="text-xl font-bold tracking-tight" animate={{ opacity: [0.95, 1, 0.95] }} transition={{ duration: 4.5, repeat: Infinity }}>
                {visual.title}
              </motion.p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/80 mt-1">{visual.subtitle}</p>
            </motion.div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/80 px-2 py-1 rounded-md text-xs font-bold capitalize backdrop-blur-sm">
          {resource.type?.replace(/_/g, ' ').toLowerCase()}
        </div>
        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm
          ${resource.status === 'AVAILABLE' ? 'bg-emerald-100/90 text-emerald-700' : 'bg-amber-100/90 text-amber-700'}`}>
          {resource.status}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{resource.name}</h3>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1.5">
          <MdLocationOn className="flex-shrink-0" />
          <span className="truncate">{resource.location || 'Location not specified'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
          <MdPeople className="flex-shrink-0" />
          <span>Capacity: {resource.capacity || 'N/A'}</span>
        </div>

        {resource.equipments?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {resource.equipments.map(eq => {
              const cfg = EQUIPMENT_CONFIG[eq.type];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <div key={eq.id} title={cfg.label} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${cfg.bg}`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br ${cfg.color}`}>
                    <Icon className="text-white text-[10px]" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300">{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onBook(resource)}
            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm"
          >
            View & Book
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
