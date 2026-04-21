import React from 'react';
import { motion } from 'framer-motion';
import { MdEvent, MdAccessTime, MdPeople, MdCancel, MdInfo, MdRepeat } from 'react-icons/md';

const statusColors = {
  PENDING: { 
    bg: 'bg-amber-50 dark:bg-amber-900/20', 
    text: 'text-amber-700 dark:text-amber-300', 
    border: 'border-amber-200 dark:border-amber-800/40', 
    dot: 'bg-amber-400' 
  },
  APPROVED: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    text: 'text-emerald-700 dark:text-emerald-300', 
    border: 'border-emerald-200 dark:border-emerald-800/40', 
    dot: 'bg-emerald-400' 
  },
  REJECTED: { 
    bg: 'bg-rose-50 dark:bg-rose-900/20', 
    text: 'text-rose-700 dark:text-rose-300', 
    border: 'border-rose-200 dark:border-rose-800/40', 
    dot: 'bg-rose-400' 
  },
  CANCELLED: { 
    bg: 'bg-slate-50 dark:bg-slate-800/50', 
    text: 'text-slate-500 dark:text-slate-400', 
    border: 'border-slate-200 dark:border-slate-600/50', 
    dot: 'bg-slate-400' 
  },
};

const BookingCard = ({ booking, onCancel, onCancelSeries, isAdmin = false }) => {
  const colors = statusColors[booking.status] || statusColors.PENDING;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const startTime = new Date(booking.startTime);
  const isFuture = startTime > new Date();
  const canCancel = (booking.status === 'PENDING' || booking.status === 'APPROVED') && isFuture;

  const handleCancel = () => {
    if (onCancel) {
      onCancel(booking.id);
    }
  };

  const handleCancelSeries = () => {
    if (onCancelSeries && booking.recurrenceGroupId) {
      onCancelSeries(booking.recurrenceGroupId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/40 p-5 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate">
            {booking.resourceName}
          </h3>
          {isAdmin && booking.userName && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Booked by {booking.userName}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-bold flex-shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {booking.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <MdEvent className="text-lg text-slate-400" />
          <span>{formatDate(booking.startTime)}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <MdAccessTime className="text-lg text-slate-400" />
          <span>
            {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
          </span>
        </div>

        {booking.attendees > 0 && (
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <MdPeople className="text-lg text-slate-400" />
            <span>{booking.attendees} attendee{booking.attendees !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="text-sm text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-100 dark:border-slate-700/40">
          {booking.purpose}
        </div>

        {booking.isRecurring && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <MdRepeat className="text-lg" />
            <span>Recurring booking</span>
          </div>
        )}

        {booking.status === 'REJECTED' && booking.rejectionReason && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl">
            <MdInfo className="text-rose-500 text-lg mt-0.5 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-300">{booking.rejectionReason}</p>
          </div>
        )}
      </div>

      {canCancel && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/40 flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <MdCancel className="text-lg" />
            Cancel
          </button>
          
          {booking.isRecurring && booking.recurrenceGroupId && (
            <button
              onClick={handleCancelSeries}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 font-medium text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <MdRepeat className="text-lg" />
              Cancel All
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BookingCard;