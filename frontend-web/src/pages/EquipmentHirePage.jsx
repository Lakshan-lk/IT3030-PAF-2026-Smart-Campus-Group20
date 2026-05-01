<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdAdd, MdFilterList, MdEvent, MdHistory, MdCancel as MdCancelIcon, MdHourglassEmpty } from 'react-icons/md';
import { useEquipmentBookings, useCancelEquipmentBooking } from '../hooks/useEquipmentBookings';
import { useAuth } from '../context/AuthContext';
import EquipmentBookingForm from '../components/EquipmentBookingForm';
import BookingCard from '../components/BookingCard';

const EquipmentHirePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, isSeries: false });
  
  useEffect(() => {
    if (location.state?.resourceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      const shouldOpen = true;
      if (shouldOpen) setShowForm(true);
    }
  }, [location.state?.resourceId]);

  const { data: bookings = [], isLoading, error, refetch } = useEquipmentBookings(
    authUser?.id ? { userId: authUser.id } : {}
  );
  const cancelBooking = useCancelEquipmentBooking();

  const groupedBookings = React.useMemo(() => {
    const now = new Date();
    const pending = [];
    const upcoming = [];
    const past = [];
    const cancelled = [];

    bookings.forEach(booking => {
      const startTime = new Date(booking.startTime);
      if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
        cancelled.push(booking);
      } else if (booking.status === 'PENDING') {
        pending.push(booking);
      } else if (startTime < now) {
        past.push(booking);
      } else {
        upcoming.push(booking);
      }
    });

    const sortByTime = (a, b) => new Date(a.startTime) - new Date(b.startTime);

    return {
      pending: pending.sort(sortByTime),
      upcoming: upcoming.sort(sortByTime),
      past: past.sort(sortByTime).reverse(),
      cancelled: cancelled.sort(sortByTime).reverse(),
    };
  }, [bookings]);

  const displayBookings = activeTab === 'pending' ? groupedBookings.pending
    : activeTab === 'upcoming' ? groupedBookings.upcoming
    : activeTab === 'past' ? groupedBookings.past
    : groupedBookings.cancelled;

  const tabs = [
    { key: 'pending',  label: 'Pending',  icon: MdHourglassEmpty, count: groupedBookings.pending.length },
    { key: 'upcoming', label: 'Confirmed', icon: MdEvent,          count: groupedBookings.upcoming.length },
    { key: 'past',     label: 'Past',      icon: MdHistory,        count: groupedBookings.past.length },
    { key: 'cancelled', label: 'Cancelled', icon: MdCancelIcon,   count: groupedBookings.cancelled.length },
  ];

  const handleCancel = (bookingId) => {
    setCancelModal({ open: true, bookingId, isSeries: false });
  };

  const handleCancelSeries = (groupId) => {
    setCancelModal({ open: true, bookingId: groupId, isSeries: true });
  };

  const confirmCancel = async () => {
    try {
      await cancelBooking.mutateAsync(cancelModal.bookingId);
      setCancelModal({ open: false, bookingId: null, isSeries: false });
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  return (
    <div className="relative">
      <div className="absolute -top-20 -right-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -left-20 w-72 h-72 bg-orange-200/15 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">My Bookings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View and manage your reservations</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
          >
            <MdAdd className="text-xl" />
            <span className="text-sm">Hire Equipment</span>
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                    : 'bg-white/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="text-lg" />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key 
                    ? 'bg-white/20 dark:bg-slate-800/30' 
                    : 'bg-slate-100 dark:bg-slate-700/50'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-700/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                <MdFilterList className="text-3xl text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Unable to load bookings</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please check your connection and try again</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : displayBookings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                {activeTab === 'pending'   ? <MdHourglassEmpty className="text-3xl text-amber-400" />
                  : activeTab === 'upcoming' ? <MdAdd className="text-3xl text-slate-400" />
                  : activeTab === 'past'     ? <MdHistory className="text-3xl text-slate-400" />
                  : <MdCancelIcon className="text-3xl text-slate-400" />}
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeTab === 'pending' ? 'No pending bookings' : `No ${activeTab} bookings`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeTab === 'pending'   ? 'All your bookings have been reviewed'
                  : activeTab === 'upcoming' ? 'Book a facility to get started'
                  : `You don't have any ${activeTab} bookings`}
              </p>
            </div>
          ) : (
            displayBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={{ ...booking, resourceName: booking.equipmentName }}
                onCancel={handleCancel}
                onCancelSeries={handleCancelSeries}
              />
            ))
          )}
        </motion.div>
      </div>

      <EquipmentBookingForm 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false);
          if (location.state?.resourceId) {
            navigate('/bookings', { replace: true, state: {} });
          }
        }} 
        initialResourceId={location.state?.resourceId || ''}
      />

      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCancelModal({ open: false, bookingId: null, isSeries: false })} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {cancelModal.isSeries 
                ? 'This will cancel all recurring bookings in this series. This action cannot be undone.'
                : 'This will cancel this booking. This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, bookingId: null, isSeries: false })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelBooking.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {cancelModal.isSeries 
                  ? 'Cancel All'
                  : (cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
=======
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdSearch, MdCheckCircle, MdCategory } from 'react-icons/md';
import { useAllEquipment } from '../hooks/useEquipment';
import HireModal from '../components/HireModal';
import { getCampusStatusMeta, isCampusStatusAvailable } from '../utils/status';

const EquipmentHirePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: equipmentData, isLoading, isError } = useAllEquipment();

  const hiringEquipment = useMemo(() => {
    const list = equipmentData?.content || equipmentData || [];
    return list.filter(item => item.hiringEquipment);
  }, [equipmentData]);

  const uniqueTypes = useMemo(() => {
    const types = new Set();
    hiringEquipment.forEach(item => {
      if (item.hireType) types.add(item.hireType);
    });
    return Array.from(types);
  }, [hiringEquipment]);

  const filteredEquipment = useMemo(() => {
    return hiringEquipment.filter(item => {
      const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !filterType || item.hireType === filterType;
      return matchSearch && matchType;
    });
  }, [hiringEquipment, searchTerm, filterType]);

  const handleHireSuccess = () => {
    setSuccessMessage('Hire request submitted successfully!');
    setSelectedEquipment(null);
    setTimeout(() => { setSuccessMessage(''); }, 3000);
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Equipment Hire</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search equipment..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
           <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
           <select
             value={filterType}
             onChange={e => setFilterType(e.target.value)}
             className="w-full bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all appearance-none"
           >
             <option value="">All Types</option>
             {uniqueTypes.map(type => (
               <option key={type} value={type}>{type}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">Failed to load equipment.</div>
      ) : filteredEquipment.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No equipment found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map(item => {
            const statusMeta = getCampusStatusMeta(item.status);
            const isAvailable = isCampusStatusAvailable(item.status);

            return (
              <motion.div key={item.id} whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-100 dark:bg-slate-700 relative">
                  {item.imageUrls?.length > 0 ? (
                    <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-slate-800/90 rounded text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm backdrop-blur-sm">
                    {item.hireType || 'Equipment'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{item.description || 'No description available'}</p>
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${statusMeta.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </span>
                    <button
                      onClick={() => setSelectedEquipment(item)}
                      disabled={!isAvailable}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {isAvailable ? 'Hire' : statusMeta.label}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedEquipment && (
          <HireModal
            equipment={selectedEquipment}
            onClose={() => setSelectedEquipment(null)}
            onSuccess={handleHireSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl font-medium">
              <MdCheckCircle className="text-xl" />
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
    </div>
  );
};

export default EquipmentHirePage;
