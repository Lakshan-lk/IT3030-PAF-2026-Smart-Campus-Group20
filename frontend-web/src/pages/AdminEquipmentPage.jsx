import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdSearch, MdDelete, MdEdit, MdBuild, MdRoom, MdSell } from 'react-icons/md';
import { useAllEquipment, useDeleteEquipment } from '../hooks/useEquipment';
import { useAllEquipmentBookings, useApproveEquipmentBooking, useRejectEquipmentBooking } from '../hooks/useEquipmentBooking';
import { useResources } from '../hooks/useResources';
import EquipmentForm from '../components/EquipmentForm';
import { EQUIPMENT_CONFIG, formatEquipmentLabel } from '../constants/facilities';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'out_of_service', label: 'Out of Service' },
];

const AdminEquipmentPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formMode, setFormMode] = useState('room');
  const [viewMode, setViewMode] = useState('equipment');
  const [actionModal, setActionModal] = useState({ open: false, type: null, bookingId: null });
  const [rejectReason, setRejectReason] = useState('');

  const { data: bookingsData, isLoading: isLoadingBookings } = useAllEquipmentBookings();
  const approveBooking = useApproveEquipmentBooking();
  const rejectBooking = useRejectEquipmentBooking();
  const bookings = bookingsData?.content || bookingsData || [];
  const { data: equipmentData, isLoading } = useAllEquipment();
  const { data: resourcesData } = useResources({ page: 0, size: 200 });
  const deleteEquipment = useDeleteEquipment();

  const equipment = equipmentData?.content || equipmentData || [];
  const resources = resourcesData?.content || resourcesData || [];
  const resourceMap = Object.fromEntries(resources.map(room => [room.id, room]));

  const filteredEquipment = equipment
    .filter(item => {
      if (activeTab === 'all') return true;
      return item.status === activeTab.toUpperCase();
    })
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const room = resourceMap[item.roomId];
      return item.name?.toLowerCase().includes(q)
        || item.type?.toLowerCase().includes(q)
        || item.hireType?.toLowerCase().includes(q)
        || item.description?.toLowerCase().includes(q)
        || item.status?.toLowerCase().includes(q)
        || room?.name?.toLowerCase().includes(q)
        || room?.location?.toLowerCase().includes(q);
    });

  const stats = {
    total: equipment.length,
    active: equipment.filter(item => item.status === 'ACTIVE').length,
    outOfService: equipment.filter(item => item.status === 'OUT_OF_SERVICE').length,
    hire: equipment.filter(item => item.hiringEquipment).length,
  };

  const handleCreate = () => {
    setEditingEquipment(null);
    setFormMode('room');
    setIsFormOpen(true);
  };

  const handleCreateHiring = () => {
    setEditingEquipment(null);
    setFormMode('hiring');
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormMode(item.hiringEquipment ? 'hiring' : 'room');
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this equipment item? This will remove it from the database.')) {
      deleteEquipment.mutate(id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEquipment(null);
  };

  const handleApproveClick = (id) => setActionModal({ open: true, type: 'approve', bookingId: id });
  
  const handleRejectClick = (id) => {
    setRejectReason('');
    setActionModal({ open: true, type: 'reject', bookingId: id });
  };

  const confirmAction = () => {
    if (actionModal.type === 'approve') {
      approveBooking.mutate(actionModal.bookingId);
    } else if (actionModal.type === 'reject') {
      if (!rejectReason.trim()) return; // Required
      rejectBooking.mutate({ id: actionModal.bookingId, reason: rejectReason });
    }
    setActionModal({ open: false, type: null, bookingId: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setViewMode('equipment')}
          className={`px-4 py-2 font-medium text-sm ${viewMode === 'equipment' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Equipment Inventory
        </button>
        <button
          onClick={() => setViewMode('bookings')}
          className={`px-4 py-2 font-medium text-sm ${viewMode === 'bookings' ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Booking Requests
        </button>
      </div>

      {viewMode === 'equipment' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Equipment Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, update, and delete equipment stored in the database</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <MdAdd className="text-lg" />
            Add Equipment
          </button>
          <button
            onClick={handleCreateHiring}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <MdSell className="text-lg" />
            Add Hiring Equipments
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: MdBuild },
          { label: 'Active', value: stats.active, icon: MdBuild, accent: 'text-emerald-600' },
          { label: 'Out of Service', value: stats.outOfService, icon: MdBuild, accent: 'text-slate-500' },
          { label: 'Hire', value: stats.hire, icon: MdSell, accent: 'text-amber-600' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/40 flex items-center justify-center ${card.accent || 'text-slate-500'}`}>
                  <Icon className="text-lg" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{isLoading ? '...' : card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/40">
          <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_TABS.map(tab => (
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
            <div className="relative w-full xl:w-80">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment or rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 dark:focus:border-indigo-400 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
              <MdRoom className="text-3xl text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No equipment found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchQuery ? 'Try adjusting your search' : 'Add equipment to start managing room assets'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/40">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name & ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map(item => {
                  const cfg = EQUIPMENT_CONFIG[item.type];
                  const room = resourceMap[item.roomId];
                  const typeLabel = item.hiringEquipment
                    ? item.hireType
                    : formatEquipmentLabel(item.type);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50 dark:border-slate-700/20 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.name}</p>
                          {item.hiringEquipment ? (
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                              Hire
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">ID: {item.id}</p>
                        {item.hiringEquipment && item.description ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                          {!item.hiringEquipment && cfg ? <span className="w-2 h-2 rounded-full bg-slate-400" /> : null}
                          {typeLabel}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.hiringEquipment ? (
                          <>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Hiring inventory</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{item.imageUrls?.length || 0} image(s)</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{room?.name || `Room #${item.roomId || 'N/A'}`}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{room?.location || 'Location not specified'}</p>
                          </>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          {item.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            title="Delete"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      ) : (
        <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Equipment Booking Requests</h2>
          {isLoadingBookings ? (
            <p>Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="text-slate-500">No booking requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/40">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Equipment</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">User</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Period</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Purpose</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-slate-50 dark:border-slate-700/20">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{booking.equipmentName}</p>
                        <p className="text-xs text-slate-500">{booking.equipmentType}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-800 dark:text-slate-100">{booking.userName}</p>
                        <p className="text-xs text-slate-500">{booking.userEmail}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-slate-600 dark:text-slate-300">From: {new Date(booking.startTime).toLocaleString()}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">To: {new Date(booking.endTime).toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={booking.purpose}>{booking.purpose}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'REJECTED' && booking.rejectionReason && (
                           <p className="text-[10px] mt-1 text-rose-500">Reason: {booking.rejectionReason}</p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {booking.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleApproveClick(booking.id)} className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors">Approve</button>
                            <button onClick={() => handleRejectClick(booking.id)} className="px-3 py-1 bg-rose-500 text-white text-xs font-semibold rounded hover:bg-rose-600 transition-colors">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <EquipmentForm
            key={`${formMode}-${editingEquipment?.id ?? 'new'}`}
            equipment={editingEquipment}
            resources={resources}
            mode={formMode}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setActionModal({ open: false, type: null, bookingId: null })}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className={`text-lg font-bold mb-2 ${actionModal.type === 'approve' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {actionModal.type === 'approve' ? 'Approve Booking?' : 'Reject Booking?'}
              </h3>
              
              {actionModal.type === 'reject' ? (
                <div className="mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Please provide a reason for rejecting this equipment booking.</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to approve this equipment booking? The user will be notified.</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setActionModal({ open: false, type: null, bookingId: null })}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionModal.type === 'reject' && !rejectReason.trim()}
                  className={`flex-1 px-4 py-2 rounded-xl text-white font-medium text-sm disabled:opacity-50 transition-colors ${
                    actionModal.type === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEquipmentPage;
