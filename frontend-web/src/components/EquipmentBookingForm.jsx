import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdWarning, MdSearch, MdArrowForward, MdArrowBack, MdBuild } from 'react-icons/md';
import { useCreateEquipmentBooking } from '../hooks/useEquipmentBookings';
import { useAllEquipment } from '../hooks/useEquipment';
import { useAuth } from '../context/AuthContext';

const EQUIPMENT_TYPES = ['PROJECTOR', 'MICROPHONE', 'CAMERA', 'SPEAKER', 'WHITEBOARD', 'LAPTOP', 'OTHER'];

const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label, value };
});

const EquipmentBookingForm = ({ isOpen, onClose }) => {
  const { authUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [filters, setFilters] = useState({ type: '', search: '', date: '', startTime: '', endTime: '' });
  const [formData, setFormData] = useState({ purpose: '' });
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  const { data: equipmentData, isLoading: loadingEquipment } = useAllEquipment();
  let equipments = equipmentData?.content || equipmentData || [];
  
  // Basic filtering for available active equipments matching type/search
  equipments = equipments.filter(eq => eq.status === 'ACTIVE' || eq.status === 'AVAILABLE');
  if (filters.search) {
    equipments = equipments.filter(eq => eq.name.toLowerCase().includes(filters.search.toLowerCase()));
  }
  if (filters.type) {
    equipments = equipments.filter(eq => eq.type === filters.type);
  }

  const createBooking = useCreateEquipmentBooking();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedEquipment(null);
      setFilters({ type: '', search: '', date: '', startTime: '', endTime: '' });
      setFormData({ purpose: '' });
      setErrors({});
      setConflictError('');
    }
  }, [isOpen]);

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
    if (!selectedEquipment) errs.equipment = 'Please select equipment';
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
      equipmentId: selectedEquipment.id,
      userId: authUser?.id,
      purpose: formData.purpose,
      startTime: `${filters.date}T${fmt(filters.startTime)}`,
      endTime: `${filters.date}T${fmt(filters.endTime)}`
    };
    try {
      await createBooking.mutateAsync(payload);
      onClose();
    } catch (err) {
      if (err.response?.status === 409)
        setConflictError(err.response.data?.message || 'This equipment is already booked for the selected time.');
      else if (err.response?.status === 400)
        setConflictError(err.response.data?.message || 'Invalid input provided.');
      else
        setConflictError(`Failed to create booking. Please try again.`);
    }
  };

  if (!isOpen) return null;

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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {currentStep === 1 ? 'Find Equipment' : 'Booking Details'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStep === 1 ? 'Filter and select equipment' : 'Fill in the booking information'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
              <MdClose className="text-xl" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 px-6 pb-4">
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'w-16 bg-gradient-to-r from-emerald-400 to-teal-400' : 'w-8 bg-slate-200 dark:bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'w-16 bg-gradient-to-r from-teal-400 to-cyan-400' : 'w-8 bg-slate-200 dark:bg-slate-700'}`} />
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

                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5 mb-5">
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Equipment Type</label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-400/50 outline-none"
                      >
                        <option value="">All Types</option>
                        {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${errors.date ? 'border-rose-300' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100'}`}
                      />
                      {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Start Time</label>
                      <select
                        name="startTime"
                        value={filters.startTime}
                        onChange={handleFilterChange}
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.startTime ? 'border-rose-300' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm outline-none`}
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
                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.endTime ? 'border-rose-300' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm outline-none`}
                      >
                        <option value="">Select end time</option>
                        {TIME_SLOTS.slice(1).map(({ label, value }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {loadingEquipment ? (
                    <div className="text-center py-6 text-slate-500">Loading equipment...</div>
                  ) : equipments.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 bg-slate-50 dark:bg-slate-700/30 rounded-xl">No equipment available matching criteria.</div>
                  ) : (
                    equipments.map(eq => (
                      <div
                        key={eq.id}
                        onClick={() => { setSelectedEquipment(eq); setErrors(prev => ({ ...prev, equipment: '' })); }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedEquipment?.id === eq.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEquipment?.id === eq.id ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                              <MdBuild className="text-xl" />
                            </div>
                            <div>
                              <h4 className={`font-bold ${selectedEquipment?.id === eq.id ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-200'}`}>
                                {eq.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">{eq.type}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {errors.equipment && <p className="text-sm text-rose-500 text-center">{errors.equipment}</p>}
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={goToStep2} className="flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800 font-semibold rounded-xl hover:bg-slate-700 dark:hover:bg-white transition-all shadow-md active:scale-95">
                    Next Step <MdArrowForward />
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
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Selected Equipment</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedEquipment?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{filters.date}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{filters.startTime} - {filters.endTime}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Purpose of Booking</label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleFormChange}
                      placeholder="e.g. For lecture presentation"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.purpose ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 dark:border-slate-600 focus:ring-emerald-400'} bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400`}
                    />
                    {errors.purpose && <p className="text-xs text-rose-500 mt-1">{errors.purpose}</p>}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={goToStep1} className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Back
                  </button>
                  <button onClick={handleSubmit} className="flex flex-[2] items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95">
                    Confirm Booking
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EquipmentBookingForm;
