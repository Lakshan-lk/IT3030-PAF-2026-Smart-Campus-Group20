import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose, MdReportProblem, MdSubject, MdContactMail, MdImage, MdDelete, MdBuild, MdRoom } from 'react-icons/md';
import { useResources } from '../hooks/useResources';
import { useAllEquipment } from '../hooks/useEquipment';
import { useCreateTicket } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../api/ticketApi';

const initialState = {
  ticketType: 'facility',   // 'facility' | 'equipment'
  resourceId: '',
  equipmentId: '',
  category: 'FACILITY_ISSUE',
  description: '',
  priority: 'MEDIUM',
  preferredContact: '',
};

const CATEGORY_OPTIONS = {
  facility: [
    { value: 'FACILITY_ISSUE',    label: 'General facility issue' },
    { value: 'CLEANING',          label: 'Cleaning required' },
    { value: 'ELECTRICAL',        label: 'Electrical problem' },
    { value: 'PLUMBING',          label: 'Plumbing issue' },
    { value: 'HVAC',              label: 'HVAC / Air conditioning' },
    { value: 'STRUCTURAL_DAMAGE', label: 'Structural damage' },
    { value: 'IT_NETWORK',        label: 'IT / Network' },
    { value: 'SOFTWARE_BUG',      label: 'Software bug' },
    { value: 'HARDWARE_FAILURE',  label: 'Hardware failure' },
    { value: 'SAFETY_HAZARD',     label: 'Safety hazard' },
    { value: 'SECURITY_CONCERN',  label: 'Security concern' },
    { value: 'NOISE_COMPLAINT',   label: 'Noise complaint' },
    { value: 'PEST_CONTROL',      label: 'Pest control' },
    { value: 'OTHER',             label: 'Other' },
  ],
  equipment: [
    { value: 'EQUIPMENT_FAULT',   label: 'Equipment fault / broken' },
    { value: 'EQUIPMENT_MISSING', label: 'Equipment missing' },
    { value: 'HARDWARE_FAILURE',  label: 'Hardware failure' },
    { value: 'SAFETY_HAZARD',     label: 'Safety hazard' },
    { value: 'OTHER',             label: 'Other' },
  ],
};

const TicketFormModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [createdTicketId, setCreatedTicketId] = useState(null);

  const { data: resourcePage } = useResources();
  const { data: equipmentPage } = useAllEquipment();
  const createTicket = useCreateTicket();
  const { authUser } = useAuth();

  const resources = resourcePage?.content || [];
  const allEquipment = Array.isArray(equipmentPage?.content) 
    ? equipmentPage.content 
    : (Array.isArray(equipmentPage) ? equipmentPage : []);
  // Only show hiring equipment in the ticket form
  const equipmentList = allEquipment.filter(e => e.isHiringEquipment || e.status === 'ACTIVE');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleTicketTypeChange = (type) => {
    setForm((current) => ({
      ...current,
      ticketType: type,
      resourceId: '',
      equipmentId: '',
      category: type === 'facility' ? 'FACILITY_ISSUE' : 'EQUIPMENT_FAULT',
    }));
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

    let ticketId = createdTicketId;

    try {
      if (!ticketId) {
        const payload = {
          userId: authUser.id,
          category: form.category,
          description: form.description,
          priority: form.priority,
          preferredContact: form.preferredContact,
        };

        if (form.ticketType === 'facility' && form.resourceId) {
          payload.resourceId = Number(form.resourceId);
        } else if (form.ticketType === 'equipment' && form.equipmentId) {
          payload.equipmentId = Number(form.equipmentId);
        }

        const response = await createTicket.mutateAsync(payload);
        ticketId = response?.data?.id;
      }

      if (ticketId && attachments.length > 0) {
        await ticketApi.uploadAttachments(ticketId, attachments.map((item) => item.file));
      }

      setForm(initialState);
      setCreatedTicketId(null);
      attachments.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setAttachments([]);
      onClose();
    } catch (mutationError) {
      const fallbackMessage = ticketId
        ? 'Unable to upload images right now. You can retry the upload.'
        : 'Unable to create ticket right now.';
      const message = mutationError.response?.data?.message || fallbackMessage;
      setError(message);
      if (ticketId) {
        setCreatedTicketId(ticketId);
      }
    }
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setError('Only image files can be attached.');
    }

    const remaining = 3 - attachments.length;
    if (remaining <= 0) {
      setError('You can upload up to 3 images per ticket.');
      return;
    }

    const nextFiles = imageFiles.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (imageFiles.length > remaining) {
      setError('You can upload up to 3 images per ticket.');
    }

    setAttachments((current) => [...current, ...nextFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleClose = () => {
    attachments.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setAttachments([]);
    setForm(initialState);
    setCreatedTicketId(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const categoryOptions = CATEGORY_OPTIONS[form.ticketType] || CATEGORY_OPTIONS.facility;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />
        <motion.div
          className="relative w-full max-w-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 shadow-2xl shadow-slate-900/20 max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700/50 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">Report issue</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">Create a new ticket</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell us what needs attention and we'll track it from here.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
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

            {/* Ticket type toggle */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ticket type</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTicketTypeChange('facility')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                    form.ticketType === 'facility'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/30'
                      : 'border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <MdRoom className="text-lg" />
                  Facility / Room
                </button>
                <button
                  type="button"
                  onClick={() => handleTicketTypeChange('equipment')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                    form.ticketType === 'equipment'
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/30'
                      : 'border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <MdBuild className="text-lg" />
                  Equipment
                </button>
              </div>
            </div>

            {/* Facility/Equipment selector + Priority */}
            <div className="grid gap-4 md:grid-cols-2">
              {form.ticketType === 'facility' ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Room / Facility</span>
                  <select
                    name="resourceId"
                    value={form.resourceId}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  >
                    <option value="">Select a room</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} — {resource.location}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Equipment</span>
                  <select
                    name="equipmentId"
                    value={form.equipmentId}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  >
                    <option value="">Select equipment</option>
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} {eq.hireType ? `(${eq.hireType})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}

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
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attachments (up to 3 images)</span>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer">
                  <MdImage className="text-base" />
                  Add images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>
              </div>

              {attachments.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {attachments.map((item, index) => (
                    <div key={item.previewUrl} className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/50">
                      <img
                        src={item.previewUrl}
                        alt={`Attachment ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-500 shadow hover:bg-white"
                      >
                        <MdDelete className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Add photos to help technicians understand the issue faster.</p>
              )}
            </div>

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
                onClick={handleClose}
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
                {createTicket.isPending
                  ? 'Submitting...'
                  : createdTicketId && attachments.length > 0
                    ? 'Upload images'
                    : 'Create ticket'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketFormModal;
