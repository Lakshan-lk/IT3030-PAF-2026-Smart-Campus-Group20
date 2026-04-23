import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../api/ticketApi';

export function useTickets(params = {}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketApi.getAll(params).then((res) => res.data),
  });
}

export function useTicketById(id) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ticketApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => ticketApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeId }) => ticketApi.assign(id, assigneeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => ticketApi.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => ticketApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useComments(ticketId) {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () => ticketApi.getComments(ticketId).then((res) => res.data),
    enabled: !!ticketId,
  });
}

export function useAddComment(ticketId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ticketApi.addComment(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
    },
  });
}

export function useUpdateComment(ticketId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }) => ticketApi.updateComment(ticketId, commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
    },
  });
}

export function useDeleteComment(ticketId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, userId }) => ticketApi.deleteComment(ticketId, commentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
    },
  });
}
