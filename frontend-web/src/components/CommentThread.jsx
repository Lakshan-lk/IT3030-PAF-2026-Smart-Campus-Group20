import React, { useMemo, useState } from 'react';
import { MdEdit, MdDelete, MdSend, MdPerson } from 'react-icons/md';
import { useAddComment, useComments, useDeleteComment, useUpdateComment } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';

function formatTimestamp(value) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

const CommentThread = ({ ticketId }) => {
  const { data: comments = [], isLoading } = useComments(ticketId);
  const addComment = useAddComment(ticketId);
  const updateComment = useUpdateComment(ticketId);
  const deleteComment = useDeleteComment(ticketId);
  const { authUser } = useAuth();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const sortedComments = useMemo(() => comments ?? [], [comments]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    if (!authUser?.id) {
      return;
    }
    await addComment.mutateAsync({ userId: authUser.id, content });
    setContent('');
  };

  const beginEdit = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const saveEdit = async (commentId) => {
    if (!editingContent.trim()) {
      return;
    }
    if (!authUser?.id) {
      return;
    }
    await updateComment.mutateAsync({
      commentId,
      data: { userId: authUser.id, content: editingContent },
    });
    setEditingId(null);
    setEditingContent('');
  };

  const removeComment = async (commentId, userId) => {
    await deleteComment.mutateAsync({ commentId, userId });
  };

  return (
    <section className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Discussion</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Comments</h3>
        </div>
        <span className="rounded-full bg-slate-100 dark:bg-slate-700/50 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {sortedComments.length}
        </span>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700/50" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700/50" />
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No comments yet. Start the conversation below.
          </div>
        ) : (
          sortedComments.map((comment) => {
            const isOwner = authUser?.id && comment.userId === authUser.id;
            const isEditing = editingId === comment.id;
            return (
              <article
                key={comment.id}
                className="rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="h-full w-full object-cover" />
                    ) : (
                      <MdPerson className="text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{comment.userName}</p>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatTimestamp(comment.createdAt)}</span>
                    </div>

                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={editingContent}
                          onChange={(event) => setEditingContent(event.target.value)}
                          rows={3}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditingContent('');
                            }}
                            className="rounded-xl border border-slate-200 dark:border-slate-700/50 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(comment.id)}
                            className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.content}</p>
                    )}
                  </div>

                  {isOwner && !isEditing && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => beginEdit(comment)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-amber-500"
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeComment(comment.id, authUser.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-rose-500"
                        title="Delete"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Add a comment</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            placeholder="Write a helpful update..."
            className="min-h-24 flex-1 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <button
            type="submit"
            disabled={addComment.isPending || !authUser?.id}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-36"
          >
            <MdSend className="text-lg" />
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default CommentThread;
