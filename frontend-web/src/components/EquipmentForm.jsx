import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdDelete, MdImage, MdUpload } from 'react-icons/md';
import { EQUIPMENT_TYPES, HIRING_EQUIPMENT_TYPES, formatEquipmentLabel } from '../constants/facilities';
import { useCreateEquipment, useUpdateEquipment } from '../hooks/useEquipment';
import { resourceApi } from '../api/resourceApi';
import { resolveMediaUrl } from '../utils/media';
import {
  EQUIPMENT_STATUS_OPTIONS,
  normalizeEquipmentStatusForApi,
  normalizeEquipmentStatusForForm,
} from '../utils/status';

const EquipmentForm = ({ equipment, resources, mode = 'room', onClose }) => {
  const isEditing = !!equipment;
  const isHiringMode = mode === 'hiring' || equipment?.hiringEquipment;
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();

  const initialFormData = {
    name: equipment?.name || '',
    type: equipment?.type || 'PROJECTOR',
    status: normalizeEquipmentStatusForForm(equipment?.status || 'ACTIVE'),
    roomId: equipment?.roomId ? String(equipment.roomId) : (resources[0] ? String(resources[0].id) : ''),
    hiringEquipment: !!equipment?.hiringEquipment || isHiringMode,
    hireType: equipment?.hireType || HIRING_EQUIPMENT_TYPES[0],
    description: equipment?.description || '',
    imageUrls: equipment?.imageUrls || [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processFiles = (files) => {
    const nextFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    if (!nextFiles.length) {
      return;
    }

    setFormError('');
    setSelectedImages(prev => [...prev, ...nextFiles]);

    nextFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, typeof reader.result === 'string' ? reader.result : '']);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, imageIndex) => imageIndex !== index));
    setImagePreviews(prev => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(url => url !== imageUrl),
    }));
  };

  const displayImages = useMemo(() => ([
    ...formData.imageUrls.map(resolveMediaUrl),
    ...imagePreviews,
  ]), [formData.imageUrls, imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const uploadedImageUrls = [];

    try {
      for (const image of selectedImages) {
        const uploadResponse = await resourceApi.uploadImage(image);
        uploadedImageUrls.push(uploadResponse.data.imageUrl);
      }

      const payload = {
        name: formData.name.trim(),
        type: isHiringMode ? null : formData.type,
        status: normalizeEquipmentStatusForApi(formData.status),
        roomId: isHiringMode ? null : (formData.roomId ? Number(formData.roomId) : null),
        hiringEquipment: isHiringMode,
        hireType: isHiringMode ? formData.hireType : null,
        description: isHiringMode ? formData.description.trim() : '',
        imageUrls: isHiringMode ? [...formData.imageUrls, ...uploadedImageUrls] : [],
      };

      if (isEditing) {
        await updateEquipment.mutateAsync({ id: equipment.id, data: payload });
      } else {
        await createEquipment.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      if (uploadedImageUrls.length) {
        await Promise.allSettled(uploadedImageUrls.map((imageUrl) => resourceApi.deleteUploadedImage(imageUrl)));
      }

      setFormError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save equipment.'
      );
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
              {isEditing ? (isHiringMode ? 'Edit Hiring Equipment' : 'Edit Equipment') : (isHiringMode ? 'Add Hiring Equipment' : 'Add Equipment')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHiringMode
                ? 'Create a hireable equipment listing with category, photos, and description.'
                : 'Store equipment in a room so it appears in facilities and booking flows.'}
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHiringMode ? 'Category' : 'Type'}
              </label>
              <select
                name={isHiringMode ? 'hireType' : 'type'}
                value={isHiringMode ? formData.hireType : formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
              >
                {(isHiringMode ? HIRING_EQUIPMENT_TYPES : EQUIPMENT_TYPES).map(type => (
                  <option key={type} value={type}>{formatEquipmentLabel(type)}</option>
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
                {EQUIPMENT_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isHiringMode ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the hiring equipment, condition, and any useful details."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Images</label>
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-4">
                  {displayImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.imageUrls.map((imageUrl) => (
                        <div key={imageUrl} className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <img src={resolveMediaUrl(imageUrl)} alt="Equipment" className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imageUrl)}
                            className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1.5 text-white"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <img src={preview} alt="New equipment" className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1.5 text-white"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                      <MdImage className="text-4xl" />
                      <p className="text-sm">Add a few images for this hiring equipment</p>
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 text-sm font-semibold transition-colors">
                    <MdUpload className="text-lg" />
                    <span>{displayImages.length ? 'Add more images' : 'Choose images'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Images use the same upload flow as resource images, then the returned paths are saved on the hiring equipment record.
                  </p>
                </div>
              </div>
            </>
          ) : (
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
          )}

          {formError ? (
            <div className="rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              {formError}
            </div>
          ) : null}

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
              disabled={isLoading || (!isHiringMode && !formData.roomId)}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                isEditing ? 'Save Changes' : (isHiringMode ? 'Create Hiring Equipment' : 'Create Equipment')
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EquipmentForm;
