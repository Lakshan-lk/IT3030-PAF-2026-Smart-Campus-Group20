import React from 'react';
import { motion } from 'framer-motion';
import { MdAssignment, MdCalendarToday, MdChevronRight, MdRoom, MdPerson, MdBuild } from 'react-icons/md';

const statusStyles = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40',
  IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/40',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40',
  CLOSED: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/50',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/40',
};

const priorityStyles = {
  LOW: 'text-slate-600 bg-slate-100 dark:bg-slate-700/60 dark:text-slate-300',
  MEDIUM: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300',
};

function formatDate(value) {
  if (!value) {
    return 'Unknown';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

const TicketCard = ({ ticket, onClick }) => {
  const priorityClass = priorityStyles[ticket.priority] || priorityStyles.LOW;
  const statusClass = statusStyles[ticket.status] || statusStyles.OPEN;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/70 backdrop-blur-sm p-4 shadow-sm shadow-slate-900/5 dark:shadow-black/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            {ticket.equipmentName ? <MdBuild className="text-xs" /> : <MdRoom className="text-xs" />}
            {ticket.category}
          </p>
          <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
            {ticket.equipmentName || ticket.resourceName || 'General ticket'}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${priorityClass}`}>
          {ticket.priority}
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
        {ticket.description}
      </p>

      <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          {ticket.equipmentName ? <MdBuild className="text-base" /> : <MdRoom className="text-base" />}
          <span className="truncate">
            {ticket.equipmentName 
              ? `Equipment: ${ticket.equipmentName}` 
              : (ticket.resourceName || 'No room assigned')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MdPerson className="text-base" />
          <span className="truncate">{ticket.userName || 'Unknown reporter'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdAssignment className="text-base" />
          <span className="truncate">{ticket.assignedToName || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdCalendarToday className="text-base" />
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusClass}`}>
          {ticket.status}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          View details <MdChevronRight className="text-base" />
        </span>
      </div>
    </motion.button>
  );
};

export default TicketCard;
