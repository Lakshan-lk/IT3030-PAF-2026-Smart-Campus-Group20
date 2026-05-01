import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose, MdImage, MdUpload, MdDelete } from 'react-icons/md';
import { useCreateResource, useUpdateResource } from '../hooks/useResources';
import { resourceApi } from '../api/resourceApi';
import { resolveMediaUrl } from '../utils/media';
import {
  RESOURCE_STATUS_OPTIONS,
  normalizeResourceStatusForApi,
  normalizeResourceStatusForForm,
} from '../utils/status';

const ResourceForm = ({ resource, onClose, onSaved }) => {
  const isEditing = !!resource;

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  const initialFormData = useMemo(() => ({
    name: resource?.name || '',
    description: resource?.description || '',
    type: resource?.type || 'LECTURE_HALL',
    location: resource?.location || '',
    capacity: resource?.capacity || 10,
    status: normalizeResourceStatusForForm(resource?.status || 'ACTIVE'),
    imageUrl: resource?.imageUrl || '',
    equipmentTypes: resource?.equipment?.map(e => e.type) || [],
  }), [resource]);

  const [formData, setFormData] = useState(initialFormData);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'equipmentTypes') {
      setFormData(prev => {
        const currentTypes = [...prev.equipmentTypes];
        if (checked) {
          return { ...prev, equipmentTypes: [...currentTypes, value] };
        } else {
          return { ...prev, equipmentTypes: currentTypes.filter(t => t !== value) };
        }
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    setSelectedImage(file);
    setFormError('');

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const displayImage = useMemo(() => {
    if (imagePreview) {
      return imagePreview;
    }
    return resolveMediaUrl(formData.imageUrl);
  }, [formData.imageUrl, imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    let uploadedImageUrl = '';

    try {
      let imageUrl = formData.imageUrl || '';

      if (selectedImage) {
        const uploadResponse = await resourceApi.uploadImage(selectedImage);
        imageUrl = uploadResponse.data.imageUrl;
        uploadedImageUrl = imageUrl;
      }

      const payload = {
        ...formData,
        status: normalizeResourceStatusForApi(formData.status),
        imageUrl,
      };

      if (isEditing) {
        const response = await updateResource.mutateAsync({ id: resource.id, data: payload });
        onSaved?.({
          message: selectedImage ? 'Image updated successfully.' : 'Resource updated successfully.',
          resourceId: response?.data?.id || resource.id,
          imageUrl: response?.data?.imageUrl || imageUrl,
        });
      } else {
        const response = await createResource.mutateAsync(payload);
        onSaved?.({
          message: selectedImage ? 'Image uploaded successfully.' : 'Resource created successfully.',
          resourceId: response?.data?.id,
          imageUrl: response?.data?.imageUrl || imageUrl,
        });
      }

      onClose();
    } catch (error) {
      if (uploadedImageUrl) {
        try {
          await resourceApi.deleteUploadedImage(uploadedImageUrl);
        } catch (cleanupError) {
          console.warn('Failed to clean up uploaded image after save error', cleanupError);
        }
      }

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save resource.';
      setFormError(message);
    }
  };

  const isLoading = createResource.isPending || updateResource.isPending;

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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {isEditing ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEditing ? 'Update the details and replace the image if needed.' : 'Create a new facility or asset entry.'}
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
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Resource Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Main Hall A"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detailed description of the resource..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
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
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="SEMINAR_ROOM">Seminar Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="WORKSHOP">Workshop</option>
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
                    {RESOURCE_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="Building A, Floor 1"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    min="0"
                    required
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Available Equipment</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PROJECTOR', label: 'Projector' },
                    { id: 'WHITEBOARD', label: 'Whiteboard' },
                    { id: 'AC', label: 'A/C' },
                    { id: 'MICROPHONE', label: 'Mic' },
                    { id: 'PC', label: 'PC' },
                    { id: 'CAMERA', label: 'Camera' }
                  ].map((eq) => (
                    <label 
                      key={eq.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        formData.equipmentTypes.includes(eq.id)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="equipmentTypes"
                        value={eq.id}
                        checked={formData.equipmentTypes.includes(eq.id)}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium">{eq.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Facility Image</label>
                <div 
                  className={`rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' 
                      : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative pointer-events-none">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={formData.name || 'Resource preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 px-4 text-center">
                        <MdImage className="text-4xl" />
                        <p className="text-sm font-medium">
                          {isDragging ? 'Drop image here' : 'Drag & drop or upload a facility photo'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 text-sm font-semibold transition-colors">
                      <MdUpload className="text-lg" />
                      <span>{selectedImage || formData.imageUrl ? 'Replace image' : 'Choose image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Supported formats: PNG, JPG, JPEG, GIF, WEBP, SVG.
                    </p>

                    {(selectedImage || formData.imageUrl) && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        <MdDelete />
                        Remove selected image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">How it works</p>
                <p>
                  The image is uploaded first, the backend returns a public path, and that path is saved into the resource record.
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300"
              >
                {formError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2 flex gap-3">
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
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                isEditing ? 'Save Changes' : 'Create Resource'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResourceForm;
