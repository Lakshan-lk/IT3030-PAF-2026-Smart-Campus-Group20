const STATUS_META = {
  ACTIVE: {
    label: 'Available',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40',
    dot: 'bg-emerald-400',
    tone: 'emerald',
  },
  UNDER_MAINTENANCE: {
    label: 'Under Maintenance',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40',
    dot: 'bg-amber-400',
    tone: 'amber',
  },
  OUT_OF_SERVICE: {
    label: 'Unavailable',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/40',
    dot: 'bg-rose-400',
    tone: 'rose',
  },
};

const normalizeStatusKey = (value) => {
  if (!value) {
    return 'ACTIVE';
  }

  const raw = String(value).trim().toUpperCase();

  switch (raw) {
    case 'AVAILABLE':
    case 'ACTIVE':
      return 'ACTIVE';
    case 'UNDER_MAINTENANCE':
      return 'UNDER_MAINTENANCE';
    case 'UNAVAILABLE':
    case 'OUT_OF_SERVICE':
      return 'OUT_OF_SERVICE';
    default:
      return raw;
  }
};

export const RESOURCE_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
];

export const EQUIPMENT_STATUS_OPTIONS = RESOURCE_STATUS_OPTIONS;

export const normalizeResourceStatusForApi = (value) => normalizeStatusKey(value);
export const normalizeEquipmentStatusForApi = (value) => normalizeStatusKey(value);

export const normalizeResourceStatusForForm = (value) => {
  const normalized = normalizeStatusKey(value);
  switch (normalized) {
    case 'ACTIVE':
      return 'AVAILABLE';
    case 'OUT_OF_SERVICE':
      return 'UNAVAILABLE';
    default:
      return normalized;
  }
};

export const normalizeEquipmentStatusForForm = (value) => normalizeResourceStatusForForm(value);

export const getCampusStatusMeta = (value) => {
  const normalized = normalizeStatusKey(value);
  return STATUS_META[normalized] || {
    label: String(value || 'Unknown').replace(/_/g, ' '),
    badge: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/40',
    dot: 'bg-slate-400',
    tone: 'slate',
  };
};

export const getCampusStatusLabel = (value) => getCampusStatusMeta(value).label;
export const isCampusStatusAvailable = (value) => normalizeStatusKey(value) === 'ACTIVE';

