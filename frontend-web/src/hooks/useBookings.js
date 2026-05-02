import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';
import { normalizeBookingStatus } from '../utils/status';

const normalizeBooking = (booking) => ({
  ...booking,
  status: normalizeBookingStatus(booking?.status),
});

export function useBookings(params = {}, options = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingApi.getAll(params).then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        return data.map(normalizeBooking);
      }
      if (data?.content && Array.isArray(data.content)) {
        return { ...data, content: data.content.map(normalizeBooking) };
      }
      return data;
    }),
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useBookingById(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingApi.getById(id).then(res => normalizeBooking(res.data)),
    enabled: !!id,
  });
}

export function useActiveBookingsCount() {
  return useQuery({
    queryKey: ['bookings', 'stats', 'active'],
    queryFn: () => bookingApi.getActiveCount().then(res => res.data),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bookingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useApproveBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (typeof input === 'object' && input !== null) {
        return bookingApi.cancel(input.id, input.reason);
      }
      return bookingApi.cancel(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId) => bookingApi.cancelSeries(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
