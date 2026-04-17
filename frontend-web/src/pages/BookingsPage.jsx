import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdFilterList, MdCheck, MdClose, MdCancel, MdSearch } from 'react-icons/md';
import { useBookings, useApproveBooking, useRejectBooking, useCancelBooking } from '../hooks/useBookings';
import NewBookingForm from '../components/NewBookingForm';

const BookingsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings = [], isLoading, error } = useBookings();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelBooking();

  const statusColors = {
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-400' },
    APPROVED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', dot: 'bg-emerald-400' },
    REJECTED: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40', dot: 'bg-rose-400' },
    CANCELLED: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600/50', dot: 'bg-slate-400' },
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      b.resourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Bookings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage and track campus resource reservations</p>
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
              placeholder="Search by resource, purpose, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                    : 'bg-white/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-20" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                <MdClose className="text-3xl text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Unable to load bookings</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please check your connection and try again</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                <MdFilterList className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No bookings found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery || filterStatus !== 'ALL' ? 'Try adjusting your filters' : 'Create your first booking to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/40">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const colors = statusColors[booking.status] || statusColors.PENDING;
                    return (
                      <motion.tr
                        key={booking.id}
                        variants={rowVariants}
                        className="border-b border-slate-50 dark:border-slate-700/20 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{booking.resourceName}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">by {booking.userName}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{booking.purpose}</p>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{booking.formattedStartTime}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">to {booking.formattedEndTime}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-bold`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => approveBooking.mutate(booking.id)}
                                  className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                  title="Approve"
                                >
                                  <MdCheck className="text-lg" />
                                </button>
                                <button
                                  onClick={() => rejectBooking.mutate(booking.id)}
                                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                  title="Reject"
                                >
                                  <MdClose className="text-lg" />
                                </button>
                                <button
                                  onClick={() => cancelBooking.mutate(booking.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                  title="Cancel"
                                >
                                  <MdCancel className="text-lg" />
                                </button>
                              </>
                            )}
                            {booking.status === 'APPROVED' && (
                              <button
                                onClick={() => cancelBooking.mutate(booking.id)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                title="Cancel"
                              >
                                <MdCancel className="text-lg" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <NewBookingForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};

export default BookingsPage;
