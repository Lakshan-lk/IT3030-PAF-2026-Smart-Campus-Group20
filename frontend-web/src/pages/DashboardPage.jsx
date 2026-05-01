import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdArrowForward,
  MdBuild,
  MdCalendarMonth,
  MdCheckCircle,
  MdExplore,
  MdGroups,
  MdHistory,
  MdLocationOn,
  MdPendingActions,
  MdReportProblem,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { useTickets } from '../hooks/useTickets';
import { useResources } from '../hooks/useResources';
import { getCampusStatusMeta } from '../utils/status';

const ACTION_LINKS = [
  {
    title: 'Book a space',
    description: 'Find a lecture hall, lab, or meeting room for your next session.',
    to: '/facilities',
    icon: MdExplore,
    accent: 'from-amber-500 to-orange-500',
    surface: 'bg-amber-50 dark:bg-amber-900/15',
  },
  {
    title: 'View bookings',
    description: 'Check upcoming reservations, pending approvals, and booking history.',
    to: '/bookings',
    icon: MdCalendarMonth,
    accent: 'from-sky-500 to-cyan-500',
    surface: 'bg-sky-50 dark:bg-sky-900/15',
  },
  {
    title: 'Report an issue',
    description: 'Create a maintenance or facility support ticket when something needs attention.',
    to: '/tickets',
    icon: MdReportProblem,
    accent: 'from-rose-500 to-pink-500',
    surface: 'bg-rose-50 dark:bg-rose-900/15',
  },
];

