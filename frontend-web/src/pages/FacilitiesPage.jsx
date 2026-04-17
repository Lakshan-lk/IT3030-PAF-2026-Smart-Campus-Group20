import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdFilterList, MdClose, MdLocationOn, MdPeople, MdEventAvailable, MdInfoOutline } from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useNavigate } from 'react-router-dom';

const FacilitiesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: resources, isLoading, isError, error } = useResources({
    search: debouncedSearch,
    type: filterType,
    status: filterStatus,
  });

  const handleBooking = (resource) => {
    navigate('/bookings', { state: { resourceId: resource.id } });
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Facilities & Assets</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4 transition-colors duration-300">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 text-xl" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for lecture halls, labs..." 
            className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-slate-700 dark:text-slate-200 transition-colors"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-700'} `}
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
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex flex-col sm:flex-row gap-4 overflow-hidden transition-colors"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border-none outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Laboratory</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border-none outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse border border-slate-100 dark:border-slate-700 h-72"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          <p className="font-semibold">Failed to load resources.</p>
          <p className="text-sm">{error?.message || "An unexpected error occurred."}</p>
        </div>
      ) : !resources || resources.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
          <MdSearch className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No facilities found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <motion.div 
              key={resource.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedResource(resource)}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors duration-300 flex flex-col"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                {resource.imageUrl ? (
                  <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-slate-800 flex items-center justify-center">
                     <span className="text-indigo-300 dark:text-indigo-700 font-bold text-xl">{resource.type?.replace('_', ' ')}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 capitalize">
                  {resource.type?.replace('_', ' ').toLowerCase()}
                </div>
                <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md ${resource.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'}`}>
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
                     onClick={(e) => { e.stopPropagation(); handleBooking(resource); }}
                     className="w-full py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700"
            >
              <div className="h-48 sm:h-64 bg-slate-200 dark:bg-slate-700 relative flex-shrink-0">
                {selectedResource.imageUrl ? (
                  <img src={selectedResource.imageUrl} alt={selectedResource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <MdEventAvailable className="text-white/30 text-6xl" />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur transition-colors"
                >
                  <MdClose />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedResource.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'}`}>
                    {selectedResource.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 capitalize">
                    {selectedResource.type?.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{selectedResource.name}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
                  <MdLocationOn className="text-lg" /> {selectedResource.location || 'No location given'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-2"><MdPeople /> Capacity</div>
                    <div className="text-slate-800 dark:text-slate-200 font-bold text-xl">{selectedResource.capacity || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-2"><MdInfoOutline /> Amenities</div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium text-sm line-clamp-2">
                      {selectedResource.amenities || 'Standard'}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedResource.description || 'No description available for this facility.'}
                  </p>
                </div>

                <button 
                  onClick={() => handleBooking(selectedResource)}
                  disabled={selectedResource.status !== 'AVAILABLE'}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 dark:disabled:text-slate-400 font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                >
                  {selectedResource.status === 'AVAILABLE' ? 'Book this Facility' : 'Currently Unavailable'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitiesPage;
