import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCalendarToday, MdAccessTime, MdDescription, MdWarning } from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useCreateBooking } from '../hooks/useBookings';

const NewBookingForm = ({ isOpen, onClose, initialResourceId = '' }) => {
  const [formData, setFormData] = useState({
    resourceId: initialResourceId,
    userId: 2,
    purpose: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  const { data: resourcesData } = useResources();
  const resources = resourcesData?.content || resourcesData || [];
  const createBooking = useCreateBooking();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const validate = () => {
    const newErrors = {};
    if (!formData.resourceId) newErrors.resourceId = 'Please select a resource';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';

    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Ensure time string has seconds, but don't add them if already present
    const formatTimeStr = (t) => t.split(':').length === 2 ? `${t}:00` : t;
    const startTime = `${formData.startDate}T${formatTimeStr(formData.startTime)}`;
    const endTime = `${formData.endDate}T${formatTimeStr(formData.endTime)}`;

    try {
      await createBooking.mutateAsync({
        resourceId: parseInt(formData.resourceId),
        userId: formData.userId,
        purpose: formData.purpose,
        startTime,
        endTime,
      });
      setFormData({ resourceId: '', userId: 2, purpose: '', startDate: '', startTime: '', endDate: '', endTime: '' });
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">New Booking</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Reserve a campus resource</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <AnimatePresence>
              {conflictError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl"
                >
                  <MdWarning className="text-rose-500 text-xl mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-rose-700 dark:text-rose-300">{conflictError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Resource</label>
              <select
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${errors.resourceId ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
              >
                <option value="">Select a resource...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.location}</option>
                ))}
              </select>
              {errors.resourceId && <p className="text-xs text-rose-500 mt-1.5">{errors.resourceId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Purpose</label>
              <div className="relative">
                <MdDescription className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Team meeting, Lecture, Workshop"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.purpose ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
                />
              </div>
              {errors.purpose && <p className="text-xs text-rose-500 mt-1.5">{errors.purpose}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <MdCalendarToday className="inline mr-1.5 -mt-0.5" />Start
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.startDate ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
                />
                {errors.startDate && <p className="text-xs text-rose-500 mt-1.5">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <MdAccessTime className="inline mr-1.5 -mt-0.5" />Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.startTime ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
                />
                {errors.startTime && <p className="text-xs text-rose-500 mt-1.5">{errors.startTime}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <MdCalendarToday className="inline mr-1.5 -mt-0.5" />End
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.endDate ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
                />
                {errors.endDate && <p className="text-xs text-rose-500 mt-1.5">{errors.endDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <MdAccessTime className="inline mr-1.5 -mt-0.5" />Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.endTime ? 'border-rose-300 dark:border-rose-600' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm`}
                />
                {errors.endTime && <p className="text-xs text-rose-500 mt-1.5">{errors.endTime}</p>}
              </div>
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
                type="submit"
                disabled={createBooking.isPending}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBooking.isPending ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewBookingForm;
