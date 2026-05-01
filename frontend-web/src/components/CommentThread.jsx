import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSend, MdPerson, MdDelete, MdEdit, MdCheck, MdClose, MdLock, MdChat } from 'react-icons/md';
import { useAddComment, useComments, useDeleteComment, useUpdateComment } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';

function formatTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(value));
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const ROLE_STYLE = {
  ADMIN:      { bg: 'bg-purple-500', label: 'Admin',      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  TECHNICIAN: { bg: 'bg-sky-500',    label: 'Technician', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  USER:       { bg: 'bg-amber-500',  label: 'User',       badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
};

function getRoleStyle(role = '') {
  return ROLE_STYLE[(role || '').toUpperCase()] || ROLE_STYLE.USER;
}

// ── Single chat bubble ──────────────────────────────────────────────────────
const ChatBubble = ({ comment, isMine, canModerate, canEditOwn, onEdit, onDelete }) => {
  const rs = getRoleStyle(comment.userRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`flex items-end gap-2 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${rs.bg}`}>
        {getInitials(comment.userName)}
      </div>

      <div className={`flex flex-col max-w-[75%] gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Name + role + time */}
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="font-bold text-slate-600 dark:text-slate-300">{comment.userName}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${rs.badge}`}>{rs.label}</span>
          {comment.isInternal && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <MdLock className="text-[9px]" /> Internal
            </span>
          )}
          <span>{formatTime(comment.createdAt)}</span>
        </div>

        {/* Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${
            isMine
              ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-sm'
              : comment.isInternal
                ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/40 text-rose-800 dark:text-rose-200 rounded-bl-sm'
                : 'bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 rounded-bl-sm'
          }`}
        >
          {comment.content}
          {/* Tail */}
          {isMine ? (
            <span className="absolute -right-1 bottom-1 w-3 h-3 bg-orange-500 clip-tail-right" style={{ borderRadius: '0 0 0 8px' }} />
          ) : (
            <span className="absolute -left-1 bottom-1 w-3 h-3 bg-white dark:bg-slate-700" style={{ borderRadius: '0 0 8px 0', border: '1px solid #e2e8f0' }} />
          )}
        </div>

        {/* Action buttons — only mine */}
        {((isMine && canEditOwn) || canModerate) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(comment)}
              className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <MdEdit className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment)}
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <MdDelete className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Date separator ──────────────────────────────────────────────────────────
const DateSeparator = ({ label }) => (
  <div className="flex items-center gap-3 my-3">
    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
  </div>
);

// ── Main Chat component ─────────────────────────────────────────────────────
const CommentThread = ({ ticketId }) => {
  const { data: comments = [], isLoading } = useComments(ticketId);
  const addComment  = useAddComment(ticketId);
  const updateComment = useUpdateComment(ticketId);
  const deleteComment = useDeleteComment(ticketId);
  const { authUser } = useAuth();

  const [message, setMessage]       = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent]       = useState('');
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const currentRole = (authUser?.role || '').toLowerCase();
  const isAdminViewer = currentRole === 'admin';
  const isTechnician = currentRole === 'technician';
  const canCompose = !isAdminViewer && (currentRole === 'user' || isTechnician);
  const canUseInternalNotes = isTechnician;
  const composerModeLabel = isInternal ? 'Internal note' : 'Public reply';
  const composerHelperText = isInternal
    ? 'Visible only to the ticket owner and technicians.'
    : 'Visible to the ticket owner and staff.';

  // Filter internal messages for regular users
  const visibleComments = isAdminViewer || isTechnician
    ? (comments ?? [])
    : (comments ?? []).filter(c => !c.isInternal);

  // Group messages by date
  const grouped = visibleComments.reduce((acc, c) => {
    const dayKey = c.createdAt
      ? new Date(c.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Unknown';
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(c);
    return acc;
  }, {});

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !authUser?.id) return;
    if (isAdminViewer) return;
    await addComment.mutateAsync({
      userId: authUser.id,
      content: message.trim(),
      isInternal: canUseInternalNotes ? isInternal : false,
    });
    setMessage('');
    setIsInternal(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const saveEdit = async () => {
    if (!editContent.trim() || !authUser?.id) return;
    await updateComment.mutateAsync({ commentId: editingComment.id, data: { userId: authUser.id, content: editContent.trim() } });
    setEditingComment(null);
    setEditContent('');
  };

  const handleDelete = async (comment) => {
    await deleteComment.mutateAsync({ commentId: comment.id, userId: authUser.id });
  };

  return (
    <section className="flex flex-col rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm overflow-hidden" style={{ minHeight: 360 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/80 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <MdChat className="text-white text-lg" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">Live Chat</p>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ticket Discussion</h3>
        </div>
        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2.5 py-1">
          {visibleComments.length} message{visibleComments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-slate-50/60 dark:bg-slate-900/30" style={{ minHeight: 200, maxHeight: 340 }}>
        {isLoading ? (
          <div className="flex flex-col gap-3 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                <div className="h-12 w-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            ))}
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-500">
            <MdChat className="text-4xl opacity-30" />
            <p className="text-sm font-medium">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              <DateSeparator label={day} />
              <div className="space-y-3">
                {msgs.map(comment => (
                  <ChatBubble
                    key={comment.id}
                    comment={comment}
                    isMine={authUser?.id === comment.userId}
                    canModerate={isTechnician}
                    canEditOwn={!isAdminViewer}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit banner */}
      <AnimatePresence>
        {editingComment && !isAdminViewer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-700/40 flex items-start gap-3"
          >
            <div className="flex-1 space-y-2">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">✏️ Editing message</p>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400/40 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1 shrink-0 pt-5">
              <button onClick={saveEdit} className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"><MdCheck /></button>
              <button onClick={() => { setEditingComment(null); setEditContent(''); }} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"><MdClose /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <form onSubmit={handleSend} className="shrink-0 border-t border-slate-100 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/80 px-4 py-3">
        {!isAdminViewer && canCompose && canUseInternalNotes ? (
          <div className="mb-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30 p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternal(false)}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                  !isInternal
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Public Reply
              </button>
              <button
                type="button"
                onClick={() => setIsInternal(true)}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                  isInternal
                    ? 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-600'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <MdLock className="text-xs" />
                  Internal Note
                </span>
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 px-1">
              <p className={`text-[10px] font-semibold ${isInternal ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {composerModeLabel}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{composerHelperText}</p>
            </div>
          </div>
        ) : !isAdminViewer && canCompose ? (
          <div className="mb-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Public reply</p>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Replies from users stay public. Technicians can add internal notes.
            </p>
          </div>
        ) : null}
        {canCompose && (
          <div className="flex items-end gap-2">
            <div className={`flex-1 rounded-2xl border transition-all ${
              isInternal
                ? 'border-rose-300 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-900/10'
                : 'border-slate-200 dark:border-slate-600/50 bg-slate-50 dark:bg-slate-900/50'
            }`}>
              <textarea
                ref={inputRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={isInternal ? 'Write an internal note... (staff only)' : 'Write a public reply... (Enter to send, Shift+Enter for new line)'}
                className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none resize-none placeholder:text-slate-400"
                style={{ minHeight: 40, maxHeight: 100 }}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || addComment.isPending}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
                isInternal
                  ? 'bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-rose-500/25 hover:from-rose-600 hover:to-fuchsia-600'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600'
              }`}
            >
              <MdSend className="text-lg" />
            </button>
          </div>
        )}
      </form>
    </section>
  );
};

export default CommentThread;
