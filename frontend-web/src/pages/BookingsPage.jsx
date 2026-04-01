import React from 'react';
import { MdAdd, MdMoreVert } from 'react-icons/md';

const BookingsPage = () => {
  const bookings = [
    { id: 'BK-001', facility: 'Main Hall A', date: 'Oct 24, 2026', time: '10:00 AM', status: 'APPROVED' },
    { id: 'BK-002', facility: 'Computer Lab 3', date: 'Oct 25, 2026', time: '02:00 PM', status: 'PENDING' },
    { id: 'BK-003', facility: 'Meeting Room C', date: 'Oct 20, 2026', time: '11:00 AM', status: 'REJECTED' },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">APPROVED</span>;
      case 'PENDING': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">PENDING</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">REJECTED</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Bookings</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
          <MdAdd className="text-xl" /> New Booking
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
              <th className="p-4 font-medium">Booking ID</th>
              <th className="p-4 font-medium">Facility</th>
              <th className="p-4 font-medium">Date & Time</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-700">{booking.id}</td>
                <td className="p-4 text-slate-600">{booking.facility}</td>
                <td className="p-4 text-slate-600">{booking.date} <span className="text-slate-400 ml-1">{booking.time}</span></td>
                <td className="p-4">{getStatusBadge(booking.status)}</td>
                <td className="p-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600">
                    <MdMoreVert className="text-xl inline-block" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
