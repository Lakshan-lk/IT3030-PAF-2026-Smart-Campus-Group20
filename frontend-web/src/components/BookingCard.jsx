import React from 'react';
import { motion } from 'framer-motion';
import { MdEvent, MdAccessTime, MdPeople, MdCancel, MdRepeat } from 'react-icons/md';

const statusColors = {
  PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-400' },
  APPROVED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', dot: 'bg-emerald-400' },
  REJECTED: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40', dot: 'bg-rose-400' },
  CANCELLED: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600/50', dot: 'bg-slate-400' },
};

const BookingCard = ({ booking, onCancel, onCancelSeries, isAdminView = false }) => {
  const colors = statusColors[booking.status] || statusColors.PENDING;
  
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const isPast = endDate < new Date();
  const isFuture = startDate > new Date();
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleCancel = () => {
    if (booking.isRecurring && booking.recurrenceGroupId) {
      if (confirm('This is a recurring booking. Cancel all occurrences?')) {
        onCancelSeries?.(booking.recurrenceGroupId);
      }
    } else {
      onCancel?.(booking.id);
    }
  };

  const showCancelButton = (booking.status === 'PENDING' || booking.status === 'APPROVED') && 
    (isFuture || !isPast);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/40 hover:border-amber-200 dark:hover:border-amber-800/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate">
              {booking.resourceName}
            </h3>
            {booking.isRecurring && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-200 dark:border-indigo-800/40">
                <MdRepeat className="text-xs" />
                WEEKLY
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
            {booking.purpose}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MdEvent className="text-lg text-amber-500" />
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MdAccessTime className="text-lg text-amber-500" />
              <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
            </div>
            {booking.attendees && (
              <div className="flex items-center gap-1.5">
                <MdPeople className="text-lg text-amber-500" />
                <span>{booking.attendees} attendees</span>
              </div>
            )}
          </div>
          
          {isAdminView && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              by {booking.userName}
            </p>
          )}
          
          {booking.status === 'REJECTED' && booking.rejectionReason && (
            <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 rounded-xl">
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Rejection reason:
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                {booking.rejectionReason}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-bold`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {booking.status}
          </span>
          
          {showCancelButton && onCancel && (
            <button
              onClick={handleCancel}
              className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-slate-200 dark:border-slate-600/50 hover:border-rose-200 dark:hover:border-rose-800/40"
            >
              <MdCancel className="text-base" />
              {booking.isRecurring ? 'Cancel all' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookingCard;