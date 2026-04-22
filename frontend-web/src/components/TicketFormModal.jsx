import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose, MdReportProblem, MdSubject, MdContactMail } from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useCreateTicket } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';

const initialState = {
  resourceId: '',
  category: 'FACILITY_ISSUE',
  description: '',
  priority: 'MEDIUM',
  preferredContact: '',
};

const TicketFormModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const { data: resourcePage } = useResources();
  const createTicket = useCreateTicket();
  const { authUser } = useAuth();
  const resources = resourcePage?.content || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!authUser?.id) {
      setError('Please sign in before creating a ticket.');
      return;
    }

    if (!form.description.trim()) {
      setError('Please describe the issue before submitting.');
      return;
    }

    try {
      await createTicket.mutateAsync({
        userId: authUser.id,
        resourceId: form.resourceId ? Number(form.resourceId) : null,
        category: form.category,
        description: form.description,
        priority: form.priority,
        preferredContact: form.preferredContact,
      });
      onClose();
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Unable to create ticket right now.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 shadow-2xl shadow-slate-900/20"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700/50 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">Report issue</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">Create a new ticket</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell us what needs attention and we’ll track it from here.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Room</span>
                <select
                  name="resourceId"
                  value={form.resourceId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  <option value="">Select a room</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {resource.location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</span>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="FACILITY_ISSUE">Facility issue</option>
                <option value="EQUIPMENT_FAULT">Equipment fault</option>
                <option value="IT_NETWORK">IT / network</option>
                <option value="SAFETY_HAZARD">Safety hazard</option>
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</span>
              <div className="relative">
                <MdSubject className="pointer-events-none absolute left-4 top-4 text-slate-400" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the issue, what you observed, and any urgent details..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Preferred contact</span>
              <div className="relative">
                <MdContactMail className="pointer-events-none absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  name="preferredContact"
                  value={form.preferredContact}
                  onChange={handleChange}
                  placeholder="Email, phone, or extension"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-11 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/50 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTicket.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MdReportProblem className="text-lg" />
                {createTicket.isPending ? 'Submitting...' : 'Create ticket'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketFormModal;
