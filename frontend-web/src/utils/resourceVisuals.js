import {
  MdEventSeat,
  MdScience,
  MdGroups,
  MdBuild,
  MdWidgets,
  MdSchool,
} from 'react-icons/md';

export const RESOURCE_VISUALS = {
  LECTURE_HALL: {
    label: 'Lecture Hall',
    icon: MdSchool,
    accent: 'from-indigo-500 via-violet-500 to-fuchsia-500',
    ring: 'ring-indigo-500/20',
    chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200',
  },
  LAB: {
    label: 'Lab Space',
    icon: MdScience,
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
    ring: 'ring-emerald-500/20',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  },
  MEETING_ROOM: {
    label: 'Meeting Room',
    icon: MdGroups,
    accent: 'from-sky-500 via-blue-500 to-indigo-500',
    ring: 'ring-sky-500/20',
    chip: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',
  },
  SEMINAR_ROOM: {
    label: 'Seminar Room',
    icon: MdEventSeat,
    accent: 'from-amber-500 via-orange-500 to-rose-500',
    ring: 'ring-amber-500/20',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
  },
  WORKSHOP: {
    label: 'Workshop',
    icon: MdBuild,
    accent: 'from-orange-500 via-amber-500 to-yellow-500',
    ring: 'ring-orange-500/20',
    chip: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200',
  },
  EQUIPMENT: {
    label: 'Equipment',
    icon: MdWidgets,
    accent: 'from-slate-500 via-slate-600 to-slate-800',
    ring: 'ring-slate-500/20',
    chip: 'bg-slate-50 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200',
  },
};

export function getResourceVisual(type) {
  return RESOURCE_VISUALS[type] || {
    label: type?.replace(/_/g, ' ') || 'Facility',
    icon: MdEventSeat,
    accent: 'from-indigo-500 via-violet-500 to-fuchsia-500',
    ring: 'ring-indigo-500/20',
    chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200',
  };
}
