import React, { useMemo, useState } from 'react';
import { MdAdd, MdFilterAlt, MdSearch } from 'react-icons/md';
import TicketCard from '../components/TicketCard';
import TicketFormModal from '../components/TicketFormModal';
import TicketDetailModal from '../components/TicketDetailModal';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';

const statusGroups = [
  { key: 'OPEN', label: 'Open', accent: 'from-amber-400 to-orange-400' },
  { key: 'IN_PROGRESS', label: 'In Progress', accent: 'from-sky-400 to-cyan-400' },
  { key: 'RESOLVED', label: 'Resolved', accent: 'from-emerald-400 to-teal-400' },
  { key: 'CLOSED', label: 'Closed', accent: 'from-slate-400 to-slate-500' },
  { key: 'REJECTED', label: 'Rejected', accent: 'from-rose-400 to-pink-400' },
];

const TicketsPage = ({ mode = 'user', showCreateButton = true, pageTitle, pageSubtitle }) => {
  const { authUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const isStandardUser = authUser?.role === 'user';
  const isAdminView = mode === 'admin';
  const canCreateTicket = showCreateButton && authUser?.role === 'user';
  const title = pageTitle || (isAdminView ? 'Ticket Administration' : 'Ticket board');
  const subtitle =
    pageSubtitle ||
    (isAdminView
      ? 'Review, assign, resolve, and close tickets in a controlled workflow.'
      : 'Track incidents, upload evidence, and move each ticket through its lifecycle.');

  const queryParams = useMemo(() => {
    const params = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (priorityFilter !== 'ALL') params.priority = priorityFilter;
    if (categoryFilter !== 'ALL') params.category = categoryFilter;
    if (isStandardUser && authUser?.id) params.userId = authUser.id;
    return params;
  }, [statusFilter, priorityFilter, categoryFilter, authUser, isStandardUser]);

  const { data: tickets = [], isLoading, error } = useTickets(queryParams);

  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (!q) {
        return true;
      }
      return [ticket.resourceName, ticket.userName, ticket.description, ticket.assignedToName, ticket.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [tickets, searchTerm]);

  const groupedTickets = useMemo(() => {
    return statusGroups.reduce((accumulator, group) => {
      accumulator[group.key] = filteredTickets.filter((ticket) => ticket.status === group.key);
      return accumulator;
    }, {});
  }, [filteredTickets]);

  const visibleStatusGroups = useMemo(() => {
    return statusGroups.filter((group) => (groupedTickets[group.key]?.length || 0) > 0);
  }, [groupedTickets]);

  return (
    <div className="relative space-y-6">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl pointer-events-none dark:bg-amber-500/10" />
      <div className="absolute top-16 -left-20 h-64 w-64 rounded-full bg-orange-300/10 blur-3xl pointer-events-none dark:bg-orange-500/10" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">Maintenance tickets</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-50">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        {canCreateTicket && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            disabled={!authUser?.id}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-orange-600"
          >
            <MdAdd className="text-lg" />
            Report issue
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 p-4 backdrop-blur-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MdSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by room, reporter, assignee, or description"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:w-[42rem]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          >
            <option value="ALL">All statuses</option>
            {statusGroups.map((group) => (
              <option key={group.key} value={group.key}>{group.label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          >
            <option value="ALL">All categories</option>
            <option value="FACILITY_ISSUE">Facility issue</option>
            <option value="EQUIPMENT_FAULT">Equipment fault</option>
            <option value="IT_NETWORK">IT / network</option>
            <option value="SAFETY_HAZARD">Safety hazard</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <MdFilterAlt className="text-base" />
        <span>{filteredTickets.length} ticket{filteredTickets.length === 1 ? '' : 's'} visible</span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-5">
          {statusGroups.map((group) => (
            <div key={group.key} className="space-y-3 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 p-4">
              <div className="h-6 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700/50" />
              <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
              <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300">
          Unable to load tickets right now.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {visibleStatusGroups.length > 0 ? (
            visibleStatusGroups.map((group) => (
              <section key={group.key} className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 p-4 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-100">{group.label}</h2>
                    <div className={`mt-2 h-1.5 w-14 rounded-full bg-gradient-to-r ${group.accent}`} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">
                    {groupedTickets[group.key]?.length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {groupedTickets[group.key]?.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelectedTicketId(ticket.id)} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No tickets match the current filters.
            </div>
          )}
        </div>
      )}

      {isFormOpen && (
        <TicketFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      )}
      {selectedTicketId && (
        <TicketDetailModal
          key={selectedTicketId}
          ticketId={selectedTicketId}
          isOpen={!!selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};

export default TicketsPage;
