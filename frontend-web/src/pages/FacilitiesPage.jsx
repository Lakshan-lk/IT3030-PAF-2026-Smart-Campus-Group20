import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdSearch, MdCheckCircle, MdMeetingRoom, MdLock } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../hooks/useResources';
import FilterPanel from '../components/FilterPanel';
import ResourceCard from '../components/ResourceCard';
import BookingModal from '../components/BookingModal';

const SectionDivider = ({ icon, label, count, variant = 'available' }) => {
  const DividerIcon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 mb-5"
    >
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest
        ${variant === 'available'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
        }`}>
        <DividerIcon className="text-sm" />
        <span>{label}</span>
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black
          ${variant === 'available'
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300'
          }`}>
          {count}
        </span>
      </div>
      <div className={`flex-1 h-px
        ${variant === 'available'
          ? 'bg-gradient-to-r from-emerald-200/60 dark:from-emerald-900/40 to-transparent'
          : 'bg-gradient-to-r from-rose-200/60 dark:from-rose-900/40 to-transparent'
        }`} />
    </motion.div>
  );
};

const FacilitiesPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');
  const [filterEquipment, setFilterEquipment] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const hasTimeFilter = filterDate && filterStartTime;

  const effectiveStartTime = hasTimeFilter ? `${filterDate}T${filterStartTime}:00` : undefined;
  const effectiveEndTime = hasTimeFilter
    ? (filterEndTime ? `${filterDate}T${filterEndTime}:00` : `${filterDate}T${filterStartTime}:01`)
    : undefined;

  const { data: resources, isLoading, isError } = useResources({
    search: debouncedSearch,
    type: filterType,
    status: 'AVAILABLE',
    minCapacity: filterMinCapacity || undefined,
    equipmentTypes: filterEquipment.length ? filterEquipment.join(',') : undefined,
    date: filterDate || undefined,
    startTime: effectiveStartTime,
    endTime: effectiveEndTime,
  });

  const toggleEquipment = (eq) =>
    setFilterEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);

  const clearFilters = () => {
    setFilterType('');
    setFilterMinCapacity('');
    setFilterEquipment([]);
    setFilterDate('');
    setFilterStartTime('');
    setFilterEndTime('');
  };

  const handleBookSuccess = () => {
    setSuccessMessage('Booking created successfully!');
    setSelectedResource(null);
    setTimeout(() => { setSuccessMessage(''); navigate('/bookings'); }, 2000);
  };

  const rawList = resources?.content || resources || [];

  // Sort: available first, booked last
  const availableList = rawList.filter(r => !r.bookedForSlot);
  const bookedList = rawList.filter(r => r.bookedForSlot);
  const showSections = hasTimeFilter && bookedList.length > 0;

  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300">

      {/* page header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
        >
          Facilities &amp; Assets
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        >
          Browse and book campus spaces and equipment.
        </motion.p>
      </div>

      {/* search bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4"
      >
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for lecture halls, labs, meeting rooms…"
            className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl
              border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30
              outline-none text-slate-700 dark:text-slate-200 text-sm transition-all"
          />
        </div>
      </motion.div>

      {/* filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="mb-6"
      >
        <FilterPanel
          filterType={filterType} setFilterType={setFilterType}
          filterMinCapacity={filterMinCapacity} setFilterMinCapacity={setFilterMinCapacity}
          filterEquipment={filterEquipment} toggleEquipment={toggleEquipment}
          filterDate={filterDate} setFilterDate={setFilterDate}
          filterStartTime={filterStartTime} setFilterStartTime={setFilterStartTime}
          filterEndTime={filterEndTime} setFilterEndTime={setFilterEndTime}
          onClear={clearFilters}
        />
      </motion.div>

      {/* resource grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-72 animate-pulse border border-slate-100 dark:border-slate-700" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl border border-red-100 dark:border-red-900/20">
          <p className="font-semibold font-display">Failed to load resources.</p>
        </div>
      ) : rawList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
        >
          <MdSearch className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="font-display text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            No facilities found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search or filters
          </p>
        </motion.div>
      ) : showSections ? (
        <div className="space-y-8">
          {availableList.length > 0 && (
            <div>
              <SectionDivider
                icon={MdMeetingRoom}
                label="Available"
                count={availableList.length}
                variant="available"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableList.map((resource, i) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    index={i}
                    onBook={r => setSelectedResource(r)}
                  />
                ))}
              </div>
            </div>
          )}

          {bookedList.length > 0 && (
            <div>
              <SectionDivider
                icon={MdLock}
                label="Already Booked"
                count={bookedList.length}
                variant="booked"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookedList.map((resource, i) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    index={availableList.length + i}
                    onBook={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rawList.map((resource, i) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              index={i}
              onBook={r => setSelectedResource(r)}
            />
          ))}
        </div>
      )}

      {/* booking modal */}
      <AnimatePresence>
        {selectedResource && (
          <BookingModal
            key={selectedResource.id}
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            onSuccess={handleBookSuccess}
            initialDate={filterDate}
            initialStartTime={filterStartTime}
            initialEndTime={filterEndTime}
          />
        )}
      </AnimatePresence>

      {/* success toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl shadow-emerald-600/30 font-semibold text-sm">
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
