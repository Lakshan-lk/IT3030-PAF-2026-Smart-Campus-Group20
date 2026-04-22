import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdCloudUpload, MdImage } from 'react-icons/md';
import { useCreateResource, useUpdateResource } from '../hooks/useResources';
import { resourceApi } from '../api/resourceApi';
import { resolveMediaUrl } from '../utils/media';

const ResourceForm = ({ resource, onClose, onSaved }) => {
  const isEditing = !!resource;
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    name: resource?.name || '',
    description: resource?.description || '',
    type: resource?.type || 'LECTURE_HALL',
    location: resource?.location || '',
    capacity: resource?.capacity || 10,
    status: resource?.status || 'AVAILABLE',
    imageUrl: resource?.imageUrl || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmitError('');
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value
    }));
  };

  const previewFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        imageUrl: reader.result?.toString() || '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setSubmitError('');

    if (!file) {
      setFormData(prev => ({
        ...prev,
        imageUrl: resource?.imageUrl || '',
      }));
      return;
    }

    previewFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (!file) return;
    setImageFile(file);
    setSubmitError('');
    previewFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setSubmitError('');
    setFormData(prev => ({
      ...prev,
      imageUrl: resource?.imageUrl || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      let imageUrl = resource?.imageUrl || formData.imageUrl || '';
      let savedResourceId = resource?.id || null;

      if (imageFile) {
        const uploadResponse = await resourceApi.uploadImage(imageFile);
        imageUrl = uploadResponse.data.imageUrl;
      }

      const payload = {
        ...formData,
        imageUrl,
      };

      if (isEditing) {
        const updateResponse = await updateResource.mutateAsync({ id: resource.id, data: payload });
        savedResourceId = updateResponse?.data?.id ?? resource.id;
      } else {
        const createResponse = await createResource.mutateAsync(payload);
        savedResourceId = createResponse?.data?.id ?? null;
      }

      if (onSaved) {
        const successMessage = imageFile
          ? (isEditing ? 'Image replaced successfully.' : 'Image uploaded successfully.')
          : 'Resource saved successfully.';
        onSaved({
          message: successMessage,
          resourceId: savedResourceId,
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save resource image', error);
      setSubmitError(error?.response?.data?.message || error?.message || 'Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = createResource.isPending || updateResource.isPending || isSubmitting;

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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            {isEditing ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
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
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Image</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <MdCloudUpload className="text-xl text-indigo-500 dark:text-indigo-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {imageFile ? imageFile.name : 'Drag & drop an image here or choose a file'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG, WebP or GIF files only.
                </p>
              </div>
              <label className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Choose
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Uploaded files are stored on the server and linked to the facility automatically.
            </p>
          </div>

          {formData.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Image Preview
              </div>
              <div className="h-40 bg-slate-200 dark:bg-slate-800">
                <img
                  src={resolveMediaUrl(formData.imageUrl)}
                  alt={formData.name || 'Resource preview'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-sm">
              {submitError}
            </div>
          )}

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
