import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { EQUIPMENT_TYPES } from '../constants/facilities';
import { useCreateEquipment, useUpdateEquipment } from '../hooks/useEquipment';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

const EquipmentForm = ({ equipment, resources, onClose }) => {
  const isEditing = !!equipment;
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();

  const [formData, setFormData] = useState({
    name: '',
    type: 'PROJECTOR',
    status: 'ACTIVE',
    roomId: '',
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        type: equipment.type || 'PROJECTOR',
        status: equipment.status || 'ACTIVE',
        roomId: equipment.roomId ? String(equipment.roomId) : '',
      });
    } else {
      setFormData({
        name: '',
        type: 'PROJECTOR',
        status: 'ACTIVE',
        roomId: resources[0] ? String(resources[0].id) : '',
      });
    }
  }, [equipment, resources]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      roomId: formData.roomId ? Number(formData.roomId) : null,
    };

    if (isEditing) {
      updateEquipment.mutate({ id: equipment.id, data: payload }, { onSuccess: onClose });
    } else {
      createEquipment.mutate({ roomId: payload.roomId, data: payload }, { onSuccess: onClose });
    }
  };

  const isLoading = createEquipment.isPending || updateEquipment.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {isEditing ? 'Edit Equipment' : 'Add Equipment'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Store equipment in a room so it appears in facilities and booking flows.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Equipment Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Projector A1"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
              >
                {EQUIPMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Room</label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">Select room</option>
              {resources.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} {room.location ? `- ${room.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 relative"
              disabled={isLoading || !formData.roomId}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                isEditing ? 'Save Changes' : 'Create Equipment'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EquipmentForm;
