import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  MdBuild, MdSearch, MdFilterAlt, MdClose, MdTune, MdWarning,
  MdCheckCircle, MdPending, MdComment, MdPersonPin,
  MdRefresh,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useTickets, useTicketById, useUpdateTicketStatus } from '../hooks/useTickets';
import CommentThread from '../components/CommentThread';
import { resolveMediaUrl } from '../utils/media';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  IN_PROGRESS: {
    label: 'In Progress',
    accent: 'from-sky-400 to-cyan-400',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  RESOLVED: {
    label: 'Resolved',
    accent: 'from-emerald-400 to-teal-400',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

const PRIORITY_BADGE = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(value));
}

// ─── Ticket detail panel (slide-in) ───────────────────────────────────────────
const TicketDetailPanel = ({ ticketId, onClose }) => {
  const { data: ticket, isLoading } = useTicketById(ticketId);
  const updateStatus = useUpdateTicketStatus();

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const canMarkResolved = ticket?.status === 'IN_PROGRESS';

  const handleMarkResolved = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await updateStatus.mutateAsync({
        id: ticketId,
        data: { status: 'RESOLVED', resolutionNotes },
      });
      setSuccessMsg('Ticket marked as resolved ✅');
      setResolutionNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update ticket status.');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/70 px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500">Ticket details</p>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {ticket?.equipmentName || ticket?.resourceName || 'General Ticket'}
            </h2>
            {ticket && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ticket #{ticket.id} · Reported by {ticket.userName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-600"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Left: ticket info + comments */}
          <div className="space-y-5">
            {(error || successMsg) && (
              <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${successMsg ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-300'}`}>
                <MdWarning className="mt-0.5 text-xl shrink-0" />
                <span>{error || successMsg}</span>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />)}
              </div>
            ) : ticket ? (
              <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/60 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${STATUS_CONFIG[ticket.status]?.badge || 'bg-slate-100 text-slate-600'}`}>
                    {ticket.status?.replace('_', ' ')}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${PRIORITY_BADGE[ticket.priority] || ''}`}>
                    {ticket.priority}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">
                    {ticket.category?.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{ticket.description}</p>

                {ticket.attachments?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attachments</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {ticket.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={resolveMediaUrl(attachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="group overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/50"
                        >
                          <img
                            src={resolveMediaUrl(attachment.url)}
                            alt={attachment.fileName || 'Attachment'}
                            className="h-24 w-full object-cover transition group-hover:scale-[1.03]"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Reported by</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{ticket.userName || 'Unknown'}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ticket.preferredContact || 'No contact'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Location</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{ticket.resourceName || 'Not specified'}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>

                {ticket.resolutionNotes && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Resolution notes</p>
                    <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{ticket.resolutionNotes}</p>
                  </div>
                )}
              </section>
            ) : null}

            <CommentThread ticketId={ticketId} />
          </div>

          {/* Right: status update */}
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/60 p-5">
              <div className="mb-4 flex items-center gap-3">
                <MdTune className="text-2xl text-cyan-500" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Workflow</p>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mark as Resolved</h3>
                </div>
              </div>

              {canMarkResolved ? (
                <form onSubmit={handleMarkResolved} className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resolution notes</span>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={5}
                      placeholder="Describe what you fixed, parts replaced, steps taken..."
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={updateStatus.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                  >
                    <MdCheckCircle className="text-lg" />
                    {updateStatus.isPending ? 'Submitting...' : 'Mark as Resolved'}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {ticket?.status === 'RESOLVED'
                    ? '✅ This ticket has been resolved.'
                    : 'This action is not available for the current status.'}
                </div>
              )}
            </section>

            {/* Quick info card */}
            <section className="rounded-3xl border border-cyan-200/60 dark:border-cyan-800/30 bg-cyan-50/60 dark:bg-cyan-900/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 mb-3">Workflow guide</p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><MdPending className="text-sky-500 mt-0.5 shrink-0" /><span>Your tickets are already <b>IN_PROGRESS</b> when assigned.</span></li>
                <li className="flex items-start gap-2"><MdComment className="text-cyan-500 mt-0.5 shrink-0" /><span>Add comments to log your progress while working.</span></li>
                <li className="flex items-start gap-2"><MdCheckCircle className="text-emerald-500 mt-0.5 shrink-0" /><span>Once fixed, mark the ticket as <b>RESOLVED</b> with notes.</span></li>
                <li className="flex items-start gap-2"><MdPersonPin className="text-slate-400 mt-0.5 shrink-0" /><span>Admin will review and close the ticket.</span></li>
              </ul>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Ticket card ──────────────────────────────────────────────────────────────
const TechTicketCard = ({ ticket, onClick }) => {
  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.IN_PROGRESS;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-4 shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700/50 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">#{ticket.id}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${cfg.badge}`}>
          {ticket.status?.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 mb-3">
        {ticket.description}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${PRIORITY_BADGE[ticket.priority] || ''}`}>
          {ticket.priority}
        </span>
        <span className="text-xs text-slate-400">
          {ticket.equipmentName || ticket.resourceName || 'No asset'}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{formatDate(ticket.createdAt)}</p>
    </motion.button>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const TechnicianTicketsPage = () => {
  const { authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter !== 'ALL') p.status = statusFilter;
    // Filter by assigned-to using the technician's DB user id if available
    if (authUser?.id) p.assignedTo = authUser.id;
    return p;
  }, [statusFilter, authUser]);

  const { data: tickets = [], isLoading, error } = useTickets(queryParams);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) =>
      [t.description, t.resourceName, t.category, t.priority]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [tickets, searchTerm]);

  const grouped = useMemo(() => ({
    IN_PROGRESS: filtered.filter((t) => t.status === 'IN_PROGRESS'),
    RESOLVED: filtered.filter((t) => t.status === 'RESOLVED'),
  }), [filtered]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Decorative blobs */}
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl pointer-events-none" />
      <div className="absolute top-16 -left-20 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl pointer-events-none" />

      {/* Page header */}
      <div className="relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">Technician portal</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-50">My Assigned Tickets</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              View and resolve tickets assigned to you. Add work-log comments while you work, then mark as resolved when done.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/70"
          >
            <MdRefresh className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 p-4 backdrop-blur-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MdSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by description, room, category..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 lg:w-48"
        >
          <option value="ALL">All statuses</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Summary counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <MdFilterAlt className="text-base" />
          <span>{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} found</span>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
            {grouped.IN_PROGRESS.length} in progress
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            {grouped.RESOLVED.length} resolved
          </span>
        </div>
      </div>

      {/* Ticket board */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
          Unable to load your tickets right now.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 px-6 py-16 text-center">
          <MdBuild className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">No tickets assigned to you yet</p>
          <p className="mt-1 text-sm text-slate-400">When the admin assigns a ticket to you, it will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => {
            const group = grouped[statusKey];
            if (group.length === 0 && statusFilter !== 'ALL' && statusFilter !== statusKey) return null;
            return (
              <section key={statusKey} className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-100">{cfg.label}</h2>
                    <div className={`mt-1.5 h-1.5 w-12 rounded-full bg-gradient-to-r ${cfg.accent}`} />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700/50 px-3 py-1 text-xs font-black text-slate-500 dark:text-slate-300">
                    {group.length}
                  </span>
                </div>
                {group.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 px-4 py-8 text-center text-sm text-slate-400">
                    No {cfg.label.toLowerCase()} tickets
                  </div>
                ) : (
                  <div className="space-y-3">
                    {group.map((ticket) => (
                      <TechTicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => setSelectedTicketId(ticket.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedTicketId && (
          <TicketDetailPanel
            key={selectedTicketId}
            ticketId={selectedTicketId}
            onClose={() => setSelectedTicketId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicianTicketsPage;
