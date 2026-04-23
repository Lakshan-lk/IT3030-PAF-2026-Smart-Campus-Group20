import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdSearch, MdCheckCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../hooks/useResources';
import FilterPanel from '../components/FilterPanel';
import FacilitySection from '../components/FacilitySection';
import BookingModal from '../components/BookingModal';

const FacilitiesPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');
  const [filterEquipmentTypes, setFilterEquipmentTypes] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: resources, isLoading, isError } = useResources({
    search: debouncedSearch,
    type: filterType,
    status: 'ACTIVE',
    minCapacity: filterMinCapacity || undefined,
    equipmentTypes: filterEquipmentTypes.length ? filterEquipmentTypes : undefined,
    date: filterDate || undefined,
    startTime: filterDate && filterStartTime ? `${filterDate}T${filterStartTime}:00` : undefined,
    endTime: filterDate && filterEndTime ? `${filterDate}T${filterEndTime}:00` : undefined,
  });

  const clearFilters = () => {
    setFilterType('');
    setFilterMinCapacity('');
    setFilterEquipmentTypes([]);
    setFilterDate('');
    setFilterStartTime('');
    setFilterEndTime('');
  };

  const handleBookSuccess = () => {
    setSuccessMessage('Booking created successfully!');
    setSelectedResource(null);
    setTimeout(() => { setSuccessMessage(''); navigate('/bookings'); }, 2000);
  };

  const resourceList = resources?.content || resources || [];
  const groupedResources = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'WORKSHOP'].map(type => ({
    type,
    resources: resourceList.filter(resource => resource.type === type),
  }));
  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Facilities & Assets</h1>
      </div>

      {/* search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search facilities..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all"
          />
        </div>
      </div>

      {/* filters */}
      <div className="mb-6">
        <FilterPanel
          filterType={filterType} setFilterType={setFilterType}
          filterMinCapacity={filterMinCapacity} setFilterMinCapacity={setFilterMinCapacity}
          filterEquipmentTypes={filterEquipmentTypes} setFilterEquipmentTypes={setFilterEquipmentTypes}
          filterDate={filterDate} setFilterDate={setFilterDate}
          filterStartTime={filterStartTime} setFilterStartTime={setFilterStartTime}
          filterEndTime={filterEndTime} setFilterEndTime={setFilterEndTime}
          onClear={clearFilters}
        />
      </div>

      {/* resource grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl border border-red-100 dark:border-red-900/20">
          <p className="font-semibold">Failed to load resources.</p>
        </div>
      ) : !resourceList.length ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <MdSearch className="mx-auto text-5xl text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No facilities found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedResources.map(group => (
            <FacilitySection
              key={group.type}
              resources={group.resources}
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
