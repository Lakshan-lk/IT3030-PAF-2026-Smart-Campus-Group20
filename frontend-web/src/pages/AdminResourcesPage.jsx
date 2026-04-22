import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdApartment, MdCheckCircle, MdClose } from 'react-icons/md';
import { useResources, useDeleteResource } from '../hooks/useResources';
import ResourceForm from '../components/ResourceForm';
import ResourceCard from '../components/ResourceCard';

const AdminResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;
  
  const { data, isLoading } = useResources({ 
    keyword: searchQuery || undefined,
    page,
    size 
  });
  
  const deleteResource = useDeleteResource();
  
  const resources = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredResources = resources.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab.toUpperCase();
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'unavailable', label: 'Unavailable' },
    { key: 'out_of_service', label: 'Out of Service' },
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
    setDeleteTarget(resource);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteResource.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingResource(null);
  };

  const handleSaved = (payload) => {
    const message = typeof payload === 'string' ? payload : payload?.message || 'Resource saved successfully.';
    const resourceId = typeof payload === 'object' ? payload?.resourceId : null;

    if (resourceId && message.toLowerCase().includes('image')) {
      window.sessionStorage.setItem(
        'resource-image-flash',
        JSON.stringify({
          resourceId,
          message,
          timestamp: Date.now(),
        }),
      );
    }

    const id = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    setToast({ id, message });
  };

  const statusColors = {
    AVAILABLE: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', dot: 'bg-emerald-400' },
    MAINTENANCE: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-400' },
    UNAVAILABLE: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40', dot: 'bg-rose-400' },
    OUT_OF_SERVICE: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-600/50', dot: 'bg-slate-400' },
  };

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

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed bottom-6 right-6 z-[120] max-w-sm w-[calc(100vw-2rem)] sm:w-[22rem]"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200 dark:ring-white/10 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 dark:from-emerald-500/18 dark:via-teal-500/8 dark:to-cyan-500/18" />
              <div className="relative flex items-start gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-emerald-500/15 dark:border-emerald-400/15 text-emerald-600 dark:text-emerald-300">
                  <MdCheckCircle className="text-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-5">{toast.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Changes are now live in Facilities.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.clearTimeout(toast.id);
                    setToast(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-300"
                  aria-label="Dismiss notification"
                >
                  <MdClose className="text-base" />
                </button>
              </div>
              <motion.div
                className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.8, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/40">
          <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
          ) : filteredResources.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                <MdApartment className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No resources found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try adjusting your search query' : `No ${activeTab} resources to display`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="md:hidden mb-2 text-xs text-slate-500 dark:text-slate-400">
                Swipe horizontally to view all columns
              </div>
              <table className="w-full min-w-[920px] text-left border-collapse">
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
                  {filteredResources.map((resource) => {
                    const colors = statusColors[resource.status] || statusColors.AVAILABLE;

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
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-bold`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {resource.status}
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
            key={editingResource?.id ?? 'new'}
            resource={editingResource} 
            onClose={handleCloseForm}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-900/25 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-300">
                  <MdDelete className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete resource?</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {deleteTarget?.name} will be soft-deleted. Its uploaded image, if any, will also be removed from storage.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminResourcesPage;
