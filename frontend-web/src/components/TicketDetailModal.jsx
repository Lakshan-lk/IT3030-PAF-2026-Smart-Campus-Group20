import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdCheckCircle, MdClose, MdPersonAdd, MdTune, MdWarning } from 'react-icons/md';
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
  const currentRole = (authUser?.role || '').toLowerCase();
  const canManageTickets = currentRole === 'admin' || currentRole === 'technician';
  const canAssignTechnician = currentRole === 'admin';

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

  const currentStatus = availableStatusOptions.includes(statusForm.status)
    ? statusForm.status
    : (availableStatusOptions[0] || statusForm.status);
  const canReopenTicket = currentRole === 'admin' && ticket?.status === 'RESOLVED';
  const assignedTechnician = ticket?.assignedToName || ticket?.assignedTo?.name || '';

  if (!isOpen) {
    return null;
  }

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await updateStatus.mutateAsync({
        id: ticketId,
        data: {
          ...statusForm,
          status: currentStatus,
        },
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

  const handleReopen = async () => {
    setError('');

    try {
      await updateStatus.mutateAsync({
        id: ticketId,
        data: { status: 'OPEN' },
      });
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Could not reopen the ticket.');
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
              <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-800/60 p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <MdTune className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Action Center</p>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Status Update</h3>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700/50" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                  </div>
                ) : canManageTickets && availableStatusOptions.length > 0 ? (
                  <form onSubmit={handleStatusUpdate} className="space-y-5">
                    <div className="space-y-4">
                      <label className="block space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Status</span>
                        <div className="relative">
                          <select
                            value={currentStatus}
                            onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))}
                            className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"
                          >
                            {availableStatusOptions.map((status) => (
                              <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <MdTune />
                          </div>
                        </div>
                      </label>

                      {currentStatus === 'REJECTED' && (
                        <label className="block space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Rejection Reason (Required)</span>
                          <textarea
                            value={statusForm.reason}
                            onChange={(event) => setStatusForm((current) => ({ ...current, reason: event.target.value }))}
                            rows={3}
                            required
                            placeholder="Explain why this ticket is being rejected..."
                            className="w-full rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10"
                          />
                        </label>
                      )}

                      {(currentStatus === 'RESOLVED' || currentStatus === 'CLOSED') && (
                        <label className="block space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 font-semibold">Resolution Notes (Required)</span>
                          <textarea
                            value={statusForm.resolutionNotes}
                            onChange={(event) => setStatusForm((current) => ({ ...current, resolutionNotes: event.target.value }))}
                            rows={4}
                            required
                            placeholder="Detail the work performed, parts used, and final result..."
                            className="w-full rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                          />
                        </label>
                      )}

                      {canReopenTicket && (
                        <button
                          type="button"
                          onClick={handleReopen}
                          disabled={updateStatus.isPending}
                          className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updateStatus.isPending ? 'Reopening...' : 'Reopen to Open'}
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={updateStatus.isPending}
                      className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updateStatus.isPending ? 'Processing...' : `Update to ${currentStatus.replace('_', ' ')}`}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 px-4 py-10 text-center">
                    <MdCheckCircle className="text-4xl text-slate-200 dark:text-slate-700 mb-3" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[200px]">
                      {canManageTickets
                        ? 'This ticket is in a final state and cannot be modified.'
                        : 'You do not have permission to change this ticket status.'}
                    </p>
                  </div>
                )}
              </section>

              {canAssignTechnician && (
                <section className="rounded-3xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm dark:bg-slate-800">
                      <MdPersonAdd className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-600/70 dark:text-amber-400/70">Resource Dispatch</p>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Assign Technician</h3>
                    </div>
                  </div>

                  {assignedTechnician ? (
                    <div className="rounded-2xl border border-amber-200/70 dark:border-amber-700/40 bg-white/70 dark:bg-slate-900/30 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-300">Assigned technician</p>
                      <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{assignedTechnician}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        This ticket is already assigned, so the technician panel is read only.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleAssign} className="space-y-4">
                      <label className="block space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Specialist</span>
                        <div className="relative">
                          <select
                            value={assigneeId}
                            onChange={(event) => setAssigneeId(event.target.value)}
                            className="w-full appearance-none rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                          >
                            <option value="">-- Select Specialist --</option>
                            {technicianOptions.map((option) => (
                              <option key={option.id} value={option.id}>{option.name} ({option.profession || 'Technician'})</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/50">
                            <MdPersonAdd />
                          </div>
                        </div>
                      </label>

                      <button
                        type="submit"
                        disabled={assignTicket.isPending || !assigneeId}
                        className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {assignTicket.isPending ? 'Dispatching...' : 'Assign & Dispatch'}
                      </button>
                    </form>
                  )}
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
