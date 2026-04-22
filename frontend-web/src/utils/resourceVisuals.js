import { MdSchool, MdScience, MdGroups, MdBuild, MdDevicesOther, MdEventSeat } from 'react-icons/md';

const VISUALS = {
  LECTURE_HALL: {
    icon: MdSchool,
    title: 'Lecture Hall',
    subtitle: 'Teaching space',
    gradient: 'from-indigo-600 via-violet-500 to-fuchsia-500',
  },
  LAB: {
    icon: MdScience,
    title: 'Lab',
    subtitle: 'Practical space',
    gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
  },
  MEETING_ROOM: {
    icon: MdGroups,
    title: 'Meeting Room',
    subtitle: 'Collaboration space',
    gradient: 'from-sky-600 via-blue-500 to-indigo-500',
  },
  SEMINAR_ROOM: {
    icon: MdEventSeat,
    title: 'Seminar Room',
    subtitle: 'Presentation space',
    gradient: 'from-amber-600 via-orange-500 to-rose-500',
  },
  WORKSHOP: {
    icon: MdBuild,
    title: 'Workshop',
    subtitle: 'Hands-on space',
    gradient: 'from-orange-700 via-amber-600 to-yellow-500',
  },
  EQUIPMENT: {
    icon: MdDevicesOther,
    title: 'Equipment',
    subtitle: 'Shared asset',
    gradient: 'from-slate-700 via-slate-600 to-slate-500',
  },
};

export function getResourceVisual(resourceType) {
  return VISUALS[resourceType] || {
    icon: MdDevicesOther,
    title: 'Facility',
    subtitle: 'Campus space',
    gradient: 'from-slate-600 via-slate-500 to-slate-400',
  };
}
