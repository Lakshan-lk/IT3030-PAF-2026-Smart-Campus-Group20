import React from 'react';
import { MdAdd } from 'react-icons/md';

const TicketsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Maintenance Tickets</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
          <MdAdd className="text-xl" /> Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Tickets */}
        <div className="bg-slate-100/80 p-5 rounded-2xl border border-slate-200/60 h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="font-bold text-slate-600 mb-5 uppercase text-xs tracking-wider flex justify-between items-center">
            Open <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">2</span>
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-colors">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">HIGH PRIORITY</span>
                 <span className="text-xs font-semibold text-slate-400">#TK-092</span>
               </div>
               <h3 className="font-bold text-slate-800 mb-2 leading-tight">Projector not working in Main Hall A</h3>
               <p className="text-sm text-slate-500 line-clamp-2">The projector is continuously blinking red and fails to connect to any HMDI input.</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-colors">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md">LOW PRIORITY</span>
                 <span className="text-xs font-semibold text-slate-400">#TK-093</span>
               </div>
               <h3 className="font-bold text-slate-800 mb-2 leading-tight">Squeaky door</h3>
               <p className="text-sm text-slate-500 line-clamp-2">Main entrance door needs oiling.</p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-100/80 p-5 rounded-2xl border border-slate-200/60 h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="font-bold text-slate-600 mb-5 uppercase text-xs tracking-wider flex justify-between items-center">
            In Progress <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">1</span>
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-colors">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">MEDIUM PRIORITY</span>
                 <span className="text-xs font-semibold text-slate-400">#TK-090</span>
               </div>
               <h3 className="font-bold text-slate-800 mb-2 leading-tight">AC leaking in Lab 3</h3>
               <p className="text-sm text-slate-500 line-clamp-2">Water dripping near the third desk row. Maintenance team has been dispatched.</p>
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-slate-100/80 p-5 rounded-2xl border border-slate-200/60 h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="font-bold text-slate-600 mb-5 uppercase text-xs tracking-wider flex justify-between items-center">
            Resolved <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">0</span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
