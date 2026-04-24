import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdCircle } from 'react-icons/md';
import { TIME_SLOTS } from '../constants/facilities';
import { useBookingForm } from '../hooks/useBookingForm';
import { useAuth } from '../context/AuthContext';
import { useResourceAvailability } from '../hooks/useResourceAvailability';
import { resolveMediaUrl } from '../utils/media';
import ResourceFallbackThumbnail from './ResourceFallbackThumbnail';

// Day-of-week labels
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_STYLE = {
  free: { bg: 'bg-emerald-500', ring: 'ring-emerald-300', label: 'Available' },
  partial: { bg: 'bg-amber-400', ring: 'ring-amber-300', label: 'Partially booked' },
  full: { bg: 'bg-rose-500', ring: 'ring-rose-300', label: 'Fully booked' },
};

const BookingModal = ({ resource, onClose, onSuccess, initialDate, initialStartTime, initialEndTime }) => {
  const isAvailable = resource.status === 'ACTIVE' || resource.status === 'AVAILABLE';
  const imageUrl = resolveMediaUrl(resource.imageUrl);
  const { authUser } = useAuth();
  const {
    bookingData, setBookingData,
    conflictError,
    handleChange,
    isValid,
    submit,
    isPending,
  } = useBookingForm({ onSuccess, initialDate, initialStartTime, initialEndTime, userId: authUser?.id });

  const {
    isLoading: availLoading,
    getBookedRangesForDate,
    isStartSlotBooked,
    isEndSlotConflicting,
    getDayStatus,
    getAvailabilityStrip,
  } = useResourceAvailability(resource?.id);

  const strip = getAvailabilityStrip(14);
  const selectedDayStatus = bookingData.date ? getDayStatus(bookingData.date) : null;
  const bookedRanges = bookingData.date ? getBookedRangesForDate(bookingData.date) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
      >
        {/* header image */}
        <div className="h-40 relative">
          {imageUrl ? (
            <img src={imageUrl} alt={resource.name} className="w-full h-full object-cover" />
          ) : (
            <ResourceFallbackThumbnail type={resource.type} compact />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <MdClose />
          </button>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{resource.name}</h2>
              <p className="text-white/80 text-sm">{resource.location || 'Location not specified'}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {resource.status}
            </span>
          </div>
        </div>

        {/* body */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="flex gap-2 mb-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg text-xs">
              <span className="text-slate-400">Capacity:</span>
              <span className="ml-1 font-semibold">{resource.capacity || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg text-xs">
              <span className="text-slate-400">Type:</span>
              <span className="ml-1 font-semibold capitalize">{resource.type?.replace(/_/g, ' ').toLowerCase()}</span>
            </div>
          </div>

          {/* ── Availability Strip ── */}
          {!availLoading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Availability — Next 14 Days</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Free</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Partial</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Full</span>
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {strip.map(({ date, status, dayObj }) => {
                  const s = STATUS_STYLE[status];
                  const isSelected = bookingData.date === date;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        if (status !== 'full') {
                          setBookingData(prev => ({ ...prev, date, startTime: '', endTime: '' }));
                        }
                      }}
                      disabled={status === 'full'}
                      title={`${date} — ${s.label}`}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-lg border-2 transition-all
                        ${isSelected ? `border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30` : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600'}
                        ${status === 'full' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">{DAY_SHORT[dayObj.getDay()]}</span>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {dayObj.getDate()}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${s.bg}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); submit(resource.id); }} className="space-y-3">
            {/* date + time */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={e => {
                    handleChange(e);
                    setBookingData(prev => ({ ...prev, startTime: '', endTime: '' }));
                  }}
                  className={`w-full px-2 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-400/50
                    ${selectedDayStatus === 'full'
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                      : selectedDayStatus === 'partial'
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900'
                    }`}
                />
                {selectedDayStatus === 'full' && (
                  <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">Fully booked</p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Start</label>
                <select
                  name="startTime"
                  value={bookingData.startTime}
                  onChange={e => setBookingData(prev => ({
                    ...prev,
                    startTime: e.target.value,
                    endTime: prev.endTime && prev.endTime <= e.target.value ? '' : prev.endTime,
                  }))}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                >
                  <option value="">Select</option>
                  {TIME_SLOTS.slice(0, -1).map(t => {
                    const booked = isStartSlotBooked(t.value, bookingData.date);
                    return (
                      <option
                        key={t.value}
                        value={t.value}
                        disabled={booked}
                        style={booked ? { color: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                      >
                        {t.label}{booked ? ' — Taken' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">End</label>
                <select
                  name="endTime"
                  value={bookingData.endTime}
                  onChange={handleChange}
                  disabled={!bookingData.startTime}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none disabled:opacity-50"
                >
                  <option value="">Select</option>
                  {TIME_SLOTS.filter(t => !bookingData.startTime || t.value > bookingData.startTime).map(t => {
                    const conflicts = isEndSlotConflicting(bookingData.startTime, t.value, bookingData.date);
                    return (
                      <option
                        key={t.value}
                        value={t.value}
                        disabled={conflicts}
                        style={conflicts ? { color: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                      >
                        {t.label}{conflicts ? ' — Conflict' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Booked ranges warning for selected date */}
            {bookedRanges.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                  Already booked on this day:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bookedRanges.map((r, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/40 rounded-full text-[11px] font-bold">
                      <MdCircle className="text-[6px]" />
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-500 block mb-1">Purpose</label>
              <textarea name="purpose" value={bookingData.purpose} onChange={handleChange}
                placeholder="Meeting, Lecture…" rows={2}
                className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-400/50" />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Attendees</label>
              <input type="number" name="attendees" value={bookingData.attendees} onChange={handleChange}
                placeholder="1" min="1"
                className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400/50" />
            </div>

            {conflictError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/30 text-sm text-rose-600 dark:text-rose-400">
                {conflictError}
              </div>
            )}

            <button
              type="submit"
              disabled={!isAvailable || isPending || !isValid() || selectedDayStatus === 'full'}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-500 hover:from-indigo-800 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              {isPending ? 'Booking…' : isAvailable ? 'Book this Facility' : 'Currently Unavailable'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
