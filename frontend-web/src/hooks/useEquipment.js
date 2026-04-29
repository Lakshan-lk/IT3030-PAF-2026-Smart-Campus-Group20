import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '../api/equipmentApi';

export function useAvailableEquipment(excludeRoomId) {
  return useQuery({
    queryKey: ['equipment', 'available', excludeRoomId],
    queryFn: () => equipmentApi.getAvailableForRoom(excludeRoomId).then(res => res.data),
    enabled: !!excludeRoomId,
  });
}

export function useAllEquipment() {
  return useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: () => equipmentApi.getAll().then(res => res.data),
  });
}

export function useEquipmentByRoom(roomId) {
  return useQuery({
    queryKey: ['equipment', 'room', roomId],
    queryFn: () => equipmentApi.getByRoom(roomId).then(res => res.data),
    enabled: !!roomId,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => equipmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
