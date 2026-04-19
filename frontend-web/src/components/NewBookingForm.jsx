import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCalendarToday, MdAccessTime, MdDescription, MdPeople, MdWarning, MdRoom, MdFilterList, MdRepeat, MdAdd, MdRemove } from 'react-icons/md';
import api from '../api/axios';
import { useCreateBooking } from '../hooks/useBookings';

const ROOM_TYPES = ['LAB', 'LECTURE_HALL', 'MEETING_ROOM'];
const EQUIPMENT_TYPES = ['PROJECTOR', 'WHITEBOARD', 'AC', 'MICROPHONE', 'PC', 'CAMERA'];

const NewBookingForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    userId: 2,
    purpose: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    attendees: '',
    recurring: false,
    recurrencePattern: 'WEEKLY',
    recurrenceEndDate: '',
    skipDates: [],
  });
  
  const [newSkipDate, setNewSkipDate] = useState('');
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  const { data: resources = [] } = useResources();
  const createBooking = useCreateBooking();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setConflictError('');
  };

  // Sync form data when modal opens (especially for initialResourceId)
  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        resourceId: initialResourceId || '',
        purpose: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      }));
      setErrors({});
      setConflictError('');
    }
  }, [isOpen, initialResourceId]);

  const searchRooms = async () => {
    if (!filters.startDate || !filters.startTime || !filters.endDate || !filters.endTime) {
      setErrors(prev => ({ ...prev, search: 'Please fill in date and time to search for available rooms' }));
      return;
    }

    setIsLoadingResources(true);
    setErrors(prev => ({ ...prev, search: '' }));

    try {
      const params = {
        startTime: `${filters.startDate}T${filters.startTime}:00`,
        endTime: `${filters.endDate}T${filters.endTime}:00`,
      };
      if (filters.type) params.type = filters.type;
      if (filters.capacity) params.capacity = parseInt(filters.capacity);
      if (filters.hasEquipment) params.hasEquipment = filters.hasEquipment;

      const res = await api.get('/api/v1/resources', { params });
      setResources(res.data);
    } catch (err) {
      console.error('Failed to search rooms:', err);
      setErrors(prev => ({ ...prev, search: 'Failed to search rooms' }));
    } finally {
      setIsLoadingResources(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!filters.startDate) newErrors.startDate = 'Required';
    if (!filters.startTime) newErrors.startTime = 'Required';
    if (!filters.endDate) newErrors.endDate = 'Required';
    if (!filters.endTime) newErrors.endTime = 'Required';

    if (filters.startDate && filters.startTime && filters.endDate && filters.endTime) {
      const start = new Date(`${filters.startDate}T${filters.startTime}`);
      const end = new Date(`${filters.endDate}T${filters.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'End must be after start';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!selectedResource) newErrors.resource = 'Please select a room';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (formData.recurring && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = 'End date required for recurring bookings';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) {
      searchRooms().then(() => setStep(2));
    }
  };

  const addSkipDate = () => {
    if (newSkipDate && !formData.skipDates.includes(newSkipDate)) {
      setFormData(prev => ({
        ...prev,
        skipDates: [...prev.skipDates, newSkipDate].sort()
      }));
      setNewSkipDate('');
    }
  };

  const removeSkipDate = (date) => {
    setFormData(prev => ({
      ...prev,
      skipDates: prev.skipDates.filter(d => d !== date)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const startTime = `${formData.startDate}T${formData.startTime}:00`;
    const endTime = `${formData.endDate}T${formData.endTime}:00`;

    const bookingData = {
      resourceId: selectedResource.id,
      userId: formData.userId,
      purpose: formData.purpose,
      attendees: formData.attendees ? parseInt(formData.attendees) : null,
      startTime,
      endTime,
      recurring: formData.recurring,
      recurrencePattern: formData.recurring ? formData.recurrencePattern : null,
      recurrenceEndDate: formData.recurring ? formData.recurrenceEndDate : null,
      skipDates: formData.recurring ? formData.skipDates : [],
    };

    try {
      await createBooking.mutateAsync(bookingData);
      resetForm();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError(err.response.data.message || 'This time slot is already booked. Please choose a different time.');
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
          className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {step === 1 ? 'Find a Room' : 'Book {selectedResource?.name}'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Step {step} of 2: {step === 1 ? 'Select date, time & filter rooms' : 'Confirm booking details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" {...stepVariants} className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MdFilterList className="text-amber-500 text-xl" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter rooms by availability</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Room Type</label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                      >
                        <option value="">All types</option>
                        {ROOM_TYPES.map(t => (
                          <option key={t} value={t}>{t.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Min Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        value={filters.capacity}
                        onChange={handleFilterChange}
                        placeholder="Min people"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Equipment</label>
                      <select
                        name="hasEquipment"
                        value={filters.hasEquipment}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                      >
                        <option value="">Any equipment</option>
                        {EQUIPMENT_TYPES.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <MdCalendarToday className="inline mr-1" />Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.startDate ? 'border-rose-300' : 'border-slate-200'} dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                      />
                      {errors.startDate && <p className="text-xs text-rose-500 mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <MdAccessTime className="inline mr-1" />Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={filters.startTime}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.startTime ? 'border-rose-300' : 'border-slate-200'} dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                      />
                      {errors.startTime && <p className="text-xs text-rose-500 mt-1">{errors.startTime}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <MdCalendarToday className="inline mr-1" />End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.endDate ? 'border-rose-300' : 'border-slate-200'} dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                      />
                      {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <MdAccessTime className="inline mr-1" />End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={filters.endTime}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.endTime ? 'border-rose-300' : 'border-slate-200'} dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none`}
                      />
                      {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
                    </div>
                  </div>

                  {errors.search && (
                    <p className="text-sm text-rose-500">{errors.search}</p>
                  )}

                  <button
                    type="button"
                    onClick={goToStep2}
                    disabled={isLoadingResources}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50"
                  >
                    {isLoadingResources ? 'Searching...' : 'Search Available Rooms'}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="step2" {...stepVariants} className="space-y-5">
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 mb-2"
                  >
                    ← Back to search
                  </button>

                  {conflictError && (
                    <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl">
                      <MdWarning className="text-rose-500 text-xl mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-rose-700 dark:text-rose-300">{conflictError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Select Room</label>
                    {resources.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No rooms available for selected time</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {resources.map(room => (
                          <label
                            key={room.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedResource?.id === room.id
                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-slate-200 dark:border-slate-600 hover:border-amber-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="resource"
                              checked={selectedResource?.id === room.id}
                              onChange={() => setSelectedResource(room)}
                              className="sr-only"
                            />
                            <MdRoom className="text-xl text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{room.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{room.type} • {room.location}</p>
                              {room.capacity && (
                                <p className="text-xs text-slate-400 dark:text-slate-500">Capacity: {room.capacity}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {errors.resource && <p className="text-xs text-rose-500 mt-1">{errors.resource}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <MdDescription className="inline mr-1" />Purpose
                    </label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleFormChange}
                      placeholder="e.g., Team meeting, Lecture, Workshop"
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.purpose ? 'border-rose-300' : 'border-slate-200'} dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none resize-none`}
                    />
                    {errors.purpose && <p className="text-xs text-rose-500 mt-1">{errors.purpose}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <MdPeople className="inline mr-1" />Attendees
                    </label>
                    <input
                      type="number"
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleFormChange}
                      placeholder="Number of attendees (optional)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="recurring"
                        checked={formData.recurring}
                        onChange={handleFormChange}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                      />
                      <MdRepeat className="text-amber-500" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recurring booking</span>
                    </label>
                  </div>

                  {formData.recurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pl-2 border-l-2 border-amber-200 dark:border-amber-800/40"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Repeat</label>
                          <select
                            name="recurrencePattern"
                            value={formData.recurrencePattern}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm"
                          >
                            <option value="WEEKLY">Weekly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Until</label>
                          <input
                            type="date"
                            name="recurrenceEndDate"
                            value={formData.recurrenceEndDate}
                            onChange={handleFormChange}
                            className={`w-full px-3 py-2.5 rounded-xl border ${errors.recurrenceEndDate ? 'border-rose-300' : 'border-slate-200'} dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm`}
                          />
                          {errors.recurrenceEndDate && <p className="text-xs text-rose-500 mt-1">{errors.recurrenceEndDate}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Skip dates (optional)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="date"
                            value={newSkipDate}
                            onChange={(e) => setNewSkipDate(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm"
                          />
                          <button
                            type="button"
                            onClick={addSkipDate}
                            className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                          >
                            <MdAdd />
                          </button>
                        </div>
                        {formData.skipDates.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.skipDates.map(date => (
                              <span
                                key={date}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg"
                              >
                                {date}
                                <button
                                  type="button"
                                  onClick={() => removeSkipDate(date)}
                                  className="hover:text-rose-500"
                                >
                                  <MdRemove className="text-xs" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={createBooking.isPending}
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createBooking.isPending ? 'Creating...' : 'Create Booking'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewBookingForm;