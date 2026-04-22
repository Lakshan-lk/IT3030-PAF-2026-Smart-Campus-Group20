import {
  MdTv, MdBorderAll, MdAcUnit, MdMic, MdComputer, MdVideocam,
} from 'react-icons/md';

export const EQUIPMENT_TYPES = ['PROJECTOR', 'WHITEBOARD', 'AC', 'MICROPHONE', 'PC', 'CAMERA'];

export const EQUIPMENT_CONFIG = {
  PROJECTOR:  { icon: MdTv,        label: 'Projector',  color: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-500/30',  bg: 'bg-violet-50 dark:bg-violet-900/20',   ring: 'ring-violet-400' },
  WHITEBOARD: { icon: MdBorderAll,  label: 'Whiteboard', color: 'from-sky-400 to-blue-600',        glow: 'shadow-sky-500/30',     bg: 'bg-sky-50 dark:bg-sky-900/20',         ring: 'ring-sky-400'    },
  AC:         { icon: MdAcUnit,     label: 'A/C',        color: 'from-teal-400 to-cyan-500',       glow: 'shadow-teal-500/30',    bg: 'bg-teal-50 dark:bg-teal-900/20',       ring: 'ring-teal-400'   },
  MICROPHONE: { icon: MdMic,        label: 'Mic',        color: 'from-rose-500 to-pink-600',       glow: 'shadow-rose-500/30',    bg: 'bg-rose-50 dark:bg-rose-900/20',       ring: 'ring-rose-400'   },
  PC:         { icon: MdComputer,   label: 'PC',         color: 'from-amber-500 to-orange-500',    glow: 'shadow-amber-500/30',   bg: 'bg-amber-50 dark:bg-amber-900/20',     ring: 'ring-amber-400'  },
  CAMERA:     { icon: MdVideocam,   label: 'Camera',     color: 'from-emerald-500 to-green-600',   glow: 'shadow-emerald-500/30', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-400' },
};

export const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label, value };
});

export const INPUT_CLS = `w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm
  focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none transition-all`;
