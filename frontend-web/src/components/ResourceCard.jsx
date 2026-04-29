import React from 'react';
import { motion } from 'framer-motion';
import { MdLocationOn, MdPeople } from 'react-icons/md';
import { EQUIPMENT_CONFIG } from '../constants/facilities';
import { resolveMediaUrl } from '../utils/media';
import ResourceFallbackThumbnail from './ResourceFallbackThumbnail';

const ResourceCard = ({ resource, onBook }) => {
  const equipmentList = resource.equipment || resource.equipments || [];
  const imageUrl = resolveMediaUrl(resource.imageUrl);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col"
    >
      <div className="h-40 bg-slate-200 dark:bg-slate-700 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={resource.name} className="w-full h-full object-cover" />
        ) : (
          <ResourceFallbackThumbnail type={resource.type} />
        )}
        <div className="absolute top-3 left-3">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white/90 dark:bg-slate-900/80 px-2 py-1 rounded-md text-xs font-bold capitalize backdrop-blur-sm"
          >
            {resource.type?.replace(/_/g, ' ').toLowerCase()}
          </motion.div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm
            ${resource.status === 'ACTIVE' ? 'bg-emerald-100/90 text-emerald-700' : 'bg-slate-200/90 text-slate-700'}`}
        >
          {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
        </motion.div>
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

        {equipmentList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {equipmentList.map(eq => {
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
