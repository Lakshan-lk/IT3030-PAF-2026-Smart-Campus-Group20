import React from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdClose, MdEvent, MdPending, MdVerified, MdOutlineCancel, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { useBookings, useApproveBooking, useRejectBooking } from '../hooks/useBookings';
import { useTickets } from '../hooks/useTickets';

const AdminOverviewPage = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets();
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
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
    closed: tickets.filter((ticket) => ticket.status === 'CLOSED').length,
    rejected: tickets.filter((ticket) => ticket.status === 'REJECTED').length,
  };
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const approvalRate = stats.approved + stats.rejected > 0
    ? Math.round((stats.approved / (stats.approved + stats.rejected)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: <MdEvent />, accent: 'border-l-slate-400', bg: 'bg-slate-50/80 dark:bg-slate-800/40' },
          { label: 'Pending', value: stats.pending, icon: <MdPending />, accent: 'border-l-amber-400', bg: 'bg-amber-50/60 dark:bg-amber-900/10' },
          { label: 'Approved', value: stats.approved, icon: <MdVerified />, accent: 'border-l-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-900/10' },
          { label: 'Rejected', value: stats.rejected, icon: <MdClose />, accent: 'border-l-rose-400', bg: 'bg-rose-50/60 dark:bg-rose-900/10' },
          { label: 'Cancelled', value: stats.cancelled, icon: <MdOutlineCancel />, accent: 'border-l-slate-300 dark:border-l-slate-600', bg: 'bg-slate-50/60 dark:bg-slate-800/40' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${stat.bg} border border-slate-200/60 dark:border-slate-700/40 border-l-4 ${stat.accent} rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</span>
              <div className="w-7 h-7 rounded-lg bg-white/60 dark:bg-slate-700/40 flex items-center justify-center text-slate-500 dark:text-slate-400">
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {isLoading ? (
                <span className="inline-block w-10 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Tickets', value: ticketStats.total, icon: <MdEvent />, accent: 'border-l-slate-400', bg: 'bg-slate-50/80 dark:bg-slate-800/40' },
          { label: 'Open', value: ticketStats.open, icon: <MdPending />, accent: 'border-l-amber-400', bg: 'bg-amber-50/60 dark:bg-amber-900/10' },
          { label: 'In Progress', value: ticketStats.inProgress, icon: <MdEvent />, accent: 'border-l-sky-400', bg: 'bg-sky-50/60 dark:bg-sky-900/10' },
          { label: 'Resolved', value: ticketStats.resolved, icon: <MdVerified />, accent: 'border-l-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-900/10' },
          { label: 'Closed', value: ticketStats.closed, icon: <MdCheck />, accent: 'border-l-slate-300 dark:border-l-slate-600', bg: 'bg-slate-50/60 dark:bg-slate-800/40' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${stat.bg} border border-slate-200/60 dark:border-slate-700/40 border-l-4 ${stat.accent} rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</span>
              <div className="w-7 h-7 rounded-lg bg-white/60 dark:bg-slate-700/40 flex items-center justify-center text-slate-500 dark:text-slate-400">
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {ticketsLoading ? (
                <span className="inline-block w-10 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                {stats.pending > 0 && (
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping opacity-60" />
                )}
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Pending Approvals</h2>
              {stats.pending > 0 && (
                <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </div>
          </div>

          {stats.pending === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/40 dark:border-emerald-800/30 flex items-center justify-center">
                <MdVerified className="text-2xl text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">All clear</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">No pending bookings to review</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700/30">
              {pendingBookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/40 dark:border-amber-800/30 flex items-center justify-center flex-shrink-0">
                      <MdEvent className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{booking.resourceName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{booking.purpose}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => approveBooking.mutate(booking.id)}
                            disabled={approveBooking.isPending}
                            className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200/60 dark:hover:border-emerald-800/40 transition-all active:scale-90 disabled:opacity-50"
                          >
                            <MdCheck className="text-lg" />
                          </button>
                          <button
                            onClick={() => rejectBooking.mutate(booking.id)}
                            disabled={rejectBooking.isPending}
                            className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200/60 dark:hover:border-rose-800/40 transition-all active:scale-90 disabled:opacity-50"
                          >
                            <MdClose className="text-lg" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">{booking.formattedStartTime}</span>
                        <span className="text-[11px] text-slate-300 dark:text-slate-600">→</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">{booking.formattedEndTime}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{booking.userName}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="space-y-4"
        >
          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Approval Rate</h3>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{approvalRate}%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mb-1">of decided</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${approvalRate}%` }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <MdArrowUpward className="text-sm" /> {stats.approved} approved
              </span>
              <span className="text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1">
                <MdArrowDownward className="text-sm" /> {stats.rejected} rejected
              </span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Recent Tickets</h3>
            <div className="space-y-3">
              {ticketsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
                  ))}
                </div>
              ) : recentTickets.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No tickets in the database yet.</p>
              ) : (
                recentTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-slate-200/60 dark:border-slate-700/40 bg-slate-50/70 dark:bg-slate-800/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{ticket.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {ticket.userName || 'Unknown user'} · {ticket.status}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        #{ticket.id}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 text-white shadow-xl shadow-slate-900/20 dark:shadow-black/30">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Active (Pending + Approved)</span>
                <span className="text-lg font-black">{stats.pending + stats.approved}</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Inactive (Rejected + Cancelled)</span>
                <span className="text-lg font-black">{stats.rejected + stats.cancelled}</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Utilization</span>
                <span className="text-lg font-black">
                  {stats.total > 0 ? Math.round(((stats.pending + stats.approved) / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
