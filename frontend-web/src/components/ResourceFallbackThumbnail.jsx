import React from 'react';
import { motion } from 'framer-motion';
import { getResourceVisual } from '../utils/resourceVisuals';

const ResourceFallbackThumbnail = ({ type, compact = false }) => {
  const visual = getResourceVisual(type);
  const Icon = visual.icon;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${visual.accent}`}>
      <motion.div
        animate={{ x: [0, 12, 0], y: [0, -8, 0], opacity: [0.28, 0.42, 0.28] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl"
      />
      <motion.div
        animate={{ x: [0, -10, 0], y: [0, 10, 0], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-black/15 blur-2xl"
      />

      <div className="absolute inset-0 bg-black/10" />

      <div className={`relative z-10 flex h-full flex-col items-center justify-center text-white ${compact ? 'px-3' : 'px-4'}`}>
        <motion.div
          initial={{ scale: 0.92, rotate: -4 }}
          animate={{ scale: [0.92, 1, 0.96], rotate: [-4, 0, 4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`mb-3 flex items-center justify-center rounded-2xl border border-white/20 bg-white/18 shadow-2xl backdrop-blur-md ${compact ? 'h-14 w-14' : 'h-16 w-16'}`}
        >
          <Icon className={compact ? 'text-3xl' : 'text-4xl'} />
        </motion.div>

        <motion.span
          animate={{ y: [0, -2, 0], opacity: [0.82, 1, 0.82] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {visual.label}
        </motion.span>
      </div>
    </div>
  );
};

export default ResourceFallbackThumbnail;
