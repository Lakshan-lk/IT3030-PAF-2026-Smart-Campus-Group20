import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdCircle } from 'react-icons/md';
import { useCreateEquipmentBooking } from '../hooks/useEquipmentBooking';
import { useAuth } from '../context/AuthContext';
import { useEquipmentAvailability } from '../hooks/useResourceAvailability';
import { TIME_SLOTS } from '../constants/facilities';
import { getCampusStatusMeta, isCampusStatusAvailable } from '../utils/status';

// Day-of-week labels
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_STYLE = {
  free: { bg: 'bg-emerald-500', ring: 'ring-emerald-300', label: 'Available' },
  partial: { bg: 'bg-amber-400', ring: 'ring-amber-300', label: 'Partially booked' },
  full: { bg: 'bg-rose-500', ring: 'ring-rose-300', label: 'Fully booked' },
};

const HireModal = ({ equipment, onClose, onSuccess }) => {
  const [bookingData, setBookingData] = useState({ date: '', startTime: '', endTime: '' });
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const createBooking = useCreateEquipmentBooking();
  const { authUser } = useAuth();
  const statusMeta = getCampusStatusMeta(equipment?.status);
  const isAvailable = isCampusStatusAvailable(equipment?.status);

  const {
    isLoading: availLoading,
    getBookedRangesForDate,
    isStartSlotBooked,
    isEndSlotConflicting,
    getDayStatus,
    getAvailabilityStrip,
  } = useEquipmentAvailability(equipment?.id);

  const strip = getAvailabilityStrip(14);
  const selectedDayStatus = bookingData.date ? getDayStatus(bookingData.date) : null;
  const bookedRanges = bookingData.date ? getBookedRangesForDate(bookingData.date) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}:00`);
    const endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}:00`);

    createBooking.mutate({
      userId: authUser?.id,
      equipmentId: equipment.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      purpose: purpose
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        onSuccess();
      },
      onError: (err) => {
        setIsSubmitting(false);
        let errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit hire request.';
        
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMsg = err.response.data.errors.map(e => e.defaultMessage || e.msg).join(', ');
        }
        
        setSubmitError(errorMsg);
      }
    });
  };

  const isValid = bookingData.date && bookingData.startTime && bookingData.endTime && purpose.trim().length > 0 && bookingData.endTime > bookingData.startTime;

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
        className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hire Equipment</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><MdClose size={24} /></button>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{equipment.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{equipment.hireType || 'Equipment'}</p>
            <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusMeta.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={e => setBookingData(prev => ({ ...prev, date: e.target.value, startTime: '', endTime: '' }))}
                  className={`w-full px-2 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-400/50
                    ${selectedDayStatus === 'full'
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                      : selectedDayStatus === 'partial'
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900'
                    }`}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Start</label>
                <select
                  value={bookingData.startTime}
                  onChange={e => setBookingData(prev => ({
                    ...prev,
                    startTime: e.target.value,
                    endTime: prev.endTime && prev.endTime <= e.target.value ? '' : prev.endTime,
                  }))}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                  required
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
                <label className="text-xs text-slate-500 block mb-1 font-medium">End</label>
                <select
                  value={bookingData.endTime}
                  onChange={e => setBookingData(prev => ({ ...prev, endTime: e.target.value }))}
                  disabled={!bookingData.startTime}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none disabled:opacity-50"
                  required
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
              <label className="text-xs text-slate-500 block mb-1 font-medium">Purpose</label>
              <textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                rows={3}
                placeholder="Briefly describe why you need this equipment..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                required
              />
            </div>
            
            {submitError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/30 text-sm text-rose-600 dark:text-rose-400">
                {submitError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={!isAvailable || !isValid || isSubmitting}
              className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {isSubmitting ? 'Submitting...' : isAvailable ? 'Confirm Hire Request' : 'Currently Unavailable'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default HireModal;
