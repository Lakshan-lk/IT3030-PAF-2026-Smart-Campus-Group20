import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdCalendarToday, MdAccessTime, MdDescription, MdWarning,
  MdSearch, MdPeople, MdArrowForward, MdArrowBack, MdMeetingRoom,
  MdLocationOn, MdExpandMore, MdExpandLess, MdTv, MdBorderAll,
  MdAcUnit, MdMic, MdComputer, MdVideocam
} from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useCreateBooking } from '../hooks/useBookings';

const ROOM_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'SEMINAR_ROOM', 'WORKSHOP'];
const EQUIPMENT_TYPES = ['PROJECTOR', 'WHITEBOARD', 'AC', 'MICROPHONE', 'PC', 'CAMERA'];
const RECURRENCE_PATTERNS = ['WEEKLY'];

const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label, value };
});

const EQUIPMENT_CONFIG = {
  PROJECTOR:   { icon: MdTv,        color: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-500/40',  bg: 'bg-violet-50 dark:bg-violet-900/20',  ring: 'ring-violet-400' },
  WHITEBOARD:  { icon: MdBorderAll,  color: 'from-sky-500 to-blue-600',       glow: 'shadow-sky-500/40',     bg: 'bg-sky-50 dark:bg-sky-900/20',        ring: 'ring-sky-400'    },
  AC:          { icon: MdAcUnit,     color: 'from-teal-400 to-cyan-600',      glow: 'shadow-teal-500/40',    bg: 'bg-teal-50 dark:bg-teal-900/20',      ring: 'ring-teal-400'   },
  MICROPHONE:  { icon: MdMic,        color: 'from-rose-500 to-pink-600',      glow: 'shadow-rose-500/40',    bg: 'bg-rose-50 dark:bg-rose-900/20',      ring: 'ring-rose-400'   },
  PC:          { icon: MdComputer,   color: 'from-amber-500 to-orange-600',   glow: 'shadow-amber-500/40',   bg: 'bg-amber-50 dark:bg-amber-900/20',    ring: 'ring-amber-400'  },
  CAMERA:      { icon: MdVideocam,   color: 'from-emerald-500 to-green-600',  glow: 'shadow-emerald-500/40', bg: 'bg-emerald-50 dark:bg-emerald-900/20',ring: 'ring-emerald-400'},
};

const NewBookingForm = ({ isOpen, onClose, initialResourceId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const resolvedInitialId = initialResourceId || '';
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    minCapacity: '',
    equipmentTypes: [],
    startTime: '',
    endTime: '',
    date: '',
  });
  const [formData, setFormData] = useState({
    userId: 2,
    purpose: '',
    attendees: '',
    isRecurring: false,
    recurrencePattern: 'WEEKLY',
    recurrenceEndDate: '',
    skipDates: [],
  });
  const [skipDateInput, setSkipDateInput] = useState('');
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  const { data: resourcesData, isLoading: loadingResources, refetch: refetchResources } = useResources(filters);
  const resources = resourcesData?.content || resourcesData || [];
  const createBooking = useCreateBooking();

  useEffect(() => {
    if (isOpen) {
      const resetForm = () => {
        setCurrentStep(1);
        setSelectedRoom(null);
setFilters({ type: '', minCapacity: '', equipmentTypes: [], startTime: '', endTime: '', date: '' });
        setFormData({ userId: 2, purpose: '', attendees: '', isRecurring: false, recurrencePattern: 'WEEKLY', recurrenceEndDate: '', skipDates: [] });
        setSkipDateInput('');
        setErrors({});
        setConflictError('');
      };
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && filters.date && filters.startTime && filters.endTime) {
      refetchResources();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [filters.date, filters.startTime, filters.endTime, isOpen, refetchResources]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
    setConflictError('');
  };

  const addSkipDate = () => {
    if (skipDateInput && !formData.skipDates.includes(skipDateInput)) {
      setFormData(prev => ({ ...prev, skipDates: [...prev.skipDates, skipDateInput].sort() }));
      setSkipDateInput('');
    }
  };

  const removeSkipDate = (date) => {
    setFormData(prev => ({ ...prev, skipDates: prev.skipDates.filter(d => d !== date) }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!selectedRoom) newErrors.room = 'Please select a room';
    if (!filters.date) newErrors.date = 'Please select a date';
    if (!filters.startTime) newErrors.startTime = 'Please select start time';
    if (!filters.endTime) newErrors.endTime = 'Please select end time';
    
    if (filters.startTime && filters.endTime) {
      if (filters.startTime >= filters.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (!formData.attendees || formData.attendees < 1) newErrors.attendees = 'Number of attendees is required';
    
    if (formData.isRecurring && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = 'End date is required for recurring bookings';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setErrors({});
    }
  };

  const goToStep1 = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const formatTimeStr = (t) => t.split(':').length === 2 ? `${t}:00` : t;
    const startTime = `${filters.date}T${formatTimeStr(filters.startTime)}`;
    const endTime = `${filters.date}T${formatTimeStr(filters.endTime)}`;

    const payload = {
      resourceId: selectedRoom.id,
      userId: formData.userId,
      purpose: formData.purpose,
      attendees: parseInt(formData.attendees),
      startTime,
      endTime,
      recurring: formData.isRecurring,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : null,
      recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : null,
      skipDates: formData.isRecurring && formData.skipDates.length > 0 ? formData.skipDates : [],
    };

    try {
      await createBooking.mutateAsync(payload);
      setSelectedRoom(null);
      setFilters({ type: '', minCapacity: '', equipmentTypes: [], startTime: '', endTime: '', date: '' });
      setFormData({ userId: 2, purpose: '', attendees: '', isRecurring: false, recurrencePattern: 'WEEKLY', recurrenceEndDate: '', skipDates: [] });
      setErrors({});
      setConflictError('');
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError(err.response.data.message || 'This time slot is already booked. Please choose a different time.');
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.errors) {
          const messages = Object.values(errorData.errors).join(', ');
          setConflictError(`Validation error: ${messages}`);
        } else {
          setConflictError(errorData.message || 'Invalid input provided. Please check your data.');
        }
      } else {
        setConflictError(`Failed to create booking (${err.response?.status || err.message}). Please try again.`);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedResource(null);
    setFilters({
      type: '',
      capacity: '',
      hasEquipment: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });
    setFormData({
      userId: 2,
      purpose: '',
      attendees: '',
      recurring: false,
      recurrencePattern: 'WEEKLY',
      recurrenceEndDate: '',
      skipDates: [],
    });
    setErrors({});
    setConflictError('');
    setResources([]);
  };

  const goBack = () => {
    setStep(1);
    setSelectedResource(null);
  };

  if (!isOpen) return null;

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {currentStep === 1 ? 'Find a Room' : 'Booking Details'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStep === 1 ? 'Filter and select your room' : 'Fill in the booking information'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 px-6 pb-4">
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'w-16 bg-gradient-to-r from-amber-400 to-orange-400' : 'w-8 bg-slate-200 dark:bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'w-16 bg-gradient-to-r from-orange-400 to-rose-400' : 'w-8 bg-slate-200 dark:bg-slate-700'}`} />
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="px-6 pb-6"
              >
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

                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MdSearch className="text-amber-500 text-lg" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Filter Rooms</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Room Type</label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                      >
                        <option value="">All Types</option>
                        {ROOM_TYPES.map(type => (
                          <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>

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

                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Equipment</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {EQUIPMENT_TYPES.map(eq => {
                          const cfg = EQUIPMENT_CONFIG[eq];
                          const Icon = cfg.icon;
                          const active = filters.equipmentTypes.includes(eq);
                          return (
                            <motion.label
                              key={eq}
                              whileTap={{ scale: 0.92 }}
                              whileHover={{ scale: 1.04 }}
                              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none
                                ${active
                                  ? `${cfg.bg} ring-2 ${cfg.ring} shadow-lg ${cfg.glow}`
                                  : 'bg-white dark:bg-slate-700/40 ring-1 ring-slate-200 dark:ring-slate-600 hover:ring-slate-300 dark:hover:ring-slate-500'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => {
                                  setFilters(prev => ({
                                    ...prev,
                                    equipmentTypes: e.target.checked
                                      ? [...prev.equipmentTypes, eq]
                                      : prev.equipmentTypes.filter(et => et !== eq),
                                  }));
                                }}
                                className="sr-only"
                              />
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${cfg.color} shadow-md transition-all duration-200 ${active ? 'scale-110' : 'opacity-70'}`}>
                                <Icon className="text-white text-xl" />
                              </div>
                              <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${active ? 'text-slate-700 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                {eq}
                              </span>
                              {active && (
                                <motion.div
                                  layoutId={`eq-dot-${eq}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gradient-to-br ${cfg.color}`}
                                />
                              )}
                            </motion.label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.date ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                      />
                      {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Start Time</label>
                      <select
                        name="startTime"
                        value={filters.startTime}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setFilters(prev => ({
                            ...prev,
                            startTime: newStart,
                            endTime: prev.endTime && prev.endTime <= newStart ? '' : prev.endTime,
                          }));
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.startTime ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                      >
                        <option value="">Select start time</option>
                        {TIME_SLOTS.slice(0, -1).map(({ label, value }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {errors.startTime && <p className="text-xs text-rose-500 mt-1">{errors.startTime}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">End Time</label>
                      <select
                        name="endTime"
                        value={filters.endTime}
                        onChange={handleFilterChange}
                        disabled={!filters.startTime}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.endTime ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">Select end time</option>
                        {TIME_SLOTS.filter(({ value }) => !filters.startTime || value > filters.startTime).map(({ label, value }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Available Rooms</h3>
                  {errors.room && !selectedRoom && (
                    <p className="text-xs text-rose-500 mb-2">{errors.room}</p>
                  )}
                  
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
                          <input
                            type="radio"
                            name="selectedRoom"
                            value={room.id}
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={goToStep2}
                    disabled={!selectedRoom || !filters.date || !filters.startTime || !filters.endTime}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <MdArrowForward className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="px-6 pb-6"
              >
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
                      <MdDescription className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <textarea
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleFormChange}
                        placeholder="e.g., Team meeting, Lecture, Workshop"
                        rows={3}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.purpose ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm resize-none`}
                      />
                    </div>
                    {errors.purpose && <p className="text-xs text-rose-500 mt-1.5">{errors.purpose}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <MdPeople className="inline mr-1.5 -mt-0.5" />Attendees
                    </label>
                    <input
                      type="number"
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleFormChange}
                      placeholder="Number of attendees"
                      min="1"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.attendees ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
                    />
                    {errors.attendees && <p className="text-xs text-rose-500 mt-1.5">{errors.attendees}</p>}
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleFormChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        formData.isRecurring
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {formData.isRecurring && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Make this a recurring booking</span>
                    </label>

                    {formData.isRecurring && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/40 space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Repeat</label>
                            <select
                              name="recurrencePattern"
                              value={formData.recurrencePattern}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                            >
                              {RECURRENCE_PATTERNS.map(pattern => (
                                <option key={pattern} value={pattern}>{pattern}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Until</label>
                            <input
                              type="date"
                              name="recurrenceEndDate"
                              value={formData.recurrenceEndDate}
                              onChange={handleFormChange}
                              min={filters.date}
                              className={`w-full px-3 py-2.5 rounded-xl border ${errors.recurrenceEndDate ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                            />
                            {errors.recurrenceEndDate && <p className="text-xs text-rose-500 mt-1">{errors.recurrenceEndDate}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Skip Specific Dates (optional)</label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={skipDateInput}
                              onChange={(e) => setSkipDateInput(e.target.value)}
                              min={filters.date}
                              max={formData.recurrenceEndDate}
                              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
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
                          {formData.skipDates.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.skipDates.map(date => (
                                <span
                                  key={date}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                                >
                                  {date}
                                  <button
                                    type="button"
                                    onClick={() => removeSkipDate(date)}
                                    className="hover:text-rose-500"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goToStep1}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                    >
                      <MdArrowBack className="text-lg" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createBooking.isPending}
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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