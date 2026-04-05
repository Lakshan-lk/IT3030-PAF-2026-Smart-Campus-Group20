import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheck, MdClose, MdCancel, MdSearch, MdEvent, MdPending, MdVerified, MdOutlineCancel } from 'react-icons/md';
import { useBookings, useApproveBooking, useRejectBooking, useCancelBooking } from '../hooks/useBookings';

const AdminDashboardPage = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelBooking();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'pending') return b.status === 'PENDING';
    if (activeTab === 'approved') return b.status === 'APPROVED';
    if (activeTab === 'rejected') return b.status === 'REJECTED';
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  }).filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.resourceName?.toLowerCase().includes(q) ||
           b.userName?.toLowerCase().includes(q) ||
           b.purpose?.toLowerCase().includes(q);
  });

  const tabs = [
    { key: 'all', label: 'All', count: stats.total, color: 'bg-slate-600' },
    { key: 'pending', label: 'Pending', count: stats.pending, color: 'bg-amber-500' },
    { key: 'approved', label: 'Approved', count: stats.approved, color: 'bg-emerald-500' },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'bg-rose-500' },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled, color: 'bg-slate-400' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <div className="relative">
      <div className="absolute -top-20 -right-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage bookings, approvals, and campus resources</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: <MdEvent />, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-700/40', border: 'border-slate-200/60 dark:border-slate-600/40' },
            { label: 'Pending', value: stats.pending, icon: <MdPending />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-900/15', border: 'border-amber-200/60 dark:border-amber-700/40' },
            { label: 'Approved', value: stats.approved, icon: <MdVerified />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-900/15', border: 'border-emerald-200/60 dark:border-emerald-700/40' },
            { label: 'Rejected', value: stats.rejected, icon: <MdClose />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/80 dark:bg-rose-900/15', border: 'border-rose-200/60 dark:border-rose-700/40' },
            { label: 'Cancelled', value: stats.cancelled, icon: <MdOutlineCancel />, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50/80 dark:bg-slate-700/40', border: 'border-slate-200/60 dark:border-slate-600/40' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`${stat.bg} border ${stat.border} rounded-2xl p-4 flex items-center gap-3`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/60 dark:bg-slate-800/40 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-extrabold ${stat.color}`}>{isLoading ? '...' : stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {stats.pending > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-700/30 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <MdPending className="text-amber-500 text-xl" />
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300">Pending Approvals</h2>
              <span className="ml-auto text-xs font-bold bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full">{stats.pending} awaiting review</span>
            </div>
            <div className="space-y-3">
              {pendingBookings.map(booking => (
                <div key={booking.id} className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/50 rounded-xl p-4 border border-amber-100 dark:border-amber-800/20">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{booking.resourceName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{booking.purpose} — {booking.userName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{booking.formattedStartTime} → {booking.formattedEndTime}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveBooking.mutate(booking.id)}
                      disabled={approveBooking.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
                    >
                      <MdCheck className="text-sm" /> Approve
                    </button>
                    <button
                      onClick={() => rejectBooking.mutate(booking.id)}
                      disabled={rejectBooking.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-all shadow-sm shadow-rose-500/25 active:scale-95 disabled:opacity-50"
                    >
                      <MdClose className="text-sm" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/40">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.key
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                        : 'bg-white dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`w-5 h-5 rounded-full ${activeTab === tab.key ? 'bg-white/20 dark:bg-slate-800/30' : 'bg-slate-100 dark:bg-slate-600/50'} flex items-center justify-center text-[10px] font-black`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 dark:focus:border-amber-400 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-40" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-20" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
                  </div>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                  <MdEvent className="text-3xl text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No bookings found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery ? 'Try adjusting your search' : `No ${activeTab === 'all' ? '' : activeTab} bookings to display`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700/40">
                      <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      const statusColors = {
                        PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-400' },
                        APPROVED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', dot: 'bg-emerald-400' },
                        REJECTED: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40', dot: 'bg-rose-400' },
                        CANCELLED: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600/50', dot: 'bg-slate-400' },
                      };
                      const colors = statusColors[booking.status] || statusColors.PENDING;

                      return (
                        <motion.tr
                          key={booking.id}
                          variants={rowVariants}
                          className="border-b border-slate-50 dark:border-slate-700/20 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                        >
                          <td className="p-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{booking.resourceName}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">{booking.userName}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{booking.purpose}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{booking.formattedStartTime}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">to {booking.formattedEndTime}</p>
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
                                </>
                              )}
                              {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
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
      </div>
    </div>
  );
};

export default AdminDashboardPage;
