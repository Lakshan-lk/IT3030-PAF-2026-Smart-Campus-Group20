import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdFilterList, MdClose, MdLocationOn, MdPeople, MdEventAvailable, MdInfoOutline, MdWarning, MdCheckCircle } from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useCreateBooking } from '../hooks/useBookings';
import { useNavigate } from 'react-router-dom';

const FacilitiesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingData, setBookingData] = useState({
    userId: 2,
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
    isRecurring: false,
    recurrencePattern: 'WEEKLY',
    recurrenceEndDate: '',
  });
  const [conflictError, setConflictError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createBooking = useCreateBooking();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: resources, isLoading, isError } = useResources({
    search: debouncedSearch,
    type: filterType,
    status: filterStatus,
  });

  const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
    const hour = 8 + i;
    const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
    const value = `${String(hour).padStart(2, '0')}:00`;
    return { label, value };
  });

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setBookingData(prev => ({ ...prev, [name]: checked }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
    setConflictError('');
  };

  const validateBooking = () => {
    if (!bookingData.date) return false;
    if (!bookingData.startTime) return false;
    if (!bookingData.endTime) return false;
    if (bookingData.startTime >= bookingData.endTime) return false;
    if (!bookingData.purpose.trim()) return false;
    if (!bookingData.attendees || bookingData.attendees < 1) return false;
    if (bookingData.isRecurring && !bookingData.recurrenceEndDate) return false;
    return true;
  };

  const handleBookingSubmit = async (resource) => {
    if (!validateBooking()) return;

    const formatTimeStr = (t) => t.split(':').length === 2 ? `${t}:00` : t;
    const startTime = `${bookingData.date}T${formatTimeStr(bookingData.startTime)}`;
    const endTime = `${bookingData.date}T${formatTimeStr(bookingData.endTime)}`;

    const payload = {
      resourceId: resource.id,
      userId: bookingData.userId,
      purpose: bookingData.purpose,
      attendees: parseInt(bookingData.attendees),
      startTime,
      endTime,
      recurring: bookingData.isRecurring,
      recurrencePattern: bookingData.isRecurring ? bookingData.recurrencePattern : null,
      recurrenceEndDate: bookingData.isRecurring ? bookingData.recurrenceEndDate : null,
      skipDates: [],
    };

    try {
      await createBooking.mutateAsync(payload);
      setSuccessMessage('Booking created successfully!');
      setBookingData({
        userId: 2,
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
        isRecurring: false,
        recurrencePattern: 'WEEKLY',
        recurrenceEndDate: '',
      });
      setSelectedResource(null);
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || err.response?.data?.error || 'Booking failed. Try again.';
      if (status === 409) {
        setConflictError(err.response?.data?.message || 'Time slot already booked');
      } else if (status === 400 || status === 422) {
        setConflictError(err.response?.data?.message || 'Invalid input. Please check your details.');
      } else if (status === 404) {
        setConflictError(err.response?.data?.message || 'Resource or user not found.');
      } else if (status === 500) {
        setConflictError(msg === 'Booking failed. Try again.' ? 'Server error. Please try again later.' : msg);
      } else {
        setConflictError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Facilities & Assets</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-3 text-slate-400 text-xl" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for lecture halls, labs..." 
            className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-600'}`}
        >
          <MdFilterList /> Filter
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex gap-4"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Laboratory</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR_ROOM">Seminar Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl">
          <p className="font-semibold">Failed to load resources.</p>
        </div>
      ) : !(resources?.content || resources || []).length ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl">
          <MdSearch className="mx-auto text-5xl text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No facilities found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(resources.content || resources).map((resource) => (
            <motion.div 
              key={resource.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-700 relative">
                {resource.imageUrl ? (
                  <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 flex items-center justify-center">
                    <span className="text-indigo-300 font-bold text-xl">{resource.type?.replace('_', ' ')}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md text-xs font-bold capitalize">
                  {resource.type?.replace('_', ' ').toLowerCase()}
                </div>
                <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md ${resource.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {resource.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{resource.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <MdLocationOn /> <span>{resource.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <MdPeople /> <span>Capacity: {resource.capacity || 'N/A'}</span>
                </div>
                <div className="mt-auto">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedResource(resource); }}
                    className="w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    View & Book
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
            >
              <div className="h-40 relative">
                {selectedResource.imageUrl ? (
                  <img src={selectedResource.imageUrl} alt={selectedResource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-violet-500 flex items-center justify-center">
                    <MdEventAvailable className="text-white/40 text-6xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setSelectedResource(null)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50">
                  <MdClose />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedResource.name}</h2>
                    <p className="text-white/80 text-sm">{selectedResource.location || 'Location not specified'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedResource.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedResource.status}
                  </span>
                </div>
              </div>
               
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                <div className="flex gap-2 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg text-xs">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="ml-1 font-semibold">{selectedResource.capacity || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg text-xs">
                    <span className="text-slate-400">Type:</span>
                    <span className="ml-1 font-semibold capitalize">{selectedResource.type?.replace('_', ' ').toLowerCase()}</span>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleBookingSubmit(selectedResource); }} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Date</label>
                      <input type="date" name="date" value={bookingData.date} onChange={handleBookingChange} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Start</label>
                      <select name="startTime" value={bookingData.startTime} onChange={(e) => { setBookingData(prev => ({...prev, startTime: e.target.value, endTime: prev.endTime && prev.endTime <= e.target.value ? '' : prev.endTime})); }} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm">
                        <option value="">Select</option>
                        {TIME_SLOTS.slice(0, -1).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">End</label>
                      <select name="endTime" value={bookingData.endTime} onChange={handleBookingChange} disabled={!bookingData.startTime} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm disabled:opacity-50">
                        <option value="">Select</option>
                        {TIME_SLOTS.filter(t => !bookingData.startTime || t.value > bookingData.startTime).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Purpose</label>
                    <textarea name="purpose" value={bookingData.purpose} onChange={handleBookingChange} placeholder="Meeting, Lecture..." rows={2} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm resize-none" />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Attendees</label>
                    <input type="number" name="attendees" value={bookingData.attendees} onChange={handleBookingChange} placeholder="1" min="1" className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm" />
                  </div>

                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="isRecurring" checked={bookingData.isRecurring} onChange={handleBookingChange} className="sr-only" />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${bookingData.isRecurring ? 'bg-indigo-700 border-violet-500' : 'border-slate-300'}`}>
                        {bookingData.isRecurring && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm">Recurring</span>
                    </label>
                    {bookingData.isRecurring && (
                      <div className="mt-2 pt-2 border-t border-amber-200 grid grid-cols-2 gap-2">
                        <div>
                          <select name="recurrencePattern" value={bookingData.recurrencePattern} onChange={handleBookingChange} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm">
                            <option value="WEEKLY">Weekly</option>
                          </select>
                        </div>
                        <div>
                          <input type="date" name="recurrenceEndDate" value={bookingData.recurrenceEndDate} onChange={handleBookingChange} min={bookingData.date} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                        </div>
                      </div>
                    )}
                  </div>

                  {conflictError && <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-sm text-rose-600">{conflictError}</div>}

                  <button type="submit" disabled={selectedResource.status !== 'AVAILABLE' || createBooking.isPending} className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-400 hover:from-indigo-900 hover:to-indigo-400 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-lg text-sm shadow-lg shadow-amber-500/25 transition-all">
                    {createBooking.isPending ? 'Booking...' : selectedResource.status === 'AVAILABLE' ? 'Book this Facility' : 'Currently Unavailable'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl font-medium">
              <MdCheckCircle className="text-xl" />
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitiesPage;