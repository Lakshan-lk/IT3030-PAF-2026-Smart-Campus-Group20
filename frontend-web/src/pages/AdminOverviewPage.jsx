import React from 'react';
import { motion } from 'framer-motion';
import { MdEvent, MdPending, MdVerified, MdClose, MdOutlineCancel } from 'react-icons/md';
import { MdCheck } from 'react-icons/md';
import { useBookings, useApproveBooking, useRejectBooking } from '../hooks/useBookings';

const AdminOverviewPage = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  return (
    <div>
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
          className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-700/30 rounded-2xl"
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

      {stats.pending === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-12 text-center bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <MdVerified className="text-3xl text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">All caught up!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">No pending bookings to review</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminOverviewPage;
