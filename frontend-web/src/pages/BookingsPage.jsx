import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdFilterList, MdEvent, MdHistory, MdCancel, MdSearch } from 'react-icons/md';
import { useBookings, useCancelBooking, useCancelSeries } from '../hooks/useBookings';
import NewBookingForm from '../components/NewBookingForm';
import BookingCard from '../components/BookingCard';

const BookingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showTab, setShowTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Open modal if navigated with resourceId
  useEffect(() => {
    if (location.state?.resourceId) {
      setShowForm(true);
    }
  }, [location.state]);

  const { data: bookings = [], isLoading, error, refetch } = useBookings();
  const cancelBooking = useCancelBooking();
  const cancelSeries = useCancelSeries();

  const handleCancel = async (id) => {
    try {
      await cancelBooking.mutateAsync(id);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleCancelSeries = async (groupId) => {
    try {
      await cancelSeries.mutateAsync(groupId);
    } catch (err) {
      console.error('Failed to cancel series:', err);
    }
  };

  const groupedBookings = useMemo(() => {
    const now = new Date();
    
    const upcoming = bookings.filter(b => {
      const startTime = new Date(b.startTime);
      return (b.status === 'PENDING' || b.status === 'APPROVED') && startTime >= now;
    });
    
    const past = bookings.filter(b => {
      const endTime = new Date(b.endTime);
      return (b.status === 'PENDING' || b.status === 'APPROVED') && endTime < now;
    });
    
    const cancelled = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED');
    
    return { upcoming, past, cancelled };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let list = groupedBookings[showTab] || [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.resourceName?.toLowerCase().includes(q) ||
        b.purpose?.toLowerCase().includes(q)
      );
    }
    
    return list;
  }, [groupedBookings, showTab, searchQuery]);

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: MdEvent, count: groupedBookings.upcoming.length },
    { key: 'past', label: 'Past', icon: MdHistory, count: groupedBookings.past.length },
    { key: 'cancelled', label: 'Cancelled', icon: MdCancel, count: groupedBookings.cancelled.length },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <div className="relative">
      <div className="absolute -top-20 -right-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -left-20 w-72 h-72 bg-orange-200/15 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">My Bookings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View and manage your room reservations</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
          >
            <MdAdd className="text-xl" />
            <span className="text-sm">New Booking</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by resource or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setShowTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  showTab === tab.key
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                    : 'bg-white/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="text-lg" />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  showTab === tab.key 
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
          className="space-y-4"
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
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                <MdFilterList className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No bookings found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try adjusting your search' : showTab === 'upcoming' ? 'Create your first booking to get started' : `No ${showTab} bookings`}
              </p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <motion.div key={booking.id} variants={rowVariants}>
                <BookingCard 
                  booking={booking} 
                  onCancel={handleCancel}
                  onCancelSeries={handleCancelSeries}
                  isAdminView={false}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <NewBookingForm 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false);
          // clear the state so refreshing doesn't reopen modal
          if (location.state?.resourceId) {
            navigate('/bookings', { replace: true, state: {} });
          }
        }} 
        initialResourceId={location.state?.resourceId || ''}
      />
    </div>
  );
};

export default BookingsPage;