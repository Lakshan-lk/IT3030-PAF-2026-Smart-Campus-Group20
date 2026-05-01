import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdApartment, MdWarningAmber, MdClose, MdCheckCircle, MdInfo } from 'react-icons/md';
import { useResources, useDeleteResource } from '../hooks/useResources';
import ResourceForm from '../components/ResourceForm';
import { getCampusStatusMeta } from '../utils/status';

const AdminResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const size = 10;
  
  const { data, isLoading } = useResources({ 
    search: searchQuery || undefined,
    status: activeTab === 'all' ? undefined : {
      available: 'ACTIVE',
      under_maintenance: 'UNDER_MAINTENANCE',
      unavailable: 'OUT_OF_SERVICE',
    }[activeTab],
    page,
    size 
  });
  
  const deleteResource = useDeleteResource();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const resources = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'under_maintenance', label: 'Under Maintenance' },
    { key: 'unavailable', label: 'Unavailable' },
  ];

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingResource(null);
    setIsFormOpen(true);
  };

  const handleDelete = (resource) => {
    setResourceToDelete(resource);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingResource(null);
  };

  const handleCloseDeleteModal = () => {
    setResourceToDelete(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const handleResourceSaved = ({ message } = {}) => {
    if (message) {
      showToast(message, 'success');
    }
  };

  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Delete failed. Please try again.'
    );
  };

  const confirmDelete = () => {
    if (!resourceToDelete) {
      return;
    }

    deleteResource.mutate(resourceToDelete.id, {
      onSuccess: () => {
        showToast(`"${resourceToDelete.name}" was deleted successfully.`, 'delete');
        setResourceToDelete(null);
      },
      onError: (error) => {
        showToast(getErrorMessage(error), 'error');
      },
    });
  };

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Resource Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage campus facilities, rooms, and equipment</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <MdAdd className="text-lg" />
          Add Resource
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/40">
          <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(0);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                      : 'bg-white dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full xl:w-72">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 dark:focus:border-indigo-400 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                <MdApartment className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No resources found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try adjusting your search query' : 'No resources to display'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/40">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name & ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => {
                    const colors = getCampusStatusMeta(resource.status);

                    return (
                      <motion.tr
                        key={resource.id}
                        variants={rowVariants}
                        className="border-b border-slate-50 dark:border-slate-700/20 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{resource.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">ID: {resource.id}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300 capitalize">{resource.type.replace('_', ' ').toLowerCase()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300">{resource.location}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300">{resource.capacity} pax</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold ${colors.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {colors.label || resource.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(resource)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                              title="Edit"
                            >
                              <MdEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              title="Delete"
                            >
                              <MdDelete className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700/40 flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                  <span>Page {page + 1} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button 
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <ResourceForm 
            key={editingResource?.id || 'create-resource'}
            resource={editingResource} 
            onClose={handleCloseForm}
            onSaved={handleResourceSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resourceToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.button
              type="button"
              aria-label="Close delete confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={handleCloseDeleteModal}
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-white dark:bg-slate-800 shadow-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />

              <div className="flex items-start justify-between gap-4 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300">
                    <MdWarningAmber className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Delete resource?
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      This will remove <span className="font-semibold text-slate-900 dark:text-slate-100">{resourceToDelete.name}</span> from the list and delete its uploaded image if it has one.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>

              <div className="px-6 pb-5">
                <div className="rounded-2xl border border-rose-200/70 dark:border-rose-900/30 bg-rose-50/80 dark:bg-rose-900/15 p-4">
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    This action cannot be undone.
                  </p>
                  <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-200/80">
                    If you only want to hide the resource, consider changing its status instead.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 dark:border-slate-700/60 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  disabled={deleteResource.isPending}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteResource.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
                >
                  {deleteResource.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <MdDelete className="text-lg" />
                      Delete resource
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-5 right-3 z-[70] w-[calc(100vw-1.5rem)] max-w-md sm:right-5 sm:w-[24rem]"
          >
            <div
              className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
                toast.type === 'delete'
                  ? 'border-rose-200/70 bg-white/95 text-slate-800 dark:border-rose-900/40 dark:bg-slate-900/95 dark:text-slate-100'
                  : toast.type === 'error'
                  ? 'border-rose-200/70 bg-white/95 text-slate-800 dark:border-rose-900/40 dark:bg-slate-900/95 dark:text-slate-100'
                  : 'border-emerald-200/70 bg-white/95 text-slate-800 dark:border-emerald-900/40 dark:bg-slate-900/95 dark:text-slate-100'
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 ${
                  toast.type === 'delete'
                    ? 'bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400'
                    : toast.type === 'error'
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
                }`}
              />

              <div className="flex items-start gap-3 p-4 sm:p-4.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    toast.type === 'delete'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
                      : toast.type === 'error'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}
                >
                  {toast.type === 'delete' ? (
                    <MdDelete className="text-2xl" />
                  ) : toast.type === 'error' ? (
                    <MdInfo className="text-2xl" />
                  ) : (
                    <MdCheckCircle className="text-2xl" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5">
                    {toast.type === 'delete'
                      ? 'Deleted'
                      : toast.type === 'error'
                      ? 'Something went wrong'
                      : 'Saved successfully'}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                    {toast.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close toast"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>

              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3.5, ease: 'linear' }}
                className={`h-1 ${
                  toast.type === 'delete'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                    : toast.type === 'error'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-400'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminResourcesPage;
