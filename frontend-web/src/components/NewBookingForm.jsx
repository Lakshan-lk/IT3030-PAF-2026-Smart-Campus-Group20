import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdCalendarToday, MdAccessTime, MdDescription, MdWarning,
  MdSearch, MdPeople, MdArrowForward, MdArrowBack, MdMeetingRoom,
  MdLocationOn, MdCircle,
} from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import { useResourceAvailability } from '../hooks/useResourceAvailability';

const ROOM_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'WORKSHOP'];

const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label, value };
});

const NewBookingForm = ({ isOpen, onClose, initialResourceId }) => {
  const { authUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({ type: '', minCapacity: '', startTime: '', endTime: '', date: '' });
  const [formData, setFormData] = useState({ purpose: '', attendees: '' });
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  // Availability for the currently selected room
  const {
    getBookedRangesForDate,
    isStartSlotBooked,
    isEndSlotConflicting,
    getDayStatus,
  } = useResourceAvailability(selectedRoom?.id);

  const { data: resourcesData, isLoading: loadingResources, refetch: refetchResources } = useResources(filters);
  const resources = resourcesData?.content || resourcesData || [];
  const createBooking = useCreateBooking();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedRoom(null);
      setFilters({ type: '', minCapacity: '', startTime: '', endTime: '', date: '' });
      setFormData({ purpose: '', attendees: '' });
      setErrors({});
      setConflictError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && filters.date && filters.startTime && filters.endTime) {
      refetchResources();
    }
  }, [filters.date, filters.startTime, filters.endTime, isOpen, refetchResources]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setConflictError('');
  };

  const validateStep1 = () => {
    const errs = {};
    if (!selectedRoom) errs.room = 'Please select a room';
    if (!filters.date) errs.date = 'Please select a date';
    if (!filters.startTime) errs.startTime = 'Please select start time';
    if (!filters.endTime) errs.endTime = 'Please select end time';
    if (filters.startTime && filters.endTime && filters.startTime >= filters.endTime)
      errs.endTime = 'End time must be after start time';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.purpose.trim()) errs.purpose = 'Purpose is required';
    if (!formData.attendees || formData.attendees < 1) errs.attendees = 'Number of attendees is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToStep2 = () => { if (validateStep1()) { setCurrentStep(2); setErrors({}); } };
  const goToStep1 = () => { setCurrentStep(1); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    const fmt = t => t.split(':').length === 2 ? `${t}:00` : t;
    const payload = {
      resourceId: selectedRoom.id,
      userId: authUser?.id,
      purpose: formData.purpose,
      attendees: parseInt(formData.attendees),
      startTime: `${filters.date}T${fmt(filters.startTime)}`,
      endTime: `${filters.date}T${fmt(filters.endTime)}`,
      recurring: false,
    };
    try {
      await createBooking.mutateAsync(payload);
      onClose();
    } catch (err) {
      if (err.response?.status === 409)
        setConflictError(err.response.data?.message || 'This time slot is already booked.');
      else if (err.response?.status === 400)
        setConflictError(err.response.data?.message || 'Invalid input provided.');
      else
        setConflictError(`Failed to create booking. Please try again.`);
    }
  };

  if (!isOpen) return null;

  // Availability helpers for the selected date
  const selectedDayStatus = selectedRoom && filters.date ? getDayStatus(filters.date) : null;
  const bookedRanges = selectedRoom && filters.date ? getBookedRangesForDate(filters.date) : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {currentStep === 1 ? 'Find a Room' : 'Booking Details'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStep === 1 ? 'Filter and select your room' : 'Fill in the booking information'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
              <MdClose className="text-xl" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 px-6 pb-4">
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'w-16 bg-gradient-to-r from-amber-400 to-orange-400' : 'w-8 bg-slate-200 dark:bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'w-16 bg-gradient-to-r from-orange-400 to-rose-400' : 'w-8 bg-slate-200 dark:bg-slate-700'}`} />
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Filter & Select Room ── */}
            {currentStep === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="px-6 pb-6"
              >
                {/* Conflict error */}
                <AnimatePresence>
                  {conflictError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-3 p-4 mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl"
                    >
                      <MdWarning className="text-rose-500 text-xl mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-rose-700 dark:text-rose-300">{conflictError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter panel */}
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MdSearch className="text-amber-500 text-lg" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Filter Rooms</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Room Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Room Type</label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                      >
                        <option value="">All Types</option>
                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                      </select>
                    </div>

                    {/* Min Capacity */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Min Capacity</label>
                      <input
                        type="number"
                        name="minCapacity"
                        value={filters.minCapacity}
                        onChange={handleFilterChange}
                        placeholder="e.g., 10"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                      />
                    </div>

                    {/* Date — colour changes based on availability */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={e => {
                          handleFilterChange(e);
                          setFilters(prev => ({ ...prev, date: e.target.value, startTime: '', endTime: '' }));
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-amber-400/50 outline-none transition-colors
                          ${errors.date ? 'border-rose-300 dark:border-rose-600' :
                            selectedDayStatus === 'full'    ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' :
                            selectedDayStatus === 'partial' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' :
                            'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100'}`}
                      />
                      {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
                      {selectedDayStatus === 'full' && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Fully booked — choose another date</p>
                      )}
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Start Time</label>
                      <select
                        name="startTime"
                        value={filters.startTime}
                        onChange={e => {
                          const val = e.target.value;
                          setFilters(prev => ({ ...prev, startTime: val, endTime: prev.endTime && prev.endTime <= val ? '' : prev.endTime }));
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.startTime ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 outline-none`}
                      >
                        <option value="">Select start time</option>
                        {TIME_SLOTS.slice(0, -1).map(({ label, value }) => {
                          const taken = selectedRoom && filters.date && isStartSlotBooked(value, filters.date);
                          return (
                            <option key={value} value={value} disabled={taken}
                              style={taken ? { color: '#ef4444', backgroundColor: '#fef2f2' } : {}}>
                              {label}{taken ? ' — Taken' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {errors.startTime && <p className="text-xs text-rose-500 mt-1">{errors.startTime}</p>}
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">End Time</label>
                      <select
                        name="endTime"
                        value={filters.endTime}
                        onChange={handleFilterChange}
                        disabled={!filters.startTime}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.endTime ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">Select end time</option>
                        {TIME_SLOTS.filter(({ value }) => !filters.startTime || value > filters.startTime).map(({ label, value }) => {
                          const conflict = selectedRoom && filters.date && isEndSlotConflicting(filters.startTime, value, filters.date);
                          return (
                            <option key={value} value={value} disabled={conflict}
                              style={conflict ? { color: '#ef4444', backgroundColor: '#fef2f2' } : {}}>
                              {label}{conflict ? ' — Conflict' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
                    </div>
                  </div>

                  {/* Booked times banner */}
                  {bookedRanges.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                        {selectedRoom?.name} is already booked at:
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
                </div>

                {/* Room list */}
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Available Rooms</h3>
                  {errors.room && !selectedRoom && <p className="text-xs text-rose-500 mb-2">{errors.room}</p>}

                  {loadingResources ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse" />
                      ))}
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <MdMeetingRoom className="text-4xl mx-auto mb-2 opacity-50" />
                      <p>No rooms match your filters</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {resources.map(room => (
                        <label
                          key={room.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedRoom?.id === room.id
                              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                              : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                          }`}
                        >
                          <input type="radio" name="selectedRoom" value={room.id}
                            checked={selectedRoom?.id === room.id}
                            onChange={() => setSelectedRoom(room)}
                            className="sr-only"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{room.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{room.type?.replace('_', ' ')}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 dark:text-slate-500">
                              <MdLocationOn className="text-sm" />
                              <span>{room.location || 'No location'}</span>
                            </div>
                            {room.capacity && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 dark:text-slate-500">
                                <MdPeople className="text-sm" />
                                <span>Capacity: {room.capacity}</span>
                              </div>
                            )}
                          </div>
                          {selectedRoom?.id === room.id && (
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 1 actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                    Cancel
                  </button>
                  <button type="button" onClick={goToStep2}
                    disabled={!selectedRoom || !filters.date || !filters.startTime || !filters.endTime}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Continue <MdArrowForward className="text-lg" />
                  </button>
                </div>
              </motion.div>

            ) : (
              /* ── Step 2: Purpose & Attendees ── */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="px-6 pb-6"
              >
                {/* Summary card */}
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 mb-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <MdMeetingRoom className="text-xl text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedRoom?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedRoom?.type?.replace('_', ' ')} • {selectedRoom?.location}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MdCalendarToday className="text-slate-400" />
                      <span>{filters.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MdAccessTime className="text-slate-400" />
                      <span>{filters.startTime} — {filters.endTime}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Purpose</label>
                    <div className="relative">
                      <MdDescription className="absolute left-3.5 top-3.5 text-slate-400" />
                      <textarea name="purpose" value={formData.purpose} onChange={handleFormChange}
                        placeholder="e.g., Team meeting, Lecture, Workshop" rows={3}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.purpose ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none text-sm resize-none`}
                      />
                    </div>
                    {errors.purpose && <p className="text-xs text-rose-500 mt-1.5">{errors.purpose}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <MdPeople className="inline mr-1.5 -mt-0.5" />Attendees
                    </label>
                    <input type="number" name="attendees" value={formData.attendees} onChange={handleFormChange}
                      placeholder="Number of attendees" min="1"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.attendees ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none text-sm`}
                    />
                    {errors.attendees && <p className="text-xs text-rose-500 mt-1.5">{errors.attendees}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={goToStep1}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                      <MdArrowBack className="text-lg" /> Back
                    </button>
                    <button type="submit" disabled={createBooking.isPending}
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {createBooking.isPending ? 'Creating...' : 'Create Booking'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewBookingForm;
