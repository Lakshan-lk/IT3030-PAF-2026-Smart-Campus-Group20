import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdCheck, MdClose, MdCancel } from 'react-icons/md';
import { useBookings, useApproveBooking, useRejectBooking, useCancelBooking } from '../hooks/useBookings';

const STATUS_CONFIG = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.28)',  pulse: true  },
  APPROVED:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.28)',  pulse: false },
  REJECTED:  { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.28)',   pulse: false },
  CANCELLED: { color: '#64748b', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.22)', pulse: false },
};

const STAT_CARDS = [
  { key: 'all',       label: 'Total',     statKey: 'total',     color: '#6366f1' },
  { key: 'pending',   label: 'Pending',   statKey: 'pending',   color: '#f59e0b' },
  { key: 'approved',  label: 'Approved',  statKey: 'approved',  color: '#10b981' },
  { key: 'rejected',  label: 'Rejected',  statKey: 'rejected',  color: '#f43f5e' },
  { key: 'cancelled', label: 'Cancelled', statKey: 'cancelled', color: '#64748b' },
];

const COLS = ['Resource', 'User', 'Purpose', 'Date & Time', 'Status', 'Actions'];
const PAGE_SIZE = 20;

const AdminBookingsPage = () => {
  const { data: bookings = [], isLoading } = useBookings({ page: 0, size: 1000, sort: 'createdAt,desc' }, {
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });
  const approveBooking = useApproveBooking();
  const rejectBooking  = useRejectBooking();
  const cancelBooking  = useCancelBooking();

  const [activeTab, setActiveTab]     = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow]   = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [actionModal, setActionModal] = useState({ open: false, type: null, bookingId: null });
  const [cancelNote, setCancelNote] = useState('');

  useEffect(() => {
    if (document.getElementById('ab-fonts')) return;
    const l = document.createElement('link');
    l.id   = 'ab-fonts';
    l.rel  = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  }, []);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectBookingId, setRejectBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectClick = (bookingId) => {
    setRejectBookingId(bookingId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleActionClick = (type, bookingId) => {
    setActionModal({ open: true, type, bookingId });
    setCancelNote('');
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim()) {
      rejectBooking.mutate({ id: rejectBookingId, reason: rejectReason.trim() });
      setShowRejectModal(false);
      setRejectBookingId(null);
      setRejectReason('');
    }
  };

  const handleActionConfirm = async () => {
    if (actionModal.type === 'approve') {
      await approveBooking.mutateAsync(actionModal.bookingId);
    } else if (actionModal.type === 'cancel' && cancelNote.trim()) {
      await cancelBooking.mutateAsync({ id: actionModal.bookingId, reason: cancelNote.trim() });
    }
    setActionModal({ open: false, type: null, bookingId: null });
    setCancelNote('');
  };

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'PENDING').length,
    approved:  bookings.filter(b => b.status === 'APPROVED').length,
    rejected:  bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const filtered = sortedBookings
    .filter(b => {
      if (activeTab === 'all') return true;
      return b.status === activeTab.toUpperCase();
    })
    .filter(b => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return b.resourceName?.toLowerCase().includes(q) ||
             b.userName?.toLowerCase().includes(q) ||
             b.purpose?.toLowerCase().includes(q);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const pagedBookings = filtered.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE);

  const containerV = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
  };
  const rowV = {
    hidden:  { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] } },
    exit:    { opacity: 0, x: 10, transition: { duration: 0.14 } },
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes ab-pulse {
          0%   { transform: scale(1);   opacity: 0.9; }
          70%  { transform: scale(2.6); opacity: 0;   }
          100% { transform: scale(2.6); opacity: 0;   }
        }
        @keyframes ab-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .ab-skel {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%);
          background-size: 200% 100%;
          animation: ab-shimmer 1.8s infinite;
          border-radius: 6px;
        }
        .ab-row { transition: background 0.14s ease; }
        .ab-row:hover { background: rgba(99,102,241,0.05) !important; }
        .ab-row:hover .ab-actions { opacity: 1 !important; transform: translateX(0) !important; }
        .ab-actions { opacity: 0; transform: translateX(8px); transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .ab-act-btn { transition: transform 0.14s ease, box-shadow 0.14s ease; }
        .ab-act-btn:hover { transform: scale(1.18) !important; }
        .ab-search:focus { box-shadow: 0 0 0 2px rgba(99,102,241,0.35); outline: none; }
        .ab-tab { transition: all 0.18s ease; }
        .ab-stat-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .ab-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
      `}</style>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        {STAT_CARDS.map((card, i) => {
          const isActive = activeTab === card.key;
          const count    = stats[card.statKey];
          return (
            <motion.button
              key={card.key}
              className="ab-stat-card"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => setActiveTab(card.key)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 12,
                padding: '14px 16px 14px 20px',
                position: 'relative',
                overflow: 'hidden',
                background: isActive
                  ? `linear-gradient(135deg, ${card.color}20, ${card.color}0a)`
                  : 'rgba(15,20,35,0.85)',
                border: `1px solid ${isActive ? card.color + '45' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {/* left bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: 3, height: '100%',
                background: card.color,
                boxShadow: isActive ? `0 0 10px ${card.color}70` : 'none',
                borderRadius: '12px 0 0 12px',
              }} />
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: isActive ? card.color : '#475569', marginBottom: 6 }}>
                {card.label}
              </p>
              <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: isActive ? card.color : '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>
                {count}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.38 }}
        style={{
          background: 'rgba(13,18,30,0.92)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          overflow: 'hidden',
          backdropFilter: 'blur(14px)',
        }}
      >
        {/* ── Toolbar ── */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {STAT_CARDS.map(card => {
              const isActive = activeTab === card.key;
              const count    = stats[card.statKey];
              return (
                <button
                  key={card.key}
                  className="ab-tab"
                  onClick={() => {
                    setActiveTab(card.key);
                    setCurrentPage(0);
                  }}
                  style={{
                    padding: '6px 13px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                    border: `1px solid ${isActive ? card.color + '50' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive ? card.color + '18' : 'transparent',
                    color: isActive ? card.color : '#64748b',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {card.label}
                  <span style={{
                    padding: '1px 6px', borderRadius: 4,
                    fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    background: isActive ? card.color + '28' : 'rgba(255,255,255,0.07)',
                    color: isActive ? card.color : '#475569',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: 210 }}>
            <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 15, pointerEvents: 'none' }} />
              <input
                className="ab-search"
                type="text"
                placeholder="Search bookings…"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
                fontSize: 14, fontFamily: "'Outfit', sans-serif",
                transition: 'box-shadow 0.2s',
              }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        {isLoading ? (
          <div style={{ padding: '8px 18px 18px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="ab-skel" style={{ width: 3, height: 36, borderRadius: 2, flexShrink: 0 }} />
                <div className="ab-skel" style={{ width: 130, height: 13 }} />
                <div className="ab-skel" style={{ width: 80,  height: 13 }} />
                <div className="ab-skel" style={{ flex: 1,    height: 13 }} />
                <div className="ab-skel" style={{ width: 110, height: 13 }} />
                <div className="ab-skel" style={{ width: 72,  height: 22, borderRadius: 20 }} />
                <div className="ab-skel" style={{ width: 56,  height: 13 }} />
                <div className="ab-skel" style={{ width: 60,  height: 13 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MdCancel style={{ fontSize: 22, color: '#475569' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>No bookings found</p>
            <p style={{ fontSize: 13, color: '#475569' }}>
              {searchQuery ? 'Try adjusting your search query' : `No ${activeTab === 'all' ? '' : activeTab} bookings to display`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {COLS.map((h, i) => (
                    <th key={i} style={{
                      padding: '12px 16px',
                      textAlign: i === COLS.length - 1 ? 'right' : 'left',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#475569', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={containerV} initial="hidden" animate="visible">
                <AnimatePresence>
                  {pagedBookings.map(booking => {
                    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                    return (
                      <motion.tr
                        key={booking.id}
                        variants={rowV}
                        className="ab-row"
                        onMouseEnter={() => setHoveredRow(booking.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.035)' }}
                      >
                        {/* Resource + status bar */}
                        <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 3, height: 36, borderRadius: 2, flexShrink: 0,
                              background: cfg.color,
                              boxShadow: hoveredRow === booking.id ? `0 0 8px ${cfg.color}70` : 'none',
                              transition: 'box-shadow 0.15s',
                            }} />
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap' }}>{booking.resourceName}</p>
                              <p style={{ fontSize: 11, color: '#475569', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>#{booking.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* User */}
                        <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg, ${cfg.color}35, ${cfg.color}18)`,
                              border: `1px solid ${cfg.color}28`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, color: cfg.color,
                            }}>
                              {booking.userName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <p style={{ fontSize: 13, color: '#cbd5e1', whiteSpace: 'nowrap' }}>{booking.userName}</p>
                          </div>
                        </td>

                        {/* Purpose */}
                        <td style={{ padding: '13px 16px', verticalAlign: 'middle', maxWidth: 190 }}>
                          <p style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.purpose}
                          </p>
                          {booking.additionalEquipmentSummary && (
                            <p style={{ fontSize: 11, color: '#818cf8', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Extra: {booking.additionalEquipmentSummary}
                            </p>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                            {booking.formattedStartTime}
                          </p>
                          <p style={{ fontSize: 11, color: '#475569', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                            → {booking.formattedEndTime}
                          </p>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: 20,
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            whiteSpace: 'nowrap',
                          }}>
                            <div style={{ position: 'relative', width: 6, height: 6, flexShrink: 0 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                              {cfg.pulse && (
                                <div style={{
                                  position: 'absolute', inset: 0, borderRadius: '50%',
                                  background: cfg.color,
                                  animation: 'ab-pulse 1.6s ease-out infinite',
                                }} />
                              )}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, letterSpacing: '0.05em' }}>
                              {booking.status}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  className="ab-act-btn"
                                  onClick={() => handleActionClick('approve', booking.id)}
                                  title="Approve"
                                  style={{
                                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                                    border: '1px solid rgba(16,185,129,0.45)',
                                    background: 'rgba(16,185,129,0.15)',
                                    color: '#10b981',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    fontSize: 13, fontWeight: 700,
                                  }}
                                >
                                  <MdCheck style={{ fontSize: 16 }} /> Approve
                                </button>
                                <button
                                  className="ab-act-btn"
                                  onClick={() => handleRejectClick(booking.id)}
                                  title="Reject"
                                  style={{
                                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                                    border: '1px solid rgba(244,63,94,0.45)',
                                    background: 'rgba(244,63,94,0.15)',
                                    color: '#f43f5e',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    fontSize: 13, fontWeight: 700,
                                  }}
                                >
                                  <MdClose style={{ fontSize: 16 }} /> Reject
                                </button>
                              </>
                            )}
                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                              <button
                                className="ab-act-btn"
                                onClick={() => handleActionClick('cancel', booking.id)}
                                title="Cancel"
                                style={{
                                  width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                                  border: '1px solid rgba(100,116,139,0.3)',
                                  background: 'rgba(100,116,139,0.08)',
                                  color: '#64748b',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 16,
                                }}
                              >
                                <MdCancel />
                              </button>
                            )}
                            {booking.status !== 'PENDING' && booking.status !== 'APPROVED' && (
                              <span style={{ fontSize: 12, color: '#1e293b' }}>—</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}

        {/* ── Footer ── */}
        {!isLoading && filtered.length > 0 && (
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: 12, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
              {filtered.length} booking{filtered.length !== 1 ? 's' : ''} · page {safeCurrentPage + 1} of {totalPages}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
                disabled={safeCurrentPage === 0}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: safeCurrentPage === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.12)',
                  color: safeCurrentPage === 0 ? '#475569' : '#818cf8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: safeCurrentPage === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
                disabled={safeCurrentPage >= totalPages - 1}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: safeCurrentPage >= totalPages - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.12)',
                  color: safeCurrentPage >= totalPages - 1 ? '#475569' : '#818cf8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: safeCurrentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {STAT_CARDS.slice(1).map(c => (
                  <div key={c.key} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: c.color,
                    opacity: stats[c.statKey] > 0 ? 0.65 : 0.12,
                    transition: 'opacity 0.3s',
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              background: 'rgba(13,18,30,0.97)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: 16, padding: 28,
              width: '100%', maxWidth: 420,
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
              Reject Booking
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Please provide a reason for rejection. This will be shown to the user.
            </p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Time slot conflicts with a scheduled event..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: 10, border: '1px solid rgba(244,63,94,0.3)',
                background: 'rgba(244,63,94,0.06)', color: '#f1f5f9',
                fontSize: 14, fontFamily: "'Outfit', sans-serif",
                resize: 'none', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || rejectBooking.isPending}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid rgba(244,63,94,0.4)',
                  background: rejectReason.trim() ? 'rgba(244,63,94,0.2)' : 'rgba(244,63,94,0.06)',
                  color: rejectReason.trim() ? '#f43f5e' : '#475569',
                  fontSize: 14, fontWeight: 700,
                  transition: 'all 0.15s',
                }}
              >
                {rejectBooking.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {actionModal.open && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setActionModal({ open: false, type: null, bookingId: null })}
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-2xl"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                actionModal.type === 'approve'
                  ? 'from-emerald-500 via-emerald-400 to-cyan-400'
                  : 'from-rose-500 via-orange-400 to-amber-400'
              }`} />

              <div className="flex items-start justify-between gap-4 p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    actionModal.type === 'approve'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300'
                  }`}>
                    {actionModal.type === 'approve' ? <MdCheck className="text-2xl" /> : <MdCancel className="text-2xl" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {actionModal.type === 'approve' ? 'Approve booking?' : 'Cancel booking?'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {actionModal.type === 'approve'
                        ? 'Are you sure you want to approve this booking? The user will be notified.'
                        : 'Are you sure you want to cancel this booking? Please add a short note so the user knows why it was cancelled.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, type: null, bookingId: null })}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>

              {actionModal.type === 'cancel' && (
                <div className="px-6 pb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Cancellation note
                  </label>
                  <textarea
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder="Example: Maintenance work was scheduled for this room."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-400/40"
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 dark:border-slate-700/60 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, type: null, bookingId: null })}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleActionConfirm}
                  disabled={actionModal.type === 'cancel' && !cancelNote.trim()}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    actionModal.type === 'approve'
                      ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700'
                      : 'bg-rose-600 shadow-rose-500/20 hover:bg-rose-700'
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

export default AdminBookingsPage;
