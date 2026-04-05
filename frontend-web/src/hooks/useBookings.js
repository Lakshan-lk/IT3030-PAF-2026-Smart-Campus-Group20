import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';

export function useBookings(params = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingApi.getAll(params).then(res => res.data),
  });
}

export function useBookingById(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingApi.getById(id).then(res => res.data),
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
    mutationFn: (id) => bookingApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingApi.cancel(id),
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
