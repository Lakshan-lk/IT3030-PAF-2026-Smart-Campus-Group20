import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentBookingApi } from '../api/equipmentBookingApi';

export const useEquipmentBookings = (filters = {}) => {
  return useQuery({
    queryKey: ['equipmentBookings', filters],
    queryFn: async () => {
      const response = await equipmentBookingApi.getAll(filters);
      return response.data;
    },
  });
};

export const useCreateEquipmentBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => equipmentBookingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipmentBookings']);
    },
  });
};

export const useApproveEquipmentBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => equipmentBookingApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipmentBookings']);
    },
  });
};

export const useRejectEquipmentBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => equipmentBookingApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipmentBookings']);
    },
  });
};

export const useCancelEquipmentBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => equipmentBookingApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['equipmentBookings']);
    },
  });
};
