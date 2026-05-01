import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose, MdPersonAdd, MdTune, MdWarning } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { useTicketById, useUpdateTicketStatus, useAssignTicket } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import CommentThread from './CommentThread';
import { resolveMediaUrl } from '../utils/media';

const statusStyles = {
  OPEN: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  IN_PROGRESS: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
  RESOLVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  CLOSED: 'bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  REJECTED: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
};

const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function formatDate(value) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

const TicketDetailModal = ({ ticketId, isOpen, onClose }) => {
  const { data: ticket, isLoading } = useTicketById(ticketId);
  const updateStatus = useUpdateTicketStatus();
  const assignTicket = useAssignTicket();
  const { authUser } = useAuth();
  const canManageTickets = authUser?.role === 'admin' || authUser?.role === 'technician';
  const canAssignTechnician = authUser?.role === 'admin';

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
    enabled: canAssignTechnician,
  });

  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', reason: '', resolutionNotes: '' });
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');
  const technicianOptions = useMemo(
    () => users.filter((user) => (user.role || '').toUpperCase() === 'TECHNICIAN'),
    [users]
  );
  const availableStatusOptions = useMemo(() => {
    switch (ticket?.status) {
      case 'OPEN':
        return ['REJECTED']; // IN_PROGRESS happens automatically upon assignment
      case 'IN_PROGRESS':
        return ['RESOLVED', 'REJECTED'];
      case 'RESOLVED':
        return ['CLOSED'];
      case 'REJECTED':
      case 'CLOSED':
      default:
        return [];
    }
  }, [ticket?.status]);

  useEffect(() => {
    if (!availableStatusOptions.length) {
      return;
    }
    setStatusForm((current) =>
      current.status === availableStatusOptions[0]
        ? current
        : { ...current, status: availableStatusOptions[0] }
    );
  }, [availableStatusOptions]);

  if (!isOpen) {
    return null;
  }

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await updateStatus.mutateAsync({
        id: ticketId,
        data: statusForm,
      });
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Could not update ticket status.');
    }
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    setError('');

    if (!assigneeId) {
      setError('Choose a technician first.');
      return;
    }

    try {
      await assignTicket.mutateAsync({
        id: ticketId,
        assigneeId: Number(assigneeId),
      });
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Could not assign technician.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 shadow-2xl shadow-slate-900/30"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.28 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/70 px-6 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Ticket details</p>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{ticket?.resourceName || 'Ticket'}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-600 dark:hover:text-slate-100"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="grid flex-1 gap-6 overflow-y-auto p-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                  <MdWarning className="mt-0.5 text-xl shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/60 p-5">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-6 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700/50" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                  </div>
                ) : ticket ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[ticket.status] || statusStyles.OPEN}`}>{ticket.status}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${priorityStyles[ticket.priority] || priorityStyles.LOW}`}>{ticket.priority}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">{ticket.category}</span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{ticket.description}</p>

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
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{ticket.preferredContact || 'No preferred contact'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Assigned to</p>
                        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{ticket.assignedToName || 'Unassigned'}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(ticket.createdAt)}</p>
                      </div>
                    </div>
                  </>
                ) : null}
              </section>

              <CommentThread ticketId={ticketId} />
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/60 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <MdTune className="text-2xl text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Workflow</p>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Status update</h3>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700/50" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                  </div>
                ) : canManageTickets && availableStatusOptions.length > 0 ? (
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">New status</span>
                      <select
                        value={statusForm.status}
                        onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      >
                        {availableStatusOptions.map((status) => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reason / rejection note</span>
                      <textarea
                        value={statusForm.reason}
                        onChange={(event) => setStatusForm((current) => ({ ...current, reason: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resolution notes</span>
                      <textarea
                        value={statusForm.resolutionNotes}
                        onChange={(event) => setStatusForm((current) => ({ ...current, resolutionNotes: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={updateStatus.isPending}
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Update status
                    </button>
                  </form>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                    {canManageTickets
                      ? 'This ticket is already closed or rejected, so its status can no longer be changed.'
                      : 'Status management is available to admins and technicians only.'}
                  </p>
                )}
              </section>

              {canAssignTechnician && (
                <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/60 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <MdPersonAdd className="text-2xl text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Assignment</p>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Assign technician</h3>
                    </div>
                  </div>

                  <form onSubmit={handleAssign} className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Technician</span>
                      <select
                        value={assigneeId}
                        onChange={(event) => setAssigneeId(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      >
                        <option value="">Choose a technician</option>
                        {technicianOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="submit"
                      disabled={assignTicket.isPending}
                      className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Assign ticket
                    </button>
                  </form>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketDetailModal;
