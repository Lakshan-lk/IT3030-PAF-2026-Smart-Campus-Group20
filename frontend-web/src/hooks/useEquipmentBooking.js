import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentBookingApi } from '../api/equipmentBookingApi';
import { normalizeBookingStatus } from '../utils/status';

const normalizeBooking = (booking) => ({
    ...booking,
    status: normalizeBookingStatus(booking?.status),
});

export function useCreateEquipmentBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => equipmentBookingApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment-bookings'] });
        }
    });
}

export function useAllEquipmentBookings(params = { page: 0, size: 100 }) {
    return useQuery({
        queryKey: ['equipment-bookings', 'all', params],
        queryFn: () => equipmentBookingApi.getAll(params).then(res => {
            const data = res.data;
            if (Array.isArray(data)) {
                return data.map(normalizeBooking);
            }
            if (data?.content && Array.isArray(data.content)) {
                return { ...data, content: data.content.map(normalizeBooking) };
            }
            return data;
        })
    });
}

export function useMyEquipmentBookings(params = { page: 0, size: 100 }) {
    return useQuery({
        queryKey: ['equipment-bookings', 'my', params],
        queryFn: () => equipmentBookingApi.getMyBookings(params).then(res => {
            const data = res.data;
            if (Array.isArray(data)) {
                return data.map(normalizeBooking);
            }
            if (data?.content && Array.isArray(data.content)) {
                return { ...data, content: data.content.map(normalizeBooking) };
            }
            return data;
        })
    });
}

export function useApproveEquipmentBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => equipmentBookingApi.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment-bookings'] });
        }
    });
}

export function useRejectEquipmentBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => equipmentBookingApi.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment-bookings'] });
        }
    });
}

export function useDeleteEquipmentBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => equipmentBookingApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment-bookings'] });
        }
    });
}
