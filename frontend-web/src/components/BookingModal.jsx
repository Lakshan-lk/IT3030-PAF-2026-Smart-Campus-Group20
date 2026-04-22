import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdEventAvailable, MdVideocam, MdMic, MdComputer, MdAcUnit, MdBorderColor, MdCast, MdDevicesOther } from 'react-icons/md';
import { TIME_SLOTS } from '../constants/facilities';
import { useBookingForm } from '../hooks/useBookingForm';
import { useAvailableEquipment } from '../hooks/useEquipment';

const EQUIPMENT_ICONS = {
  PROJECTOR: MdCast,
  WHITEBOARD: MdBorderColor,
  AC: MdAcUnit,
  MICROPHONE: MdMic,
  PC: MdComputer,
  CAMERA: MdVideocam,
};

const BookingModal = ({ resource, onClose, onSuccess, initialDate, initialStartTime, initialEndTime }) => {
  const {
    bookingData, setBookingData,
    skipDateInput, setSkipDateInput,
    conflictError,
    addSkipDate, removeSkipDate,
    toggleEquipment,
    handleChange,
    isValid,
    submit,
    isPending,
  } = useBookingForm({ onSuccess, initialDate, initialStartTime, initialEndTime });

  const { data: availableEquipment = [], isLoading: equipmentLoading } = useAvailableEquipment(resource?.id);

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
          {resource.imageUrl ? (
            <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-violet-500 flex items-center justify-center">
              <MdEventAvailable className="text-white/40 text-6xl" />
            </div>
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
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${resource.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
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

          <form onSubmit={e => { e.preventDefault(); submit(resource.id); }} className="space-y-3">
            {/* date + time */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Date</label>
                <input type="date" name="date" value={bookingData.date} onChange={handleChange}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400/50" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Start</label>
                <select name="startTime" value={bookingData.startTime}
                  onChange={e => setBookingData(prev => ({ ...prev, startTime: e.target.value, endTime: prev.endTime && prev.endTime <= e.target.value ? '' : prev.endTime }))}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                  <option value="">Select</option>
                  {TIME_SLOTS.slice(0, -1).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">End</label>
                <select name="endTime" value={bookingData.endTime} onChange={handleChange}
                  disabled={!bookingData.startTime}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none disabled:opacity-50">
                  <option value="">Select</option>
                  {TIME_SLOTS.filter(t => !bookingData.startTime || t.value > bookingData.startTime).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

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

            {/* recurring */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isRecurring" checked={bookingData.isRecurring} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${bookingData.isRecurring ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {bookingData.isRecurring && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Make this a recurring booking</span>
              </label>

              {bookingData.isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/40 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Repeat</label>
                      <select name="recurrencePattern" value={bookingData.recurrencePattern} onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none">
                        <option value="WEEKLY">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Until</label>
                      <input type="date" name="recurrenceEndDate" value={bookingData.recurrenceEndDate} onChange={handleChange}
                        min={bookingData.date}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Skip Specific Dates (optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={skipDateInput}
                        onChange={e => setSkipDateInput(e.target.value)}
                        min={bookingData.date}
                        max={bookingData.recurrenceEndDate}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={addSkipDate}
                        disabled={!skipDateInput}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                    {bookingData.skipDates.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bookingData.skipDates.map(date => (
                          <span key={date} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200">
                            {date}
                            <button type="button" onClick={() => removeSkipDate(date)} className="hover:text-rose-500">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* additional equipment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Request Additional Equipment
                </label>
                {bookingData.requestedEquipmentIds.length > 0 && (
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                    {bookingData.requestedEquipmentIds.length} selected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Select equipment not available in this room — admin will review your request.
              </p>

              {equipmentLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
                  ))}
                </div>
              ) : availableEquipment.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-3">
                  No additional equipment available to request.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableEquipment.map(item => {
                    const Icon = EQUIPMENT_ICONS[item.type] || MdDevicesOther;
                    const selected = bookingData.requestedEquipmentIds.includes(item.id);
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => toggleEquipment(item.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer select-none
                          ${selected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50'
                            : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                          }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                          ${selected ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          <Icon className="text-base" />
                        </div>
                        <span className={`text-[10px] font-semibold leading-tight transition-colors
                          ${selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                          {item.name}
                        </span>
                        <span className={`text-[9px] leading-none transition-colors
                          ${selected ? 'text-indigo-400 dark:text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-indigo-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {conflictError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/30 text-sm text-rose-600 dark:text-rose-400">
                {conflictError}
              </div>
            )}

            <button
              type="submit"
              disabled={resource.status !== 'AVAILABLE' || isPending || !isValid()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-500 hover:from-indigo-800 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              {isPending ? 'Booking…' : resource.status === 'AVAILABLE' ? 'Book this Facility' : 'Currently Unavailable'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