const formatDateTime = (value) => {
  if (!value) {
    return 'Not scheduled';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-LK', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatRelativeDay = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return 'Yesterday';
  return `${Math.abs(diffDays)} days ago`;
};

const DashboardPage = () => {
  const { authUser } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings(
    authUser?.id ? { userId: authUser.id } : {}
  );
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(
    authUser?.id ? { userId: authUser.id } : {}
  );
  const { data: resourcesData, isLoading: resourcesLoading } = useResources({
    page: 0,
    size: 6,
  });

  const resources = resourcesData?.content || resourcesData || [];

  const dashboard = useMemo(() => {
    const now = new Date();

    const upcomingBookings = bookings
      .filter((booking) => ['APPROVED', 'PENDING'].includes(booking.status))
      .filter((booking) => new Date(booking.endTime) >= now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING');
    const pastBookings = bookings
      .filter((booking) => new Date(booking.endTime) < now)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const openTickets = tickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status));
    const resolvedTickets = tickets.filter((ticket) => ['RESOLVED', 'CLOSED'].includes(ticket.status));
    const recentTickets = [...tickets]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 3);

    return {
      nextBooking: upcomingBookings[0] || null,
      upcomingBookings,
      pendingBookings,
      pastBookings,
      openTickets,
      resolvedTickets,
      recentTickets,
    };
  }, [bookings, tickets]);

  const firstName = authUser?.name?.split(' ')?.[0] || authUser?.username || 'User';
  const isLoading = bookingsLoading || ticketsLoading;

  return (
    <div className="relative space-y-8">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl pointer-events-none dark:bg-amber-500/10" />
      <div className="absolute top-16 -left-20 h-64 w-64 rounded-full bg-sky-300/10 blur-3xl pointer-events-none dark:bg-cyan-500/10" />

      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/65 md:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.20),transparent_58%)] md:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-500">Campus Portal</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-50 md:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Manage your upcoming bookings, track support requests, and jump back into the services you use most.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[34rem]">
            {[
              {
                label: 'Upcoming bookings',
                value: dashboard.upcomingBookings.length,
                icon: MdCalendarMonth,
                tone: 'text-amber-600 dark:text-amber-300',
              },
              {
                label: 'Tickets in progress',
                value: dashboard.openTickets.length,
                icon: MdBuild,
                tone: 'text-sky-600 dark:text-sky-300',
              },
              {
                label: 'Completed visits',
                value: dashboard.pastBookings.length,
                icon: MdHistory,
                tone: 'text-emerald-600 dark:text-emerald-300',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-700/40 dark:bg-slate-900/35"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <Icon className={`text-xl ${item.tone}`} />
                  </div>
                  <p className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                    {isLoading ? '...' : item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/65">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Next up</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Your next booking</h2>
            </div>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
            >
              View all
              <MdArrowForward />
            </Link>
          </div>

          {dashboard.nextBooking ? (
            <div className="space-y-4">
              <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-xl shadow-slate-900/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                      {formatRelativeDay(dashboard.nextBooking.startTime)}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{dashboard.nextBooking.resourceName}</h3>
                    <p className="mt-2 max-w-xl text-sm text-slate-300">{dashboard.nextBooking.purpose}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    dashboard.nextBooking.status === 'APPROVED'
                      ? 'bg-emerald-400/15 text-emerald-200'
                      : 'bg-amber-400/15 text-amber-200'
                  }`}>
                    {dashboard.nextBooking.status === 'APPROVED' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Schedule</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{formatDateTime(dashboard.nextBooking.startTime)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Attendees</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{dashboard.nextBooking.attendees || 'Not set'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Extras</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                      {dashboard.nextBooking.additionalEquipmentSummary || 'None'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-700/40 dark:bg-slate-900/35">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Pending approvals</p>
                  <p className="mt-3 text-3xl font-black text-slate-800 dark:text-slate-100">{dashboard.pendingBookings.length}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bookings waiting for confirmation.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-700/40 dark:bg-slate-900/35">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Recent completed</p>
                  <p className="mt-3 text-3xl font-black text-slate-800 dark:text-slate-100">{dashboard.pastBookings.length}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Past bookings already completed.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700/50 dark:bg-slate-900/30">
              <MdCalendarMonth className="mx-auto text-5xl text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-200">No upcoming bookings</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Reserve a room or facility to start building your schedule.
              </p>
              <Link
                to="/facilities"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Explore facilities
                <MdArrowForward />
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/65">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Quick actions</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Start something</h2>
            </div>

            <div className="space-y-3">
              {ACTION_LINKS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.to}
                    className={`group flex items-start gap-4 rounded-[1.5rem] border border-slate-200/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-700/40 ${action.surface}`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.accent} text-white shadow-lg`}>
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{action.title}</h3>
                        <MdArrowForward className="text-slate-400 transition group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/65">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Support</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Ticket status</h2>
              </div>
              <Link to="/tickets" className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                Open board
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700/40 dark:bg-slate-900/35">
                <MdPendingActions className="text-2xl text-amber-500" />
                <p className="mt-3 text-3xl font-black text-slate-800 dark:text-slate-100">
                  {ticketsLoading ? '...' : dashboard.openTickets.length}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open or in progress</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700/40 dark:bg-slate-900/35">
                <MdCheckCircle className="text-2xl text-emerald-500" />
                <p className="mt-3 text-3xl font-black text-slate-800 dark:text-slate-100">
                  {ticketsLoading ? '...' : dashboard.resolvedTickets.length}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Resolved or closed</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {dashboard.recentTickets.length > 0 ? (
                dashboard.recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-900/25"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{ticket.category?.replace(/_/g, ' ')}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {ticket.resourceName || 'General request'}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                        {ticket.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-700/50 dark:bg-slate-900/25 dark:text-slate-400">
                  No tickets yet. Use the ticket board when you need support.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/65">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Discover</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Campus spaces and status</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              See what is available, under maintenance, or currently unavailable before you book.
            </p>
          </div>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Browse facilities
            <MdArrowForward />
          </Link>
        </div>

        {resourcesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-[1.75rem] bg-slate-100 dark:bg-slate-700/40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.slice(0, 3).map((resource) => {
              const statusMeta = getCampusStatusMeta(resource.status);

              return (
                <Link
                  key={resource.id}
                  to="/facilities"
                  className="group rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-700/40 dark:from-slate-800 dark:to-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-100 dark:text-slate-900">
                      <MdLocationOn className="text-2xl" />
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${statusMeta.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-800 dark:text-slate-100">{resource.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{resource.location || 'Campus location'}</p>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <MdGroups />
                      <span>Capacity {resource.capacity || 'N/A'}</span>
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-slate-100">
                      View
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
